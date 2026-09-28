import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Users } from 'lucide-react';

interface RequestSentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentToInfo?: {
    type: 'family' | 'members';
    familyName?: string;
    members?: Array<{ name: string; avatar: string }>;
  } | null;
}

export function RequestSentModal({ isOpen, onClose, sentToInfo }: RequestSentModalProps) {
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
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Send className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            {/* Заголовок */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-800 mb-2 text-center"
            >
              Запрос отправлен! 🎉
            </motion.h3>

            {/* Сообщение */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-6"
            >
              {/* Информация о получателях */}
              {sentToInfo && (
                <div className="mb-4">
                  {sentToInfo.type === 'family' ? (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <p className="text-sm font-semibold text-purple-800">
                          Отправлено всей семье
                        </p>
                      </div>
                      {sentToInfo.familyName && (
                        <p className="text-xs text-purple-600">
                          Семья: {sentToInfo.familyName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm font-semibold text-blue-800 mb-3">
                        Отправлено участникам:
                      </p>
                      <div className="space-y-2">
                        {sentToInfo.members?.map((member, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2">
                            <span className="text-xl">{member.avatar}</span>
                            <span className="text-sm text-gray-700">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <p className="text-sm text-orange-800">
                  💡 Как только участники увидят оповещение, они сделают выбор, и вы сразу об этом узнаете!
                </p>
              </div>
            </motion.div>

            {/* Кнопка */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Закрыть
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
