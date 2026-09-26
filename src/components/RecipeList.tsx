import { useStore } from '../store';
import { Recipe } from '../types';
import { Clock, Trash2, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

export function RecipeList() {
  const { users, currentUserId, deleteRecipe } = useStore();
  const currentUser = users.find((u) => u.id === currentUserId);

  if (!currentUser || currentUser.recipes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🍽️</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Пока нет рецептов</h2>
        <p className="text-gray-500">Добавьте свои любимые блюда, чтобы потом спросить партнёра!</p>
      </div>
    );
  }

  const mealTypeLabels: Record<string, string> = {
    breakfast: '🌅 Завтрак',
    lunch: '☀️ Обед',
    dinner: '🌙 Ужин',
  };

  const groupedRecipes = {
    breakfast: currentUser.recipes.filter((r) => r.mealType === 'breakfast'),
    lunch: currentUser.recipes.filter((r) => r.mealType === 'lunch'),
    dinner: currentUser.recipes.filter((r) => r.mealType === 'dinner'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{currentUser.avatar}</span>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{currentUser.name}</h2>
          <p className="text-sm text-gray-500">{currentUser.recipes.length} рецептов</p>
        </div>
      </div>

      {Object.entries(groupedRecipes).map(([type, recipes]) =>
        recipes.length > 0 ? (
          <div key={type}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {mealTypeLabels[type]}
            </h3>
            <div className="space-y-3">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onDelete={deleteRecipe}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : null
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
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f97316" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="30">🍽️</text></svg>';
            }}
          />
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
