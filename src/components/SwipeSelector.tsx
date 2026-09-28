import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { Recipe } from '../services/api';
import { X, Heart, Check, ArrowLeft, Send, Info } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

interface Props {
  requestId: number;
  onDone: () => void;
}

export function SwipeSelector({ requestId, onDone }: Props) {
  const [request, setRequest] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fromUser, setFromUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await api.getSwipeRequest(requestId);
      setRequest(response.data.request);
      setRecipes(response.data.recipes);
      setFromUser({
        name: response.data.request.from_user_name,
        avatar: response.data.request.from_user_avatar,
      });
    } catch (error) {
      console.error('Ошибка загрузки запроса:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка запроса...</p>
        </div>
      </div>
    );
  }

  if (!request || recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Запрос не найден</h2>
        <p className="text-gray-500 mb-6">Возможно, он был удалён или уже обработан</p>
        <button
          onClick={onDone}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          Вернуться к уведомлениям
        </button>
      </div>
    );
  }

  return (
    <SwipeContent
      recipes={recipes}
      fromUser={fromUser}
      subtitle={`${fromUser.name} предлагает выбрать`}
      senderMessage={request.message}
      onSubmit={async (selected) => {
        try {
          await api.respondToSwipeRequest(requestId, selected.map(r => r.id));
          onDone();
        } catch (error) {
          console.error('Ошибка отправки ответа:', error);
          alert('Не удалось отправить ответ');
        }
      }}
      onBack={onDone}
    />
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
  fromUser: any;
  subtitle: string;
  senderMessage?: string;
  onSubmit: (selected: Recipe[]) => void;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Recipe[]>([]);
  const [skipped, setSkipped] = useState<Recipe[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const recipe = recipes[currentIndex];
      if (!recipe) return;

      if (direction === 'right') {
        setSelected((prev) => [...prev, recipe]);
      } else {
        setSkipped((prev) => [...prev, recipe]);
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
          <p className="text-xs text-gray-500">{subtitle}</p>
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
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all active:scale-95"
        >
          <Heart className="w-7 h-7 text-green-400" />
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

  const images = recipe.image_urls || [];

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
            src={images[0] || ''}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23f97316" width="400" height="200"/><text x="200" y="110" text-anchor="middle" fill="white" font-size="40">🍽️</text></svg>';
            }}
          />

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
              {recipe.ingredients?.slice(0, 6).map((ing, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-medium"
                >
                  {ing.name}
                </span>
              ))}
              {recipe.ingredients && recipe.ingredients.length > 6 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{recipe.ingredients.length - 6}
                </span>
              )}
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
  onSubmit,
}: {
  recipes: Recipe[];
  selected: Recipe[];
  skipped: Recipe[];
  fromUser: any;
  onSubmit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Ваш выбор готов!</h2>
        <p className="text-sm text-gray-500">
          Отправить {fromUser.name} выбранные блюда?
        </p>
      </div>

      {/* Selected */}
      {selected.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
            <Heart className="w-4 h-4" /> Выбранные ({selected.length})
          </h3>
          <div className="space-y-2">
            {selected.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
              >
                <img
                  src={recipe.image_urls?.[0] || ''}
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
      {skipped.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <X className="w-4 h-4" /> Пропущенные ({skipped.length})
          </h3>
          <div className="space-y-2">
            {skipped.map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60"
              >
                <img
                  src={recipe.image_urls?.[0] || ''}
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
