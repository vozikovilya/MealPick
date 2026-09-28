import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, PartyPopper } from 'lucide-react';

interface JoinResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
  accepted: boolean;
  familyName: string;
}

export function JoinResponseModal({
  isOpen,
  onClose,
  onNavigate,
  accepted,
  familyName,
}: JoinResponseModalProps) {
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
            {/* Иконка */}
            <div className="flex justify-center mb-4">
              {accepted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg"
                >
                  <PartyPopper className="w-10 h-10 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <XCircle className="w-10 h-10 text-white" />
                </motion.div>
              )}
            </div>

            {/* Заголовок */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-800 mb-2 text-center"
            >
              {accepted ? 'Добро пожаловать в семью!' : 'Заявка отклонена'}
            </motion.h3>

            {/* Сообщение */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-6"
            >
              {accepted ? (
                <>
                  <p className="text-gray-600 mb-2">
                    Поздравляем! Вы теперь часть семьи
                  </p>
                  <p className="text-lg font-semibold text-purple-600">
                    "{familyName}"
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Теперь вы можете выбирать блюда вместе с вашей семьёй! 🎉
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">
                    К сожалению, ваша заявка на вступление в семью
                  </p>
                  <p className="text-lg font-semibold text-gray-700">
                    "{familyName}"
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    была отклонена. Не расстраивайтесь, вы можете создать свою собственную семью! 💪
                  </p>
                </>
              )}
            </motion.div>

            {/* Кнопки */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <button
                onClick={onNavigate}
                className={`w-full py-3 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  accepted
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200 hover:shadow-xl'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200 hover:shadow-xl'
                }`}
              >
                {accepted ? (
                  <>
                    <Check className="w-5 h-5" />
                    Перейти в профиль семьи
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Закрыть
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Закрыть позже
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
