import { useState } from 'react';
import { useStore, useAllMealTypes } from '../store';
import { Recipe } from '../types';
import { Clock, Trash2, ChevronDown, ChevronUp, ChevronRight, List, Grid3X3, Image, Eye, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecipeImage, getRecipeImages, FALLBACK_IMAGE } from '../utils';
import { RecipeDetail } from './RecipeDetail';

type ViewMode = 'list' | 'grid';

interface Props {
  onEditRecipe?: (recipe: Recipe) => void;
  onAddRecipe?: () => void;
}

export function RecipeList({ onEditRecipe, onAddRecipe }: Props) {
  const { users, currentUserId, deleteRecipe, familyProfile } = useStore();
  const allMealTypes = useAllMealTypes();
  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) : null;
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Получаем все рецепты семьи (если есть семья) или только свои
  const allFamilyRecipes = familyProfile
    ? users
        .filter((u) => familyProfile.memberIds.includes(u.id))
        .flatMap((u) => u.recipes)
    : currentUser?.recipes || [];

  if (allFamilyRecipes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Пока нет блюд</h2>
        <p className="text-gray-500 mb-6">Добавьте свои любимые блюда, чтобы потом спросить партнёра!</p>
        <button
          onClick={onAddRecipe}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Создать новое блюдо
        </button>
      </div>
    );
  }

  // Группируем все категории в единый список
  const allCategories: Record<string, Recipe[]> = {};
  
  allMealTypes.forEach((mt) => {
    const recipes = allFamilyRecipes.filter((r) => r.mealType === mt.id);
    if (recipes.length > 0) {
      allCategories[mt.id] = recipes;
    }
  });

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Функция для проверки прав на удаление
  const canDeleteRecipe = (recipe: Recipe): boolean => {
    if (!currentUserId || !currentUser) return false;
    
    const isOwner = recipe.ownerId === currentUserId;
    const isFamilyHead = familyProfile?.ownerId === currentUserId;
    const hasChefStatus = currentUser.familyStatus?.title === 'Поварушка';
    
    return isOwner || isFamilyHead || hasChefStatus;
  };

  // Функция для получения информации об авторе
  const getRecipeAuthor = (recipe: Recipe) => {
    const author = users.find((u) => u.id === recipe.ownerId);
    return {
      name: author?.name,
      avatar: author?.avatar,
    };
  };

  // Если выбрано блюдо — показываем детали
  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        onEdit={onEditRecipe ? () => onEditRecipe(selectedRecipe) : undefined}
      />
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{familyProfile ? familyProfile.avatar : currentUser?.avatar}</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {familyProfile ? familyProfile.name : 'Моё меню'}
            </h2>
            <p className="text-sm text-gray-500">
              {allFamilyRecipes.length} {allFamilyRecipes.length === 1 ? 'блюдо' : allFamilyRecipes.length < 5 ? 'блюда' : 'блюд'}
            </p>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white shadow-sm text-orange-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white shadow-sm text-orange-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-4 py-2 px-1">
          {/* Все категории */}
          {Object.entries(allCategories).map(([type, recipes]) => {
            const mealType = allMealTypes.find((m) => m.id === type);
            return (
              <div key={type}>
                {/* Collapsible Header */}
                <button
                  onClick={() => toggleCategory(type)}
                  className="w-full flex items-center justify-between mb-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-lg">{mealType?.emoji}</span>
                    <span>{mealType?.name}</span>
                    <span className="text-xs text-gray-400 font-normal">({recipes.length})</span>
                  </h3>
                  <div className="p-1 rounded-lg bg-gray-100">
                    {collapsedCategories.has(type) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Recipes */}
                <AnimatePresence>
                  {!collapsedCategories.has(type) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 py-1"
                    >
                      {recipes.map((recipe: Recipe, index: number) => {
                        const author = getRecipeAuthor(recipe);
                        return (
                          <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onDelete={(id) => deleteRecipe(id)}
                            onView={setSelectedRecipe}
                            index={index}
                            canDelete={canDeleteRecipe(recipe)}
                            authorName={author.name}
                            authorAvatar={author.avatar}
                          />
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 px-1">
          {/* Все категории */}
          {Object.entries(allCategories).map(([type, recipes]) => {
            const mealType = allMealTypes.find((m) => m.id === type);
            return (
              <div key={type}>
                <button
                  onClick={() => toggleCategory(type)}
                  className="w-full flex items-center justify-between mb-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-lg">{mealType?.emoji}</span>
                    <span>{mealType?.name}</span>
                    <span className="text-xs text-gray-400 font-normal">({recipes.length})</span>
                  </h3>
                  <div className="p-1 rounded-lg bg-gray-100">
                    {collapsedCategories.has(type) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {!collapsedCategories.has(type) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 gap-3 py-1"
                    >
                      {recipes.map((recipe: Recipe, index: number) => {
                        const author = getRecipeAuthor(recipe);
                        return (
                          <RecipeGridCard
                            key={recipe.id}
                            recipe={recipe}
                            onDelete={(id) => deleteRecipe(id)}
                            onView={setSelectedRecipe}
                            index={index}
                            canDelete={canDeleteRecipe(recipe)}
                            authorName={author.name}
                            authorAvatar={author.avatar}
                          />
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecipeCard({
  recipe,
  onDelete,
  onView,
  index,
  canDelete,
  authorName,
  authorAvatar,
}: {
  recipe: Recipe;
  onDelete: (id: string) => void;
  onView: (recipe: Recipe) => void;
  index: number;
  canDelete: boolean;
  authorName?: string;
  authorAvatar?: string;
}) {
  const images = getRecipeImages(recipe);
  
  const formatIngredients = () => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return '0 ингр.';
    return `${recipe.ingredients.length} ингр.`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex">
        <div
          className="w-24 h-24 flex-shrink-0 relative cursor-pointer"
          onClick={() => onView(recipe)}
        >
          <img
            src={getRecipeImage(recipe)}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          {images.length > 1 && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded-md flex items-center gap-0.5">
              <Image className="w-2.5 h-2.5" />
              {images.length}
            </div>
          )}
        </div>
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 cursor-pointer" onClick={() => onView(recipe)}>
              <h4 className="font-semibold text-gray-800 text-sm">{recipe.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{recipe.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView(recipe)}
                className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"
                title="Посмотреть"
              >
                <Eye className="w-4 h-4" />
              </button>
              {canDelete && (
                <button
                  onClick={() => onDelete(recipe.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {authorName && authorAvatar && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{authorAvatar}</span>
                <span>{authorName}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatIngredients()}</span>
            </div>
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="flex gap-1">
                {recipe.ingredients.slice(0, 2).map((ing, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] rounded-full"
                  >
                    {ing.name}
                  </span>
                ))}
                {recipe.ingredients.length > 2 && (
                  <span className="text-[10px] text-gray-400">+{recipe.ingredients.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RecipeGridCard({
  recipe,
  onDelete,
  onView,
  index,
  canDelete,
  authorName,
  authorAvatar,
}: {
  recipe: Recipe;
  onDelete: (id: string) => void;
  onView: (recipe: Recipe) => void;
  index: number;
  canDelete: boolean;
  authorName?: string;
  authorAvatar?: string;
}) {
  const images = getRecipeImages(recipe);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
    if (distance < -minSwipeDistance && images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const allMealTypes = useAllMealTypes();
  const mealType = allMealTypes.find((m) => m.id === recipe.mealType);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
    >
      {/* Image with swipe controls */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer rounded-t-2xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => onView(recipe)}
      >
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          src={images[currentImageIndex] || getRecipeImage(recipe)}
          alt={recipe.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        
        {/* Swipe buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Dots indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Meal type badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
          {mealType?.emoji}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(recipe);
            }}
            className="w-7 h-7 bg-white/90 hover:bg-orange-50 text-gray-600 hover:text-orange-500 rounded-full flex items-center justify-center"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe.id);
              }}
              className="w-7 h-7 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full flex items-center justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 cursor-pointer" onClick={() => onView(recipe)}>
        <h4 className="font-semibold text-gray-800 text-sm truncate">{recipe.name}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center justify-between mt-2">
          {authorName && authorAvatar ? (
            <div className="flex items-center gap-1">
              <span className="text-xs">{authorAvatar}</span>
              <span className="text-xs text-gray-400">{authorName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                {recipe.ingredients?.length || 0} ингр.
              </span>
            </div>
          )}
          {images.length > 1 && (
            <div className="flex items-center gap-0.5 text-gray-400">
              <Image className="w-3 h-3" />
              <span className="text-[10px]">{images.length}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
