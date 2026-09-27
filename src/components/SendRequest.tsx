import { useState } from 'react';
import { useStore, useAllMealTypes, useMainMealTypes } from '../store';
import { ArrowLeft, Send, Check, List, Truck, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecipeImage } from '../utils';

interface Props {
  onDone: () => void;
}

type SendMode = 'category' | 'select' | 'delivery';

const cuteMessages = [
  'Люблю тебя! ❤️',
  'Что будем кушать?',
  'Голодный(ая) 😋',
  'Выбирай скорее!',
  'Удиви меня!',
  'Давай что-нибудь вкусненькое?',
  'Я доверяю твоему вкусу!',
  'Что-то особенное сегодня?',
];

export function SendRequest({ onDone }: Props) {
  const { users, currentUserId, sendSwipeRequest, deliveryOptions, familyProfile } = useStore();
  const mainMealTypes = useMainMealTypes();
  const allMealTypes = useAllMealTypes();
  
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [sendMode, setSendMode] = useState<SendMode>('category');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  // Находим партнёров - других членов семьи
  const familyMembers = familyProfile
    ? users.filter(u => familyProfile.memberIds.includes(u.id) && u.id !== currentUserId)
    : [];
  const partner = familyMembers[0] || null;
  const currentUser = users.find((u) => u.id === currentUserId);

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  const toggleDelivery = (deliveryId: string) => {
    setSelectedDeliveries((prev) =>
      prev.includes(deliveryId) ? prev.filter((id) => id !== deliveryId) : [...prev, deliveryId]
    );
  };

  const getRecipesByCategory = (category: string) => {
    return currentUser?.recipes.filter((r) => r.mealType === category) || [];
  };

  const handleSend = () => {
    if (!partner) return;

    let recipeIds: string[] = [];
    let mode: 'category' | 'select' | 'delivery' = 'category';
    let category: string | undefined;
    let deliveryIds: string[] | undefined;

    if (sendMode === 'category' && selectedCategories.length > 0) {
      // Собираем блюда из всех выбранных категорий
      recipeIds = selectedCategories.flatMap(cat => getRecipesByCategory(cat).map((r) => r.id));
      mode = 'category';
      category = selectedCategories[0]; // Для обратной совместимости
    } else if (sendMode === 'select') {
      recipeIds = selectedRecipes;
      mode = 'select';
    } else if (sendMode === 'delivery') {
      recipeIds = [];
      mode = 'delivery';
      deliveryIds = selectedDeliveries;
    }

    if ((sendMode !== 'delivery' && recipeIds.length === 0) ||
        (sendMode === 'delivery' && selectedDeliveries.length === 0)) return;

    sendSwipeRequest(partner.id, recipeIds, {
      mode,
      category,
      message: message.trim() || undefined,
      deliveryIds,
    });
    setSent(true);
    setTimeout(() => onDone(), 2000);
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
        <p className="text-gray-500">{partner?.name} скоро ответит 🎉</p>
      </motion.div>
    );
  }

  const categoryOptions = allMealTypes
    .filter((mt) => !mt.isCollection)
    .map((mt) => ({
      value: mt.id,
      label: mt.name,
      emoji: mt.emoji,
      count: getRecipesByCategory(mt.id).length,
    }))
    .filter((opt) => opt.count > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Спросить партнёра</h2>
      </div>

      {/* Partner */}
      {partner ? (
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
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{partner.name}</h4>
              <p className="text-xs text-gray-500">Получатель запроса</p>
            </div>
            {selectedPartner && <Check className="w-5 h-5 text-orange-500" />}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-sm text-gray-500 mb-2">Нет участников семьи</p>
          <p className="text-xs text-gray-400">Создайте профиль семьи и пригласите участников в разделе "Профиль"</p>
        </div>
      )}

      {selectedPartner && partner && (
        <>
          {/* Mode Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Что отправить?</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSendMode('category')}
                className={`py-3 px-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                  sendMode === 'category'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
                <span>Категории</span>
              </button>
              <button
                onClick={() => setSendMode('select')}
                className={`py-3 px-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                  sendMode === 'select'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>Блюда</span>
              </button>
              <button
                onClick={() => setSendMode('delivery')}
                className={`py-3 px-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${
                  sendMode === 'delivery'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span>Доставка</span>
              </button>
            </div>
          </div>

          {/* Category Selection */}
          {sendMode === 'category' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Выберите категории (можно несколько)</h3>
              <div className="grid grid-cols-2 gap-3">
                {categoryOptions.map((option) => {
                  const isSelected = selectedCategories.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter(c => c !== option.value));
                        } else {
                          setSelectedCategories([...selectedCategories, option.value]);
                        }
                      }}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-orange-400 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
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
              {selectedCategories.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Выбрано категорий: {selectedCategories.length}
                </p>
              )}
            </motion.div>
          )}

          {/* Individual Recipe Selection */}
          {sendMode === 'select' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Выберите блюда ({selectedRecipes.length} выбрано)
              </h3>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {/* Основные категории */}
                {allMealTypes.filter(mt => !mt.isCollection).map((mealType) => {
                  const recipes = currentUser?.recipes.filter(r => r.mealType === mealType.id) || [];
                  if (recipes.length === 0) return null;
                  
                  return (
                    <div key={mealType.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{mealType.emoji}</span>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {mealType.name}
                        </h4>
                        <span className="text-xs text-gray-400">({recipes.length})</span>
                      </div>
                      <div className="space-y-2">
                        {recipes.map((recipe) => (
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
                              src={getRecipeImage(recipe)}
                              alt={recipe.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-800 truncate">{recipe.name}</h4>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                selectedRecipes.includes(recipe.id)
                                  ? 'bg-orange-500 border-orange-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedRecipes.includes(recipe.id) && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Подборки */}
                {allMealTypes.filter(mt => mt.isCollection).map((mealType) => {
                  const recipes = currentUser?.recipes.filter(r => r.mealType === mealType.id) || [];
                  if (recipes.length === 0) return null;
                  
                  return (
                    <div key={mealType.id}>
                      <div className="flex items-center gap-2 mb-2 pt-2 border-t border-gray-100">
                        <span className="text-lg">{mealType.emoji}</span>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {mealType.name}
                        </h4>
                        <span className="text-xs text-gray-400">({recipes.length})</span>
                      </div>
                      <div className="space-y-2">
                        {recipes.map((recipe) => (
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
                              src={getRecipeImage(recipe)}
                              alt={recipe.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-800 truncate">{recipe.name}</h4>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                selectedRecipes.includes(recipe.id)
                                  ? 'bg-orange-500 border-orange-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedRecipes.includes(recipe.id) && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Delivery Selection */}
          {sendMode === 'delivery' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Выберите доставку ({selectedDeliveries.length} выбрано)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {deliveryOptions.map((delivery) => {
                  const isSelected = selectedDeliveries.includes(delivery.id);
                  return (
                    <button
                      key={delivery.id}
                      onClick={() => toggleDelivery(delivery.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-orange-400 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                    >
                      <span className="text-3xl">{delivery.emoji}</span>
                      <span className={`text-sm font-medium ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                        {delivery.name}
                      </span>
                      <span className="text-[10px] text-gray-400">{delivery.description}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Добавьте милое сообщение
              <span className="text-xs text-gray-400 font-normal">(необязательно)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напишите что-нибудь приятное..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm resize-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {cuteMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(msg)}
                  className="px-2.5 py-1 bg-pink-50 text-pink-600 text-xs rounded-full hover:bg-pink-100 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={
              !selectedPartner ||
              (sendMode === 'category' && selectedCategories.length === 0) ||
              (sendMode === 'select' && selectedRecipes.length === 0) ||
              (sendMode === 'delivery' && selectedDeliveries.length === 0)
            }
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Отправить запрос
          </button>
        </>
      )}
    </div>
  );
}
