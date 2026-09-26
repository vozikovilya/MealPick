import { useState } from 'react';
import { useStore } from '../store';
import { Recipe } from '../types';
import { Clock, Trash2, ChevronDown, ChevronRight, List, Grid3X3, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecipeImage, getRecipeImages, FALLBACK_IMAGE } from '../utils';

type ViewMode = 'list' | 'grid';

export function RecipeList() {
  const { users, currentUserId, deleteRecipe } = useStore();
  const currentUser = users.find((u) => u.id === currentUserId);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  if (!currentUser || currentUser.recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Пока нет рецептов</h2>
        <p className="text-gray-500">Добавьте свои любимые блюда, чтобы потом спросить партнёра!</p>
      </div>
    );
  }

  const mealTypeLabels: Record<string, { label: string; emoji: string }> = {
    breakfast: { label: 'Завтрак', emoji: '🌅' },
    lunch: { label: 'Обед', emoji: '☀️' },
    dinner: { label: 'Ужин', emoji: '🌙' },
  };

  const groupedRecipes = {
    breakfast: currentUser.recipes.filter((r) => r.mealType === 'breakfast'),
    lunch: currentUser.recipes.filter((r) => r.mealType === 'lunch'),
    dinner: currentUser.recipes.filter((r) => r.mealType === 'dinner'),
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentUser.avatar}</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{currentUser.name}</h2>
            <p className="text-sm text-gray-500">{currentUser.recipes.length} рецептов</p>
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
        <div className="space-y-4">
          {Object.entries(groupedRecipes).map(([type, recipes]) =>
            recipes.length > 0 ? (
              <div key={type}>
                {/* Collapsible Header */}
                <button
                  onClick={() => toggleCategory(type)}
                  className="w-full flex items-center justify-between mb-3 p-2 rounded-xl hover:bg-orange-50/50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <span>{mealTypeLabels[type].emoji}</span>
                    <span>{mealTypeLabels[type].label}</span>
                    <span className="text-xs text-gray-400 font-normal">({recipes.length})</span>
                  </h3>
                  <div className="p-1 rounded-lg bg-gray-100">
                    {collapsedCategories.has(type) ? (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
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
                      className="space-y-3 overflow-hidden"
                    >
                      {recipes.map((recipe, index) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          onDelete={deleteRecipe}
                          index={index}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(groupedRecipes).map(([type, recipes]) =>
            recipes.map((recipe, index) => (
              <RecipeGridCard
                key={recipe.id}
                recipe={recipe}
                onDelete={deleteRecipe}
                index={index}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function RecipeCard({
  recipe,
  onDelete,
  index,
}: {
  recipe: Recipe;
  onDelete: (id: string) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex">
        <div className="w-24 h-24 flex-shrink-0 relative">
          <img
            src={getRecipeImage(recipe)}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          {getRecipeImages(recipe).length > 1 && (
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded-md flex items-center gap-0.5">
              <Image className="w-2.5 h-2.5" />
              {getRecipeImages(recipe).length}
            </div>
          )}
        </div>
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">{recipe.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{recipe.description}</p>
            </div>
            <button
              onClick={() => onDelete(recipe.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{recipe.ingredients.length} ингр.</span>
            </div>
            <div className="flex gap-1">
              {recipe.ingredients.slice(0, 3).map((ing, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] rounded-full"
                >
                  {ing}
                </span>
              ))}
              {recipe.ingredients.length > 3 && (
                <span className="text-[10px] text-gray-400">+{recipe.ingredients.length - 3}</span>
              )}
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
  index,
}: {
  recipe: Recipe;
  onDelete: (id: string) => void;
  index: number;
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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe && images.length > 1) {
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

  const mealEmoji: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Image with swipe controls */}
      <div
        className="relative aspect-square overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
        
        {/* Swipe buttons - visible on hover (desktop) and always on mobile for multi-image */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity text-lg leading-none"
            >
              ‹
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity text-lg leading-none"
            >
              ›
            </button>
            
            {/* Dots indicator - always visible for multi-image */}
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
          {mealEmoji[recipe.mealType]}
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(recipe.id)}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-semibold text-gray-800 text-sm truncate">{recipe.name}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">{recipe.ingredients.length} ингр.</span>
          </div>
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
