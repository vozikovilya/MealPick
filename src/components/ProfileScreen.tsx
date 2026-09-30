import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { User, ArrowLeft, Edit2, LogOut, Check, Trash2, Mail, Lock, AtSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType, Family } from '../services/api';

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export function ProfileScreen({ onBack, onLogout }: Props) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await api.getProfile();
      setUser(profileResponse.data.user);
    } catch (error: any) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-gray-600">Ошибка загрузки профиля</p>
        </div>
      </motion.div>
    );
  }

  return (
    <PersonalProfile user={user} onUpdate={loadProfile} onBack={onBack} onLogout={onLogout} />
  );
}

function PersonalProfile({
  user,
  onUpdate,
  onBack,
  onLogout,
}: {
  user: UserType;
  onUpdate: () => void;
  onBack: () => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [description, setDescription] = useState(user.description || '');
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const avatars = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨', '👩', '🧑', '👦', '👧', '🧒'];

  const handleSave = async () => {
    setError('');
    try {
      await api.updateProfile({ name, avatar, description });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    }
  };

  const handleSaveCredentials = async () => {
    setError('');
    const data: any = {};
    if (email !== user.email) data.email = email;
    if (username !== user.username) data.username = username;
    if (password) data.password = password;
    
    if (Object.keys(data).length === 0) {
      setError('Нет изменений для сохранения');
      return;
    }
    
    try {
      await api.updateProfile(data);
      setCredentialsSaved(true);
      setPassword('');
      setTimeout(() => setCredentialsSaved(false), 2000);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      await api.deleteAccount();
      window.location.reload();
    } catch (err: any) {
      setDeleteError(err.message || 'Ошибка удаления');
    }
  };

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Я</h2>
      </div>

      {/* Карточка профиля */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {!isEditing ? (
          /* Режим просмотра */
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center text-5xl shadow-sm">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
                {user.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{user.description}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3 bg-orange-50 text-orange-600 font-medium rounded-xl hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Редактировать
            </button>
          </div>
        ) : (
          /* Режим редактирования */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">Редактирование профиля</h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name);
                  setAvatar(user.avatar);
                  setDescription(user.description || '');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Аватар</label>
              <div className="flex gap-2 flex-wrap">
                {avatars.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                      avatar === a ? 'bg-orange-100 ring-2 ring-orange-400' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">О себе</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Расскажите о себе..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
              />
            </div>

            {/* Save Profile */}
            <button
              onClick={async () => {
                await handleSave();
                setIsEditing(false);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Сохранено!
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Сохранить изменения
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Данные для входа */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Данные для входа</h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <AtSign className="w-4 h-4" /> Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Новый пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Оставьте пустым, чтобы не менять"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleSaveCredentials}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            {credentialsSaved ? (
              <>
                <Check className="w-5 h-5" />
                Сохранено!
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Обновить данные входа
              </>
            )}
          </button>
        </div>
      </div>

      {/* Выйти из аккаунта */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Выйти из аккаунта
      </button>

      {/* Удаление аккаунта */}
      <div className="bg-white rounded-2xl border border-red-200 p-5 space-y-4">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Удалить аккаунт
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-800 font-medium mb-1">Вы уверены?</p>
              <p className="text-xs text-red-600">Это действие нельзя отменить. Все ваши данные будут удалены.</p>
            </div>
            
            {deleteError && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">{deleteError}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteError('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
