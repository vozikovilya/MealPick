import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useStore, useAllMealTypes } from '../store';
import { Recipe } from '../types';
import { X, Heart, Check, ArrowLeft, Send, Info } from 'lucide-react';
import { getRecipeImage, FALLBACK_IMAGE } from '../utils';

interface Props {
  requestId: number;
  onDone: () => void;
}

export function SwipeSelector({ requestId, onDone }: Props) {
  const { swipeRequests, users, respondToSwipeRequest, currentUserId } = useStore();
  const request = swipeRequests.find((r) => r.id === requestId);

  if (!request || !currentUserId) return null;

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

  const allMealTypes = useAllMealTypes();
  const categoryMealType = allMealTypes.find((m) => m.id === request.category);
  const categoryLabel = categoryMealType ? `${categoryMealType.emoji} ${categoryMealType.name}` : request.category;

  let subtitle = '';
  if (request.mode === 'delivery') {
    subtitle = `${fromUser?.name} предлагает заказать доставку 🚀`;
  } else if (request.mode === 'category' && request.category) {
    subtitle = `Выберите из категории: ${categoryLabel}`;
  } else {
    subtitle = `${fromUser?.name} предлагает выбрать`;
  }

  // Для доставки показываем карточки доставок
  if (request.mode === 'delivery') {
    const { deliveryOptions } = useStore();
    const deliveries = (request.deliveryIds || [])
      .map((id) => deliveryOptions.find((d) => d.id === id))
      .filter(Boolean) as { id: string; name: string; emoji: string; description: string }[];

    return (
      <DeliverySelector
        deliveries={deliveries}
        fromUser={fromUser!}
        senderMessage={request.message}
        onSubmit={(selectedIds) => {
          // Для доставки recipeIds = deliveryIds
          respondToSwipeRequest(requestId, selectedIds);
          onDone();
        }}
        onBack={onDone}
      />
    );
  }

  return (
    <SwipeContent
      recipes={recipes}
      fromUser={fromUser!}
      subtitle={subtitle}
      senderMessage={request.message}
      onSubmit={(selected) => {
        respondToSwipeRequest(requestId, selected);
        onDone();
      }}
      onBack={onDone}
    />
  );
}

function DeliverySelector({
  deliveries,
  fromUser,
  senderMessage,
  onSubmit,
  onBack,
}: {
  deliveries: { id: string; name: string; emoji: string; description: string }[];
  fromUser: { name: string; avatar: string };
  senderMessage?: string;
  onSubmit: (selectedIds: string[]) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">Выберите доставку</h2>
          <p className="text-xs text-gray-500">{fromUser.avatar} {fromUser.name} предлагает</p>
        </div>
      </div>

      {senderMessage && (
        <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
          <p className="text-sm text-pink-700 italic">💌 "{senderMessage}"</p>
        </div>
      )}

      <div className="space-y-3">
        {deliveries.map((delivery) => {
          const isSelected = selected.includes(delivery.id);
          return (
            <button
              key={delivery.id}
              onClick={() =>
                setSelected((prev) =>
                  prev.includes(delivery.id) ? prev.filter((id) => id !== delivery.id) : [...prev, delivery.id]
                )
              }
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                isSelected
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200 bg-white'
              }`}
            >
              <span className="text-4xl">{delivery.emoji}</span>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-800">{delivery.name}</h4>
                <p className="text-xs text-gray-500">{delivery.description}</p>
              </div>
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSubmit(selected)}
        disabled={selected.length === 0}
        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        Отправить выбор ({selected.length})
      </button>
    </div>
  );
}

function SwipeContent({
  recipes,
  fromUser,
  subtitle,
  senderMessage,
  onSubmit,
  onBack,
}: {
  recipes: Recipe[];
  fromUser: { name: string; avatar: string };
  subtitle: string;
  senderMessage?: string;
  onSubmit: (selectedIds: string[]) => void;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
        <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors">
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

      {/* Sender message */}
      {senderMessage && (
        <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
          <p className="text-sm text-pink-700 italic">💌 "{senderMessage}"</p>
        </div>
      )}

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
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all active:scale-95"
        >
          <X className="w-7 h-7 text-red-400" />
        </button>
        <button
          onClick={() => setShowDetails(true)}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all active:scale-95"
          title="Подробнее о блюде"
        >
          <Info className="w-6 h-6 text-blue-400" />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all active:scale-95"
        >
          <Heart className="w-7 h-7 text-green-400" />
        </button>
      </div>

      {/* Recipe Details Modal */}
      <AnimatePresence>
        {showDetails && currentRecipe && (
          <RecipeDetailsModal
            recipe={currentRecipe}
            onClose={() => setShowDetails(false)}
          />
        )}
      </AnimatePresence>

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

  const allMealTypes = useAllMealTypes();
  const mealType = allMealTypes.find((m) => m.id === recipe.mealType);

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
            {mealType?.emoji} {mealType?.name}
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
                  {ing.name}
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

function RecipeDetailsModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const allMealTypes = useAllMealTypes();
  const mealType = allMealTypes.find((m) => m.id === recipe.mealType);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        {/* Header with image */}
        <div className="relative h-48">
          <img
            src={getRecipeImage(recipe)}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          {mealType && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">
              {mealType.emoji} {mealType.name}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{recipe.name}</h2>
            {recipe.description && (
              <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
            )}
          </div>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Ингредиенты</h3>
              <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
                <div className="divide-y divide-orange-100">
                  {recipe.ingredients.map((ing) => (
                    <div key={ing.id} className="flex items-center justify-between py-2">
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

          {/* Cooking Steps */}
          {recipe.cookingSteps && recipe.cookingSteps.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Способ приготовления</h3>
              <div className="space-y-3">
                {recipe.cookingSteps.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{step.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{step.text}</p>
                      {step.imageUrl && (
                        <img
                          src={step.imageUrl}
                          alt={step.title}
                          className="mt-2 w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
