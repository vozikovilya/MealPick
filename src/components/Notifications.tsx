import { useStore } from '../store';
import { Bell, ArrowRight, CheckCheck, Clock, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onOpenSwipe: (requestId: string) => void;
  onViewResults: (requestId: string) => void;
}

export function Notifications({ onOpenSwipe, onViewResults }: Props) {
  const { notifications, users, swipeRequests, markNotificationRead, currentUserId } = useStore();

  const sortedNotifications = [...notifications].sort((a, b) => b.createdAt - a.createdAt);

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
      <h2 className="text-xl font-bold text-gray-800">Запросы и ответы</h2>

      <div className="space-y-3">
        {sortedNotifications.map((notif, index) => {
          const fromUser = users.find((u) => u.id === notif.fromUserId);
          const request = notif.requestId
            ? swipeRequests.find((r) => r.id === notif.requestId)
            : null;
          const isForMe = notif.type === 'swipe_request' && request?.toUserId === currentUserId;
          const isMyResponse = notif.type === 'swipe_response' && request?.fromUserId === currentUserId;

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-2xl border-2 transition-all ${
                !notif.read
                  ? 'border-orange-200 bg-orange-50/50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">
                  {notif.type === 'swipe_request' ? '🍳' : '✅'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{fromUser?.avatar}</span>
                    <span className="text-sm font-medium text-gray-800">{fromUser?.name}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  {/* Action button */}
                  {isForMe && request?.status === 'pending' && (
                    <button
                      onClick={() => {
                        markNotificationRead(notif.id);
                        onOpenSwipe(request.id);
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

                  {isMyResponse && (
                    <button
                      onClick={() => {
                        markNotificationRead(notif.id);
                        onViewResults(request?.id || '');
                      }}
                      className="mt-3 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors flex items-center gap-1.5"
                    >
                      Посмотреть выбор
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
