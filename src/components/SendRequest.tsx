import { useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, Send, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onDone: () => void;
}

export function SendRequest({ onDone }: Props) {
  const { users, currentUserId, sendSwipeRequest } = useStore();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const partner = users.find((u) => u.id !== currentUserId);
  const currentUser = users.find((u) => u.id === currentUserId);

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  const handleSend = () => {
    if (!partner || selectedRecipes.length === 0) return;
    sendSwipeRequest(partner.id, selectedRecipes);
    setSent(true);
    setTimeout(() => {
      onDone();
    }, 2000);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Запрос отправлен!</h2>
        <p className="text-gray-500">{partner?.name} скоро выберет блюда для вас 🎉</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onDone} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Спросить партнёра</h2>
      </div>

      <p className="text-sm text-gray-500">
        Выберите блюда из своего списка, которые вы хотите предложить {partner?.name}. 
        Он(а) свайпнет те, что хочет приготовить!
      </p>

      {/* Partner */}
      {partner && (
        <div
          onClick={() => setSelectedPartner(partner.id)}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedPartner
              ? 'border-orange-300 bg-orange-50'
              : 'border-gray-200 hover:border-orange-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{partner.avatar}</span>
            <div>
              <h4 className="font-semibold text-gray-800">{partner.name}</h4>
              <p className="text-xs text-gray-500">Получатель запроса</p>
            </div>
            {selectedPartner && (
              <Check className="w-5 h-5 text-orange-500 ml-auto" />
            )}
          </div>
        </div>
      )}

      {/* Recipe Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Выберите блюда ({selectedRecipes.length} выбрано)
        </h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {currentUser?.recipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => selectedPartner && toggleRecipe(recipe.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                selectedRecipes.includes(recipe.id)
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-100 hover:border-gray-200'
              } ${!selectedPartner ? 'opacity-50' : ''}`}
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800">{recipe.name}</h4>
                <p className="text-xs text-gray-500">{recipe.ingredients.length} ингредиентов</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedRecipes.includes(recipe.id)
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedRecipes.includes(recipe.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!selectedPartner || selectedRecipes.length === 0}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        Отправить запрос
      </button>
    </div>
  );
}
