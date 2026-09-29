import { useState, useEffect } from 'react';
import * as api from '../services/api';
import type { Recipe } from '../services/api';
import { ArrowLeft, Check, X, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  requestId: number;
  onBack: () => void;
}

export function SelectedResults({ requestId, onBack }: Props) {
  const [request, setRequest] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [requestId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await api.getSwipeRequest(requestId);
      setRequest(response.data.request);
      
      // Получаем выбранные рецепты
      const allRecipes = response.data.recipes;
      setRecipes(allRecipes);
      
      // Фильтруем выбранные рецепты
      const selectedIds = response.data.request.selected_recipe_ids || [];
      const selected = allRecipes.filter((r: Recipe) => selectedIds.includes(r.id));
      setSelectedRecipes(selected);
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-b-2 border-orange-500 rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-600">Загрузка результатов...</p>
        </div>
      </motion.div>
    );
  }

  if (!request) {
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
          className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-5xl">📭</span>
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Результаты не найдены</h2>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all"
        >
          Вернуться
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Результат выбора</h2>
      </div>

      <div className="p-4 bg-orange-50 rounded-2xl">
        <p className="text-sm text-gray-600">
          Вы выбрали <span className="font-bold text-orange-600">{selectedRecipes.length}</span> блюд
        </p>
      </div>

      {/* Selected */}
      {selectedRecipes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
            <Check className="w-4 h-4" /> Выбранные блюда
          </h3>
          <div className="space-y-2">
            {selectedRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
              >
                <img
                  src={recipe.image_urls?.[0] || ''}
                  alt={recipe.name}
                  className="w-14 h-14 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{recipe.name}</h4>
                  <p className="text-xs text-gray-500">{recipe.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectedRecipes.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">😅</div>
          <p className="text-gray-500">Ничего не выбрано</p>
        </div>
      )}
    </motion.div>
  );
}
