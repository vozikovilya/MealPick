import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'swipe_request' | 'swipe_response';
  title: string;
  message: string;
  fromUserAvatar: string;
  fromUserName: string;
  requestId: number;
  onAction?: () => void;
}

interface ToastNotificationsProps {
  notifications: ToastNotification[];
  onClose: (id: string) => void;
  onAction: (notification: ToastNotification) => void;
}

export function ToastNotifications({ notifications, onClose, onAction }: ToastNotificationsProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header with gradient */}
            <div className={`h-1 ${
              notification.type === 'swipe_request' 
                ? 'bg-gradient-to-r from-orange-400 to-amber-400'
                : 'bg-gradient-to-r from-green-400 to-emerald-400'
            }`} />

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                    {notification.fromUserAvatar}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 text-sm truncate">
                      {notification.title}
                    </h4>
                    {notification.type === 'swipe_request' ? (
                      <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                  
                  {/* Action button */}
                  {notification.onAction && (
                    <button
                      onClick={() => onAction(notification)}
                      className={`w-full py-2 text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md ${
                        notification.type === 'swipe_request'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                      }`}
                    >
                      {notification.type === 'swipe_request' ? 'Выбрать блюда' : 'Посмотреть выбор'}
                    </button>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={() => onClose(notification.id)}
                  className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
