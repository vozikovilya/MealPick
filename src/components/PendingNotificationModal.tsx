import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';
import { useStore } from '../store';
import { X, ArrowRight, Heart, Sparkles } from 'lucide-react';

interface Props {
  notification: Notification;
  onClose: () => void;
  onAction: () => void;
}

export function PendingNotificationModal({ notification, onClose, onAction }: Props) {
  const { users } = useStore();
  const fromUser = users.find((u) => u.id === notification.fromUserId);

  const isRequest = notification.type === 'swipe_request';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Header with gradient */}
          <div className={`relative h-32 flex items-center justify-center ${
            isRequest
              ? 'bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500'
              : 'bg-gradient-to-br from-green-400 via-emerald-400 to-green-500'
          }`}>
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative text-6xl"
            >
              {isRequest ? '🍽️' : '🎉'}
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                {fromUser?.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-800">{fromUser?.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Message */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {isRequest ? 'Новый запрос!' : 'Есть ответ!'}
              </h3>
              <p className="text-sm text-gray-600">{notification.message}</p>
              {notification.senderMessage && (
                <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-700 italic">
                      "{notification.senderMessage}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              onClick={onAction}
              className={`w-full py-3.5 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                isRequest
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200 hover:shadow-xl'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200 hover:shadow-xl'
              }`}
            >
              {isRequest ? 'Выбрать блюда' : 'Посмотреть выбор'}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Skip link */}
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Позже
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
