import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, Clock } from 'lucide-react';

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onLater: () => void;
  userName: string;
  userEmail: string;
  userAvatar: string;
}

export function JoinRequestModal({
  isOpen,
  onClose,
  onAccept,
  onReject,
  onLater,
  userName,
  userEmail,
  userAvatar,
}: JoinRequestModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Заявка на вступление</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Информация о пользователе */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{userAvatar}</span>
                <div>
                  <p className="font-semibold text-gray-800">{userName}</p>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Сообщение */}
            <p className="text-sm text-gray-600 mb-6">
              Этот пользователь хочет присоединиться к вашей семье. Выберите действие:
            </p>

            {/* Кнопки действий */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={onAccept}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Принять
                </button>
                <button
                  onClick={onReject}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-red-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Отклонить
                </button>
              </div>
              
              <button
                onClick={onLater}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Позже
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
