import { useState, useEffect } from 'react';
import * as api from '../services/api';
import type { Recipe, Family, FamilyMember } from '../types';
import { Send, Check, List, Truck, MessageCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { RequestSentModal } from './RequestSentModal';
import { MEAL_TYPES, DELIVERY_OPTIONS, CUTE_MESSAGES } from '../constants';

interface Props {
  onDone: () => void;
}

type SendMode = 'category' | 'select' | 'delivery';

export function SendRequest({ onDone }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [sendTo, setSendTo] = useState<'family' | 'members'>('family');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [sendMode, setSendMode] = useState<SendMode>('category');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [showSentModal, setShowSentModal] = useState(false);
  const [sentToInfo, setSentToInfo] = useState<{
    type: 'family' | 'members';
    familyName?: string;
    members?: Array<{ name: string; avatar: string }>;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем профиль пользователя
      const profileResponse = await api.getProfile();
      setCurrentUser(profileResponse.data.user);
      
      // Загружаем информацию о семье
      if (profileResponse.data.family) {
        setFamily(profileResponse.data.family);
        const familyResponse = await api.getFamily();
        setMembers(familyResponse.data.members);
      }
      
      // Загружаем рецепты
      const recipesResponse = await api.getRecipes();
      setRecipes(recipesResponse.data.recipes);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  // Получаем других участников семьи
  const familyMembers = members.filter(m => m.id !== currentUser?.id);
  const selectedMembers = familyMembers.filter(m => selectedMemberIds.includes(m.id));

  const toggleMember = (memberId: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const toggleRecipe = (recipeId: number) => {
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
    return recipes.filter((r) => r.meal_type === category);
  };

  const handleSend = async () => {
    let recipeIds: number[] = [];
    let mode: 'category' | 'select' | 'delivery' = 'category';
    let category: string | undefined;
    let deliveryIds: string[] | undefined;

    if (sendMode === 'category' && selectedCategories.length > 0) {
      recipeIds = selectedCategories.flatMap(cat => 
        getRecipesByCategory(cat).map((r) => r.id)
      );
      mode = 'category';
      category = selectedCategories[0];
    } else if (sendMode === 'select') {
      recipeIds = selectedRecipes;
      mode = 'select';
    } else if (sendMode === 'delivery') {
      recipeIds = [];
      mode = 'delivery';
      deliveryIds = selectedDeliveries;
    }

    if ((sendMode !== 'delivery' && recipeIds.length === 0) ||
        (sendMode === 'delivery' && selectedDeliveries.length === 0)) {
      alert('Выберите хотя бы один элемент');
      return;
    }

    try {
      // Сохраняем информацию о получателях для модалки
      if (sendTo === 'family' && family) {
        setSentToInfo({
          type: 'family',
          familyName: family.name,
        });
        
        // Отправка всей семье
        await api.createSwipeRequest({
          recipe_ids: recipeIds,
          to_family_id: family.id,
          mode,
          category,
          message: message.trim() || undefined,
          delivery_ids: deliveryIds ? deliveryIds.map(id => parseInt(id.replace('d', ''))) : undefined,
        });
      } else if (sendTo === 'members' && selectedMemberIds.length > 0) {
        setSentToInfo({
          type: 'members',
          members: selectedMembers.map(m => ({ name: m.name, avatar: m.avatar })),
        });
        
        // Отправка выбранным участникам
        for (const memberId of selectedMemberIds) {
          await api.createSwipeRequest({
            recipe_ids: recipeIds,
            to_user_id: memberId,
            mode,
            category,
            message: message.trim() || undefined,
            delivery_ids: deliveryIds ? deliveryIds.map(id => parseInt(id.replace('d', ''))) : undefined,
          });
        }
      }
      
      setSent(true);
      setShowSentModal(true);
    } catch (error: any) {
      alert('Ошибка отправки запроса: ' + error.message);
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
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </motion.div>
    );
  }

  if (!family) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Нет семьи</h2>
        <p className="text-gray-500 mb-6">Создайте профиль семьи, чтобы отправлять запросы</p>
        <button
          onClick={onDone}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          Вернуться
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <>
        <RequestSentModal
          isOpen={showSentModal}
          onClose={() => {
            setShowSentModal(false);
            onDone();
          }}
          sentToInfo={sentToInfo}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Запрос отправлен!</h2>
          <p className="text-gray-500">
            {sendTo === 'family' 
              ? 'Вся семья скоро ответит' 
              : selectedMembers.length === 1 
                ? `${selectedMembers[0].name} скоро ответит`
                : `${selectedMembers.length} человек скоро ответят`
            } 🎉
          </p>
        </motion.div>
      </>
    );
  }

  const categoryOptions = MEAL_TYPES.map((mt) => ({
    value: mt.id,
    label: mt.name,
    emoji: mt.emoji,
    count: getRecipesByCategory(mt.id).length,
  })).filter((opt) => opt.count > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Спросить</h2>
      </div>

      {/* Send To Selection */}
      {familyMembers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" /> Кому отправить?
          </h3>
          
          {/* Toggle between family and specific members */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSendTo('family')}
              className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                sendTo === 'family'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{family.avatar}</span>
              <span>Всей семье</span>
            </button>
            <button
              onClick={() => setSendTo('members')}
              className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                sendTo === 'members'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">👥</span>
              <span>Выбрать участников</span>
            </button>
          </div>
          
          {/* Member selection (when "members" is selected) */}
          {sendTo === 'members' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-xs text-gray-500">Выберите одного или нескольких участников:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {familyMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{member.avatar}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800">{member.name}</p>
                        {member.role === 'owner' && (
                          <p className="text-xs text-yellow-600">👑 Глава семьи</p>
                        )}
                        {member.role === 'chef' && (
                          <p className="text-xs text-blue-600">👨‍🍳 Поварушка</p>
                        )}
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedMemberIds.length > 0 && (
                <p className="text-xs text-orange-600 font-medium">
                  Выбрано: {selectedMemberIds.length} {selectedMemberIds.length === 1 ? 'участник' : 'участников'}
                </p>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Mode Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Выберите блюда ({selectedRecipes.length} выбрано)
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {/* Основные категории */}
            {MEAL_TYPES.map((mealType) => {
              const categoryRecipes = recipes.filter(r => r.meal_type === mealType.id);
              if (categoryRecipes.length === 0) return null;
              
              return (
                <div key={mealType.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{mealType.emoji}</span>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {mealType.name}
                    </h4>
                    <span className="text-xs text-gray-400">({categoryRecipes.length})</span>
                  </div>
                  <div className="space-y-2">
                    {categoryRecipes.map((recipe) => (
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
                          src={recipe.image_urls?.[0] || ''}
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Выберите доставку ({selectedDeliveries.length} выбрано)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {DELIVERY_OPTIONS.map((delivery) => {
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
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
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
          {CUTE_MESSAGES.map((msg, i) => (
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
          (sendMode === 'category' && selectedCategories.length === 0) ||
          (sendMode === 'select' && selectedRecipes.length === 0) ||
          (sendMode === 'delivery' && selectedDeliveries.length === 0) ||
          (sendTo === 'members' && selectedMemberIds.length === 0)
        }
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        Отправить запрос
      </button>
    </div>
  );
}
