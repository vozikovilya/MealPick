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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка результатов...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Результаты не найдены</h2>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          Вернуться
        </button>
      </div>
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
