import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { ArrowLeft, Check, X, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  requestId: number;
  onBack: () => void;
}

export function SwipeRequestDetails({ requestId, onBack }: Props) {
  const [request, setRequest] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequestDetails();
  }, [requestId]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getSwipeRequest(requestId);
      setRequest(response.data.request);
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Ошибка загрузки деталей запроса:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Запрос не найден</h2>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
        >
          Вернуться
        </button>
      </div>
    );
  }

  // Парсим ответы участников (проверяем тип данных)
  let responses: Record<string, number[]> = {};
  if (request.responses) {
    if (typeof request.responses === 'string') {
      try {
        responses = JSON.parse(request.responses);
      } catch (e) {
        console.error('Ошибка парсинга responses:', e);
        responses = {};
      }
    } else if (typeof request.responses === 'object') {
      responses = request.responses as Record<string, number[]>;
    }
  }
  
  // Получаем информацию о всех участниках, которым был отправлен запрос
  const allRecipients = request.to_family_id 
    ? request.family_members || [] // Если отправлено всей семье
    : request.to_user 
      ? [request.to_user] // Если отправлено конкретному пользователю
      : [{ id: request.to_user_id, name: request.to_user_name, avatar: request.to_user_avatar }]; // Fallback

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Детали запроса</h2>
      </div>

      {/* Request Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{request.from_user_avatar}</span>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{request.from_user_name}</p>
            <p className="text-xs text-gray-500">
              {new Date(request.created_at).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            request.status === 'completed' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {request.status === 'completed' ? '✅ Завершён' : '⏳ Ожидает'}
          </div>
        </div>

        {request.message && (
          <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
            <p className="text-sm text-pink-700 italic">💌 "{request.message}"</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>
            Отправлено: {allRecipients.length === 1 
              ? allRecipients[0].name 
              : `${allRecipients.length} участникам`
            }
          </span>
        </div>
      </div>

      {/* Recipients Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Users className="w-4 h-4" /> Статус ответов
        </h3>
        
        <div className="space-y-2">
          {allRecipients.map((recipient: any) => {
            const recipientId = String(recipient.id);
            const hasResponded = responses[recipientId] !== undefined;
            const selectedRecipeIds = hasResponded ? responses[recipientId] : [];
            
            return (
              <div
                key={recipient.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  hasResponded
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <span className="text-2xl">{recipient.avatar}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{recipient.name}</p>
                  {hasResponded ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Выбрал {selectedRecipeIds.length} {selectedRecipeIds.length === 1 ? 'блюдо' : 'блюд'}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ожидает ответа
                    </p>
                  )}
                </div>
                {hasResponded && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Recipes by Each Recipient */}
      {Object.keys(responses).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Выбранные блюда</h3>
          
          {allRecipients.map((recipient: any) => {
            const recipientId = String(recipient.id);
            const selectedRecipeIds = responses[recipientId] || [];
            if (selectedRecipeIds.length === 0) return null;
            
            const selectedRecipes = recipes.filter(r => selectedRecipeIds.includes(r.id));
            
            return (
              <div key={recipient.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{recipient.avatar}</span>
                  <p className="font-medium text-gray-800">{recipient.name}</p>
                </div>
                
                <div className="space-y-2 pl-8">
                  {selectedRecipes.map((recipe) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 bg-green-50 rounded-xl border border-green-100"
                    >
                      <img
                        src={recipe.image_urls?.[0] || ''}
                        alt={recipe.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{recipe.name}</p>
                        <p className="text-xs text-gray-500">{recipe.description}</p>
                      </div>
                      <Check className="w-5 h-5 text-green-500" />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Recipes in Request */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Все блюда в запросе ({recipes.length})
        </h3>
        
        <div className="space-y-2">
          {recipes.map((recipe) => {
            // Подсчитываем, сколько раз это блюдо было выбрано
            const selectedCount = Object.values(responses).reduce((count: number, selectedIds: number[]) => {
              return count + (selectedIds.includes(recipe.id) ? 1 : 0);
            }, 0);
            
            return (
              <div
                key={recipe.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <img
                  src={recipe.image_urls?.[0] || ''}
                  alt={recipe.name}
                  className="w-14 h-14 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{recipe.name}</p>
                  <p className="text-xs text-gray-500">{recipe.description}</p>
                </div>
                {selectedCount > 0 && (
                  <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    Выбрано: {selectedCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
