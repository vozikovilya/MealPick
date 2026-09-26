import { useStore } from '../store';
import { ArrowLeft, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  requestId: string;
  onBack: () => void;
}

export function SelectedResults({ requestId, onBack }: Props) {
  const { swipeRequests, users } = useStore();
  const request = swipeRequests.find((r) => r.id === requestId);

  if (!request) return null;

  const toUser = users.find((u) => u.id === request.toUserId);
  const allRecipes = users.flatMap((u) => u.recipes);
  
  const selectedRecipes = (request.selectedRecipeIds || [])
    .map((id) => allRecipes.find((r) => r.id === id))
    .filter(Boolean);

  const skippedIds = request.recipeIds.filter(
    (id) => !request.selectedRecipeIds?.includes(id)
  );
  const skippedRecipes = skippedIds
    .map((id) => allRecipes.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Результат выбора</h2>
      </div>

      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl">
        <span className="text-3xl">{toUser?.avatar}</span>
        <div>
          <p className="font-semibold text-gray-800">{toUser?.name} выбрал(а):</p>
          <p className="text-sm text-gray-500">
            {selectedRecipes.length} из {request.recipeIds.length} блюд
          </p>
        </div>
      </div>

      {/* Selected */}
      {selectedRecipes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-green-600 flex items-center gap-2">
            <Check className="w-4 h-4" /> Что приготовить
          </h3>
          <div className="space-y-2">
            {selectedRecipes.map((recipe, index) => (
              recipe && (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
                >
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-14 h-14 rounded-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{recipe.name}</h4>
                    <p className="text-xs text-gray-500">{recipe.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {recipe.ingredients.slice(0, 4).map((ing, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full"
                        >
                          {ing}
                        </span>
                      ))}
                      {recipe.ingredients.length > 4 && (
                        <span className="text-[10px] text-gray-400">
                          +{recipe.ingredients.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Skipped */}
      {skippedRecipes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <X className="w-4 h-4" /> Не выбрали
          </h3>
          <div className="space-y-2">
            {skippedRecipes.map((recipe) => (
              recipe && (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-50"
                >
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-10 h-10 rounded-lg object-cover grayscale"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="font-medium text-sm text-gray-500 line-through">
                    {recipe.name}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectedRecipes.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">😅</div>
          <p className="text-gray-500">Ничего не выбрано. Может, закажем доставку?</p>
        </div>
      )}
    </motion.div>
  );
}
