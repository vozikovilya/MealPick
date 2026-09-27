import { useState } from 'react';
import { useStore } from '../store';
import { ArrowRight, CheckCheck, Inbox, Check, Trash2, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecipeImage, FALLBACK_IMAGE } from '../utils';

interface Props {
  onOpenSwipe: (requestId: string) => void;
  onViewResults: (requestId: string) => void;
}

export function Notifications({ onOpenSwipe, onViewResults }: Props) {
  const { notifications, users, swipeRequests, markNotificationRead, markNotificationsRead, markAllNotificationsRead, deleteNotifications, currentUserId } = useStore();
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const sortedNotifications = [...notifications].sort((a, b) => b.createdAt - a.createdAt);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleViewRequest = (requestId: string) => {
    setViewingRequestId(requestId);
  };

  const handleCloseDetails = () => {
    setViewingRequestId(null);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedNotifications.map((n) => n.id));
    }
  };

  const handleMarkSelectedRead = () => {
    if (selectedIds.length === 0) return;
    markNotificationsRead(selectedIds);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    deleteNotifications(selectedIds);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedIds([]);
    } else {
      setSelectionMode(true);
    }
  };

  const someSelected = selectedIds.length > 0;

  // Если открыт просмотр деталей запроса
  if (viewingRequestId) {
    const request = swipeRequests.find((r) => r.id === viewingRequestId);
    if (!request) return null;

    const fromUser = users.find((u) => u.id === request.fromUserId);
    const toUser = users.find((u) => u.id === request.toUserId);
    const allRecipes = users.flatMap((u) => u.recipes);
    
    const isForMe = request.toUserId === currentUserId;
    const isMyResponse = request.fromUserId === currentUserId;

    const recipes = isForMe
      ? request.recipeIds
          .map((id) => allRecipes.find((r) => r.id === id))
          .filter((r): r is NonNullable<typeof r> => r != null)
      : [];

    const selectedRecipes = isMyResponse
      ? (request.selectedRecipeIds || [])
          .map((id) => allRecipes.find((r) => r.id === id))
          .filter((r): r is NonNullable<typeof r> => r != null)
      : [];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseDetails}
            className="p-2 rounded-xl hover:bg-orange-50 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Детали запроса</h2>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{isForMe ? fromUser?.avatar : toUser?.avatar}</span>
            <div>
              <p className="font-semibold text-gray-800">
                {isForMe ? `От: ${fromUser?.name}` : `Для: ${toUser?.name}`}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(request.createdAt).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {request.message && (
            <div className="p-3 bg-white/60 rounded-xl border border-orange-100">
              <p className="text-sm text-gray-700 italic">💌 "{request.message}"</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
          <div className={`w-2 h-2 rounded-full ${request.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`} />
          <span className="text-sm text-gray-600">
            {request.status === 'completed' ? 'Завершён' : 'Ожидает ответа'}
          </span>
        </div>

        {isForMe && recipes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Предложенные блюда ({recipes.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                >
                  <img
                    src={getRecipeImage(recipe)}
                    alt={recipe.name}
                    className="w-14 h-14 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm truncate">{recipe.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{recipe.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isMyResponse && selectedRecipes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Выбранные блюда ({selectedRecipes.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
                >
                  <img
                    src={getRecipeImage(recipe)}
                    alt={recipe.name}
                    className="w-14 h-14 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm truncate">{recipe.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{recipe.description}</p>
                  </div>
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {isForMe && request.status === 'pending' && (
          <button
            onClick={() => {
              markNotificationRead(`notif_${viewingRequestId}`);
              onOpenSwipe(viewingRequestId);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            Выбрать блюда
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {isForMe && request.status === 'completed' && (
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
            <CheckCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">Ваш выбор отправлен</p>
          </div>
        )}

        {isMyResponse && (
          <button
            onClick={() => onViewResults(viewingRequestId)}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            Посмотреть выбор
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  if (sortedNotifications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-1">Нет запросов</h2>
        <p className="text-sm text-gray-500">
          Когда вам придёт запрос на выбор блюд, он появится здесь
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Запросы и ответы</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Прочитать всё
            </button>
          )}
          <button
            onClick={toggleSelectionMode}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              selectionMode
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            }`}
          >
            {selectionMode ? (
              <>
                <Square className="w-3.5 h-3.5" />
                Отменить
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5" />
                Выделить
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 my-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  selectedIds.length === sortedNotifications.length
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-300 hover:border-orange-300'
                }`}>
                  {selectedIds.length === sortedNotifications.length && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">Выделить все</span>
              </button>
              
              {someSelected && (
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkSelectedRead}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Прочитать ({selectedIds.length})
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Удалить ({selectedIds.length})
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {sortedNotifications.map((notif, index) => {
          const fromUser = users.find((u) => u.id === notif.fromUserId);
          const request = notif.requestId
            ? swipeRequests.find((r) => r.id === notif.requestId)
            : null;
          const isForMe = notif.type === 'swipe_request' && request?.toUserId === currentUserId;
          const isMyResponse = notif.type === 'swipe_response' && request?.fromUserId === currentUserId;
          const isSelected = selectedIds.includes(notif.id);

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-2xl border-2 transition-all ${
                !notif.read
                  ? 'border-orange-400 bg-orange-50/30 shadow-md shadow-orange-100'
                  : 'border-gray-200 bg-white'
              } ${isSelected ? 'ring-2 ring-orange-300' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                {selectionMode && (
                  <button
                    onClick={() => toggleSelection(notif.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                  !notif.read ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  {notif.type === 'swipe_request' ? '🍳' : 
                   notif.type === 'swipe_response' ? '✅' :
                   notif.type === 'family_join_request' ? '👋' :
                   notif.type === 'family_join_response' ? '👨‍👩‍👧‍👦' : '📩'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{fromUser?.avatar}</span>
                    <span className="text-sm font-medium text-gray-800">{fromUser?.name}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className={`text-sm ${!notif.read ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                  {notif.senderMessage && (
                    <p className="text-xs text-pink-600 italic mt-1">💌 "{notif.senderMessage}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  {isForMe && request?.status === 'pending' && !selectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(notif.id);
                        if (request?.id) {
                          handleViewRequest(request.id);
                        }
                      }}
                      className="mt-3 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1.5"
                    >
                      Выбрать блюда
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {isForMe && request?.status === 'completed' && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                      <CheckCheck className="w-4 h-4" />
                      <span>Выбор отправлен</span>
                    </div>
                  )}

                  {isMyResponse && !selectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(notif.id);
                        onViewResults(notif.requestId!);
                      }}
                      className="mt-3 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors flex items-center gap-1.5"
                    >
                      Посмотреть выбор
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {/* Family join request - для главы семьи */}
                  {notif.type === 'family_join_request' && !selectionMode && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead(notif.id);
                          // Открываем модалку для принятия/отклонения
                          const { setPendingNotification } = useStore.getState();
                          setPendingNotification(notif);
                        }}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-1.5"
                      >
                        Рассмотреть
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Family join response - для пользователя, который подавал заявку */}
                  {notif.type === 'family_join_response' && !selectionMode && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-600">
                      <span>👨‍👩‍👧‍👦</span>
                      <span>Перейдите в профиль для управления семьёй</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
