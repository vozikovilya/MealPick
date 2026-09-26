import { useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, Send, Check, Coffee, Sun, Moon, List } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onDone: () => void;
}

type SendMode = 'category' | 'select';

export function SendRequest({ onDone }: Props) {
  const { users, currentUserId, sendSwipeRequest } = useStore();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [sendMode, setSendMode] = useState<SendMode>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const partner = users.find((u) => u.id !== currentUserId);
  const currentUser = users.find((u) => u.id === currentUserId);

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  const getRecipesByCategory = (category: string) => {
    return currentUser?.recipes.filter((r) => r.mealType === category) || [];
  };

  const handleSend = () => {
    if (!partner) return;
    
    let recipeIds: string[] = [];
    let mode: 'category' | 'select' | undefined;
    let category: 'breakfast' | 'lunch' | 'dinner' | undefined;
    
    if (sendMode === 'category' && selectedCategory) {
      recipeIds = getRecipesByCategory(selectedCategory).map((r) => r.id);
      mode = 'category';
      category = selectedCategory as 'breakfast' | 'lunch' | 'dinner';
    } else if (sendMode === 'select') {
      recipeIds = selectedRecipes;
      mode = 'select';
    }

    if (recipeIds.length === 0) return;
    
    sendSwipeRequest(partner.id, recipeIds, mode, category);
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

  const categoryOptions = [
    { value: 'breakfast', label: 'Завтрак', emoji: '🌅', icon: Coffee, count: getRecipesByCategory('breakfast').length },
    { value: 'lunch', label: 'Обед', emoji: '☀️', icon: Sun, count: getRecipesByCategory('lunch').length },
    { value: 'dinner', label: 'Ужин', emoji: '🌙', icon: Moon, count: getRecipesByCategory('dinner').length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onDone} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Спросить партнёра</h2>
      </div>

      <p className="text-sm text-gray-500">
        Отправьте {partner?.name} список блюд на выбор. Он(а) свайпнет те, что хочет приготовить!
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

      {/* Mode Selection */}
      {selectedPartner && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Что отправить?</h3>
            <div className="flex gap-2">
              <button
                onClick={() => { setSendMode('category'); setSelectedCategory(null); }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  sendMode === 'category'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Coffee className="w-4 h-4" />
                По категории
              </button>
              <button
                onClick={() => setSendMode('select')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  sendMode === 'select'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                Отдельные блюда
              </button>
            </div>
          </div>

          {/* Category Selection */}
          {sendMode === 'category' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-gray-700">Выберите категорию</h3>
              <div className="grid grid-cols-3 gap-3">
                {categoryOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedCategory === option.value;
                  const hasRecipes = option.count > 0;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => hasRecipes && setSelectedCategory(option.value)}
                      disabled={!hasRecipes}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-orange-400 bg-orange-50 shadow-md'
                          : hasRecipes
                          ? 'border-gray-200 hover:border-orange-200 bg-white'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-3xl">{option.emoji}</span>
                      <span className={`text-sm font-medium ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}>
                        {option.count} {option.count === 1 ? 'блюдо' : option.count < 5 ? 'блюда' : 'блюд'}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Preview of selected category */}
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-orange-50/50 rounded-xl border border-orange-100"
                >
                  <p className="text-xs text-orange-600 font-medium mb-2">
                    Будут отправлены:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {getRecipesByCategory(selectedCategory).map((recipe) => (
                      <span
                        key={recipe.id}
                        className="px-2 py-1 bg-white text-orange-700 text-xs rounded-full border border-orange-100"
                      >
                        {recipe.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Individual Recipe Selection */}
          {sendMode === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-gray-700">
                Выберите блюда ({selectedRecipes.length} выбрано)
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {currentUser?.recipes.map((recipe) => {
                  const mealEmoji: Record<string, string> = {
                    breakfast: '🌅',
                    lunch: '☀️',
                    dinner: '🌙',
                  };
                  
                  return (
                    <div
                      key={recipe.id}
                      onClick={() => toggleRecipe(recipe.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedRecipes.includes(recipe.id)
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">{recipe.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{mealEmoji[recipe.mealType]}</span>
                          <span className="text-xs text-gray-500">{recipe.ingredients.length} ингр.</span>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
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
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={
              !selectedPartner ||
              (sendMode === 'category' && !selectedCategory) ||
              (sendMode === 'select' && selectedRecipes.length === 0)
            }
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sendMode === 'category' && selectedCategory
              ? `Отправить все ${categoryOptions.find(o => o.value === selectedCategory)?.label.toLowerCase()}`
              : sendMode === 'select'
              ? `Отправить ${selectedRecipes.length} ${selectedRecipes.length === 1 ? 'блюдо' : selectedRecipes.length < 5 ? 'блюда' : 'блюд'}`
              : 'Отправить запрос'
            }
          </button>
        </>
      )}
    </div>
  );
}
