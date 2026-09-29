import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Clock, Trash2, ChevronDown, ChevronUp, List, Grid3X3, Image, Eye, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Recipe } from '../services/api';
import { MEAL_TYPES } from '../constants';

type ViewMode = 'list' | 'grid';

interface Props {
  onEditRecipe?: (recipe: Recipe) => void;
  onAddRecipe?: () => void;
}

export function RecipeList({ onEditRecipe, onAddRecipe }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userFamily, setUserFamily] = useState<any>(null);

  useEffect(() => {
    loadRecipes();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profileResponse = await api.getProfile();
      setCurrentUser(profileResponse.data.user);
      
      if (profileResponse.data.family) {
        const familyResponse = await api.getFamily();
        setUserFamily(familyResponse.data.family);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    }
  };

  // Проверка прав на удаление блюда
  const canDeleteRecipe = (recipe: Recipe): boolean => {
    if (!currentUser) return false;
    
    // Владелец блюда всегда может удалить
    if (recipe.user_id === currentUser.id) return true;
    
    // Глава семьи может удалить любое блюдо
    if (userFamily && userFamily.owner_id === currentUser.id) return true;
    
    // Поварушка может удалить любое блюдо
    if (userFamily) {
      const member = userFamily.members?.find((m: any) => m.id === currentUser.id);
      if (member && member.role === 'chef') return true;
    }
    
    return false;
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await api.getRecipes();
      setRecipes(response.data.recipes);
    } catch (error: any) {
      console.error('Ошибка загрузки рецептов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это блюдо?')) return;
    
    try {
      await api.deleteRecipe(recipeId);
      await loadRecipes();
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления блюда');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка блюд...</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-5xl">🍽️</span>
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Пока нет блюд</h2>
        <p className="text-gray-500 mb-6">Добавьте свои любимые блюда, чтобы потом спросить партнёра!</p>
        <button
          onClick={onAddRecipe}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Создать новое блюдо
        </button>
      </motion.div>
    );
  }

  // Группируем все категории в единый список
  const allCategories: Record<string, Recipe[]> = {};
  
  MEAL_TYPES.forEach((mt) => {
    const categoryRecipes = recipes.filter((r) => r.meal_type === mt.id);
    if (categoryRecipes.length > 0) {
      allCategories[mt.id] = categoryRecipes;
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
          <div>
            <h2 className="text-lg font-bold text-gray-800">Моё меню</h2>
            <p className="text-sm text-gray-500">
              {recipes.length} {recipes.length === 1 ? 'блюдо' : recipes.length < 5 ? 'блюда' : 'блюд'}
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
          {Object.entries(allCategories).map(([type, categoryRecipes]) => {
            const mealType = MEAL_TYPES.find((m) => m.id === type);
            return (
              <div key={type}>
                {/* Collapsible Header */}
                <button
                  onClick={() => toggleCategory(type)}
                  className="w-full flex items-center justify-between mb-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-purple-300 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                    <span className="text-lg">{mealType?.emoji}</span>
                    <span>{mealType?.name}</span>
                    <span className="text-xs text-purple-400 font-normal">({categoryRecipes.length})</span>
                  </h3>
                  <div className="p-1 rounded-lg bg-purple-50">
                    {collapsedCategories.has(type) ? (
                      <ChevronDown className="w-4 h-4 text-purple-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-purple-500" />
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
                      {categoryRecipes.map((recipe, index) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          onDelete={handleDeleteRecipe}
                          onView={setSelectedRecipe}
                          index={index}
                          canDelete={canDeleteRecipe(recipe)}
                        />
                      ))}
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
          {Object.entries(allCategories).map(([type, categoryRecipes]) => {
            const mealType = MEAL_TYPES.find((m) => m.id === type);
            return (
              <div key={type}>
                <button
                  onClick={() => toggleCategory(type)}
                  className="w-full flex items-center justify-between mb-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-purple-300 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                    <span className="text-lg">{mealType?.emoji}</span>
                    <span>{mealType?.name}</span>
                    <span className="text-xs text-purple-400 font-normal">({categoryRecipes.length})</span>
                  </h3>
                  <div className="p-1 rounded-lg bg-purple-50">
                    {collapsedCategories.has(type) ? (
                      <ChevronDown className="w-4 h-4 text-purple-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-purple-500" />
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
                      {categoryRecipes.map((recipe, index) => (
                        <RecipeGridCard
                          key={recipe.id}
                          recipe={recipe}
                          onDelete={handleDeleteRecipe}
                          onView={setSelectedRecipe}
                          index={index}
                          canDelete={canDeleteRecipe(recipe)}
                        />
                      ))}
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
}: {
  recipe: Recipe;
  onDelete: (id: number) => void;
  onView: (recipe: Recipe) => void;
  index: number;
  canDelete: boolean;
}) {
  const images = recipe.image_urls || [];
  
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
            src={images[0] || ''}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f97316" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="30">🍽️</text></svg>';
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
            {recipe.author_name && recipe.author_avatar && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{recipe.author_avatar}</span>
                <span>{recipe.author_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatIngredients()}</span>
            </div>
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
}: {
  recipe: Recipe;
  onDelete: (id: number) => void;
  onView: (recipe: Recipe) => void;
  index: number;
  canDelete: boolean;
}) {
  const images = recipe.image_urls || [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const mealType = MEAL_TYPES.find((m) => m.id === recipe.meal_type);

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
          src={images[currentImageIndex] || ''}
          alt={recipe.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f97316" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="30">🍽️</text></svg>';
          }}
          loading="lazy"
        />
        
        {/* Swipe buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          {recipe.author_name && recipe.author_avatar ? (
            <div className="flex items-center gap-1">
              <span className="text-xs">{recipe.author_avatar}</span>
              <span className="text-xs text-gray-400">{recipe.author_name}</span>
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

// Компонент RecipeDetail (упрощенная версия)
function RecipeDetail({
  recipe,
  onBack,
  onEdit,
}: {
  recipe: Recipe;
  onBack: () => void;
  onEdit?: () => void;
}) {
  const images = recipe.image_urls || [];
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

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800">Детали блюда</h2>
      </div>

      {/* Image Gallery Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div
          className="relative aspect-[4/3]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            src={images[currentImageIndex] || ''}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f97316" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="30">🍽️</text></svg>';
            }}
          />

          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title & Description Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{recipe.name}</h1>
            {recipe.description && (
              <p className="text-gray-500 mt-2">{recipe.description}</p>
            )}
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-shrink-0 w-10 h-10 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full flex items-center justify-center transition-colors"
              title="Редактировать"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Ingredients Card */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">🥘</span> Ингредиенты
            <span className="text-xs text-gray-400 font-normal">({recipe.ingredients.length})</span>
          </h3>
          <div className="bg-orange-50/50 rounded-xl px-4 py-2 border border-orange-100">
            <div className="divide-y divide-orange-100">
              {recipe.ingredients.map((ing) => (
                <div key={ing.id || ing.name} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-800">{ing.name}</span>
                  <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    {ing.amount && ing.unit ? `${ing.amount} ${ing.unit}` : ing.amount || 'по вкусу'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cooking Steps Card */}
      {recipe.cooking_steps && recipe.cooking_steps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">👨‍🍳</span> Способ приготовления
          </h3>
          <div className="space-y-3">
            {recipe.cooking_steps.map((step, index) => (
              <div key={step.id || index} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1">{step.text}</p>
                  {step.imageUrl && (
                    <img
                      src={step.imageUrl}
                      alt={step.title}
                      className="mt-2 w-full h-32 object-cover rounded-xl"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Добавлено {new Date(recipe.created_at).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
