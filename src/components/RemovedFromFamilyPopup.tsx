import { motion, AnimatePresence } from 'framer-motion';
import { X, UserX } from 'lucide-react';

interface RemovedFromFamilyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  familyName: string;
}

export function RemovedFromFamilyPopup({
  isOpen,
  onClose,
  familyName,
}: RemovedFromFamilyPopupProps) {
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
              <h3 className="text-xl font-bold text-gray-800">Вас удалили из семьи</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Иконка */}
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-red-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <UserX className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            {/* Сообщение */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">
                Глава семьи удалил Вас из семьи
              </p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-3">
                <p className="text-lg font-bold text-gray-700">
                  "{familyName}"
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Вы больше не являетесь участником этой семьи. Вы можете создать свою собственную семью или присоединиться к другой.
              </p>
            </div>

            {/* Кнопка */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all"
            >
              Понятно
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
