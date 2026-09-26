import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Recipe } from '../types';
import { X, Heart, Check, ArrowLeft, Send } from 'lucide-react';
import { getRecipeImage, FALLBACK_IMAGE } from '../utils';

interface Props {
  requestId: string;
  onDone: () => void;
}

export function SwipeSelector({ requestId, onDone }: Props) {
  const { swipeRequests, users, respondToSwipeRequest } = useStore();
  const request = swipeRequests.find((r) => r.id === requestId);

  if (!request) return null;

  const fromUser = users.find((u) => u.id === request.fromUserId);
  const recipes: Recipe[] = request.recipeIds
    .map((id) => {
      for (const user of users) {
        const recipe = user.recipes.find((r) => r.id === id);
        if (recipe) return recipe;
      }
      return null;
    })
    .filter(Boolean) as Recipe[];

  const categoryLabels: Record<string, string> = {
    breakfast: '🌅 Завтрак',
    lunch: '☀️ Обед',
    dinner: '🌙 Ужин',
  };

  const subtitle = request.mode === 'category' && request.category
    ? `Выберите из категории: ${categoryLabels[request.category]}`
    : `${fromUser?.name} предлагает выбрать`;

  return (
    <SwipeContent
      recipes={recipes}
      fromUser={fromUser!}
      subtitle={subtitle}
      onSubmit={(selected) => {
        respondToSwipeRequest(requestId, selected);
        onDone();
      }}
      onBack={onDone}
    />
  );
}

function SwipeContent({
  recipes,
  fromUser,
  subtitle,
  onSubmit,
  onBack,
}: {
  recipes: Recipe[];
  fromUser: { name: string; avatar: string };
  subtitle: string;
  onSubmit: (selectedIds: string[]) => void;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const recipe = recipes[currentIndex];
      if (!recipe) return;

      if (direction === 'right') {
        setSelected((prev) => [...prev, recipe.id]);
      } else {
        setSkipped((prev) => [...prev, recipe.id]);
      }

      if (currentIndex >= recipes.length - 1) {
        setTimeout(() => setShowSummary(true), 300);
      } else {
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
      }
    },
    [currentIndex, recipes]
  );

  if (showSummary) {
    return (
      <SummaryScreen
        recipes={recipes}
        selected={selected}
        skipped={skipped}
        fromUser={fromUser}
        subtitle={subtitle}
        onSubmit={() => onSubmit(selected)}
      />
    );
  }

  const currentRecipe = recipes[currentIndex];
  if (!currentRecipe) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">Выберите блюда</h2>
          <p className="text-xs text-gray-500">
            {subtitle}
          </p>
        </div>
        <span className="text-sm text-gray-400 font-medium">
          {currentIndex + 1}/{recipes.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / recipes.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Swipe hint */}
      <div className="flex justify-between px-4 text-xs text-gray-400">
        <span>← Не хочу</span>
        <span>Хочу →</span>
      </div>

      {/* Cards Stack */}
      <div className="relative h-[420px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {recipes.slice(currentIndex, currentIndex + 3).reverse().map((recipe, stackIndex) => {
            const isTop = stackIndex === recipes.slice(currentIndex, currentIndex + 3).length - 1;
            const offset = recipes.slice(currentIndex, currentIndex + 3).length - 1 - stackIndex;

            return (
              <SwipeCard
                key={recipe.id}
                recipe={recipe}
                isTop={isTop}
                offset={offset}
                onSwipe={handleSwipe}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-6">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all active:scale-95"
        >
          <X className="w-8 h-8 text-red-400" />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all active:scale-95"
        >
          <Heart className="w-8 h-8 text-green-400" />
        </button>
      </div>

      {/* Selected count */}
      <div className="text-center">
        <span className="text-sm text-gray-500">
          Выбрано: <span className="font-bold text-orange-500">{selected.length}</span> блюд
        </span>
      </div>
    </div>
  );
}

function SwipeCard({
  recipe,
  isTop,
  offset,
  onSwipe,
}: {
  recipe: Recipe;
  isTop: boolean;
  offset: number;
  onSwipe: (direction: 'left' | 'right') => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const mealEmoji: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm"
      style={{
        x,
        rotate: isTop ? rotate : 0,
        scale: isTop ? 1 : 1 - offset * 0.05,
        zIndex: 10 - offset,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      exit={{ x: offset > 0 ? 300 : -300, opacity: 0, scale: 0.8 }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Image */}
        <div className="relative h-56">
          <img
            src={getRecipeImage(recipe)}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">
            {mealEmoji[recipe.mealType]} {recipe.mealType === 'breakfast' ? 'Завтрак' : recipe.mealType === 'lunch' ? 'Обед' : 'Ужин'}
          </div>

          {/* Like/Nope overlays */}
          {isTop && (
            <>
              <motion.div
                className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white font-bold text-xl rounded-xl border-4 border-green-300 rotate-[-15deg]"
                style={{ opacity: likeOpacity }}
              >
                ХОЧУ!
              </motion.div>
              <motion.div
                className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white font-bold text-xl rounded-xl border-4 border-red-300 rotate-[15deg]"
                style={{ opacity: nopeOpacity }}
              >
                НЕТ
              </motion.div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{recipe.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{recipe.description}</p>
          
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Ингредиенты
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {recipe.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-medium"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SummaryScreen({
  recipes,
  selected,
  skipped,
  fromUser,
  subtitle,
  onSubmit,
}: {
  recipes: Recipe[];
  selected: string[];
  skipped: string[];
  fromUser: { name: string; avatar: string };
  subtitle: string;
  onSubmit: () => void;
}) {
  const selectedRecipes = recipes.filter((r) => selected.includes(r.id));
  const skippedRecipes = recipes.filter((r) => skipped.includes(r.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Ваш выбор готов!</h2>
        <p className="text-sm text-gray-500">
          {subtitle}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Отправить {fromUser.name} выбранные блюда?
        </p>
      </div>

      {/* Selected */}
      {selectedRecipes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
            <Heart className="w-4 h-4" /> Выбранные ({selectedRecipes.length})
          </h3>
          <div className="space-y-2">
            {selectedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
              >
                <img
                  src={getRecipeImage(recipe)}
                  alt={recipe.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="font-medium text-sm text-gray-800">{recipe.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skipped */}
      {skippedRecipes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <X className="w-4 h-4" /> Пропущенные ({skippedRecipes.length})
          </h3>
          <div className="space-y-2">
            {skippedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60"
              >
                <img
                  src={getRecipeImage(recipe)}
                  alt={recipe.name}
                  className="w-10 h-10 rounded-lg object-cover grayscale"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="font-medium text-sm text-gray-500 line-through">{recipe.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onSubmit}
        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        Отправить выбор
      </button>
    </motion.div>
  );
}
