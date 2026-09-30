import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { usePolling } from '../hooks/usePolling';
import type { AppNotification as Notification } from '../types';
import { ArrowRight, CheckCheck, Inbox, Check, Trash2, CheckSquare, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onOpenSwipe: (requestId: number) => void;
  onViewResults: (requestId: number) => void;
  onViewDetails?: (requestId: number) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function Notifications({ onOpenSwipe, onViewResults, onViewDetails, onUnreadCountChange }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  useEffect(() => {
    loadNotifications();
  }, []);

  // Polling для обновления уведомлений в реальном времени
  usePolling(
    async () => {
      const response = await api.getNotifications();
      const newNotifications = response.data.notifications;

      // Обновляем список только если есть изменения
      setNotifications((prev) => {
        const prevIds = new Set(prev.map((n) => n.id));
        const hasNewNotifications = newNotifications.some((n) => !prevIds.has(n.id));
        const hasReadChanges = newNotifications.some((n) => {
          const prevNotif = prev.find((p) => p.id === n.id);
          return prevNotif && prevNotif.is_read !== n.is_read;
        });

        if (hasNewNotifications || hasReadChanges) {
          return newNotifications;
        }
        return prev;
      });
    },
    3_000,
    !loading
  );

  // Обновляем счётчик непрочитанных
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [notifications, onUnreadCountChange]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const toggleSelection = (id: number) => {
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

  const handleMarkSelectedRead = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.updateNotifications({ notification_ids: selectedIds });
      await loadNotifications();
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Ошибка обновления уведомлений:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.updateNotifications({ delete_ids: selectedIds });
      await loadNotifications();
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Ошибка удаления уведомлений:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.updateNotifications({ mark_all_read: true });
      await loadNotifications();
    } catch (error) {
      console.error('Ошибка обновления уведомлений:', error);
    }
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
  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
          <p className="text-gray-600">Загрузка уведомлений...</p>
        </div>
      </motion.div>
    );
  }

  if (notifications.length === 0) {
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
          className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Inbox className="w-10 h-10 text-gray-400" />
        </motion.div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">Нет уведомлений</h2>
        <p className="text-sm text-gray-500">
          Когда вам придут запросы или ответы, они появятся здесь
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800">Уведомления</h2>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key={unreadCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-red-500 rounded-full"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
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
                <CheckSquare className="w-3.5 h-3.5" />
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
            className="overflow-hidden"
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

      <AnimatePresence initial={false}>
        <div className="space-y-3">
        {sortedNotifications.map((notif, index) => {
          const isSelected = selectedIds.includes(notif.id);
          const isSwipeRequest = notif.type === 'swipe_request';
          const isSwipeResponse = notif.type === 'swipe_response';
          const isFamilyJoinRequest = notif.type === 'family_join_request';
          const isFamilyJoinResponse = notif.type === 'family_join_response';

          return (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`p-4 rounded-2xl border-2 transition-all ${
                !notif.is_read
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
                  !notif.is_read ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  {isSwipeRequest ? '🍳' : 
                   isSwipeResponse ? '✅' :
                   isFamilyJoinRequest ? '👋' :
                   isFamilyJoinResponse ? '👨‍👩‍👧‍👦' : '📩'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{notif.from_user_avatar}</span>
                    <span className="text-sm font-medium text-gray-800">{notif.from_user_name}</span>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className={`text-sm ${!notif.is_read ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                  {notif.sender_message && (
                    <p className="text-xs text-pink-600 italic mt-1">💌 "{notif.sender_message}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  {/* Action buttons */}
                  {isSwipeRequest && notif.request_id && !selectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSwipe(notif.request_id!);
                      }}
                      className="mt-3 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-1.5"
                    >
                      Выбрать блюда
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {isSwipeResponse && notif.request_id && !selectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewDetails) {
                          onViewDetails(notif.request_id!);
                        } else {
                          onViewResults(notif.request_id!);
                        }
                      }}
                      className="mt-3 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors flex items-center gap-1.5"
                    >
                      Подробнее
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {isFamilyJoinRequest && !selectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Переход в блок "Семья" будет обработан в App.tsx
                        window.location.hash = '#family';
                      }}
                      className="mt-3 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-1.5"
                    >
                      <Users className="w-4 h-4" />
                      Перейти в семью
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {isFamilyJoinResponse && !selectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Переход в блок "Семья" будет обработан в App.tsx
                        window.location.hash = '#family';
                      }}
                      className="mt-3 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-1.5"
                    >
                      <Users className="w-4 h-4" />
                      Перейти в семью
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      </AnimatePresence>
    </div>
  );
}
