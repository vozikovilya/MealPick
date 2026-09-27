import { useState } from 'react';
import { Recipe } from '../types';
import { ArrowLeft, Clock, ChefHat, Play, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAllMealTypes } from '../store';
import { getRecipeImage, getRecipeImages, FALLBACK_IMAGE } from '../utils';

interface Props {
  recipe: Recipe;
  onBack: () => void;
  onEdit?: () => void;
}

export function RecipeDetail({ recipe, onBack, onEdit }: Props) {
  const allMealTypes = useAllMealTypes();
  const mealType = allMealTypes.find((m) => m.id === recipe.mealType);
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

  const formatIngredient = (ing: { name: string; amount?: string; unit?: string }) => {
    if (ing.amount && ing.unit) return `${ing.amount} ${ing.unit}`;
    if (ing.amount) return ing.amount;
    return 'по вкусу';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-0"
    >
      {/* Image Gallery */}
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-b-3xl"
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

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Meal type badge */}
        {mealType && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium shadow-lg">
            {mealType.emoji} {mealType.name}
          </div>
        )}

        {/* Image navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Content */}
      <div className="px-4 py-5 space-y-5">
        {/* Title & Description */}
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
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Video */}
        {recipe.videoUrl && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Play className="w-4 h-4" /> Видео
            </h3>
            <video src={recipe.videoUrl} controls className="w-full rounded-xl" />
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-lg">🥘</span> Ингредиенты
              <span className="text-xs text-gray-400 font-normal">({recipe.ingredients.length})</span>
            </h3>
            <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
              <div className="divide-y divide-orange-100">
                {recipe.ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-gray-800">{ing.name}</span>
                    <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                      {formatIngredient(ing)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cooking Steps */}
        {recipe.cookingSteps && recipe.cookingSteps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ChefHat className="w-4 h-4" /> Способ приготовления
            </h3>
            <div className="space-y-3">
              {recipe.cookingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      {index + 1}
                    </div>
                    {index < recipe.cookingSteps!.length - 1 && (
                      <div className="w-0.5 h-full bg-orange-200 mx-auto mt-1" style={{ minHeight: '20px' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed mt-1">{step.text}</p>
                    {step.imageUrl && (
                      <img
                        src={step.imageUrl}
                        alt={`Шаг ${index + 1}`}
                        className="mt-2 w-full h-32 object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Добавлено {new Date(recipe.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
