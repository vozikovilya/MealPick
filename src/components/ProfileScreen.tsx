import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { User, Users, ArrowLeft, Edit2, LogOut, Copy, Check, Trash2, Mail, Lock, AtSign, Crown, Link, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType, Family, FamilyMember, JoinRequest } from '../services/api';

type ProfileView = 'main' | 'personal' | 'family';

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export function ProfileScreen({ onBack, onLogout }: Props) {
  const [view, setView] = useState<ProfileView>('main');
  const [user, setUser] = useState<UserType | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await api.getProfile();
      setUser(profileResponse.data.user);
      
      if (profileResponse.data.family) {
        setFamily(profileResponse.data.family);
        const familyResponse = await api.getFamily();
        setMembers(familyResponse.data.members);
        setPendingRequests(familyResponse.data.pendingRequests);
      }
    } catch (error: any) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Ошибка загрузки профиля</p>
      </div>
    );
  }

  if (view === 'personal') {
    return <PersonalProfile user={user} onUpdate={loadProfile} onBack={() => setView('main')} />;
  }

  if (view === 'family') {
    return (
      <FamilyProfileView
        family={family}
        currentUser={user}
        members={members}
        pendingRequests={pendingRequests}
        onCreate={loadProfile}
        onBack={() => setView('main')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">Профиль</h2>
      </div>

      {/* User card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="text-5xl mb-3">{user.avatar}</div>
        <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Menu */}
      <div className="space-y-3">
        <button
          onClick={() => setView('personal')}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-orange-200 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-gray-800">Личный профиль</h4>
            <p className="text-xs text-gray-500">Аватар, имя, описание, данные входа</p>
          </div>
        </button>

        <button
          onClick={() => setView('family')}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-orange-200 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-gray-800">Профиль семьи</h4>
            <p className="text-xs text-gray-500">
              {family ? 'Управление семейным профилем' : 'Создать или присоединиться к семье'}
            </p>
          </div>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Выйти из аккаунта
      </button>
    </div>
  );
}

function PersonalProfile({
  user,
  onUpdate,
  onBack,
}: {
  user: UserType;
  onUpdate: () => void;
  onBack: () => void;
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
      await api.deleteFamily();
      // После удаления семьи пользователь будет перенаправлен на экран входа
      window.location.reload();
    } catch (err: any) {
      setDeleteError(err.message || 'Ошибка удаления');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Личный профиль</h2>
      </div>

      {/* Основная информация */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
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
          onClick={handleSave}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Сохранено!
            </>
          ) : (
            <>
              <Edit2 className="w-5 h-5" />
              Сохранить изменения
            </>
          )}
        </button>
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

function FamilyProfileView({
  family,
  currentUser,
  members,
  pendingRequests,
  onCreate,
  onBack,
}: {
  family: Family | null;
  currentUser: UserType;
  members: FamilyMember[];
  pendingRequests: JoinRequest[];
  onCreate: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(family?.name || '');
  const [avatar, setAvatar] = useState(family?.avatar || '👨‍👩‍👧‍👦');
  const [description, setDescription] = useState(family?.description || '');
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  const [joinError, setJoinError] = useState('');

  const familyAvatars = ['👨‍👩‍👧‍👦', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👦', '👩‍👦', '👨‍👧', '👩‍👧', '🏠', '❤️'];

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await api.createFamily({ name, avatar, description });
      // Сначала обновляем данные семьи
      await onCreate();
      // Затем показываем модальное окно
      setShowSuccess(true);
    } catch (error: any) {
      alert(error.message || 'Ошибка создания семьи');
    }
  };

  const handleCopyLink = () => {
    if (family?.invite_link) {
      navigator.clipboard.writeText(family.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestJoin = async () => {
    if (!joinLink.trim()) return;
    setJoinError('');
    try {
      await api.joinFamily(joinLink.trim());
      setJoinLink('');
      alert('Заявка отправлена!');
      onCreate();
    } catch (error: any) {
      setJoinError(error.message || 'Ошибка отправки заявки');
    }
  };

  const handleRespondToRequest = async (requestId: number, accept: boolean) => {
    try {
      await api.respondToJoinRequest(requestId, accept);
      onCreate();
    } catch (error: any) {
      alert(error.message || 'Ошибка обработки заявки');
    }
  };

  // If no family - show join or create options
  if (!family) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Профиль семьи</h2>
        </div>

        {/* Join Family */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Link className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Присоединиться к семье</h3>
              <p className="text-xs text-gray-500">Вставьте ссылку-приглашение</p>
            </div>
          </div>
          
          <input
            type="text"
            value={joinLink}
            onChange={(e) => setJoinLink(e.target.value)}
            placeholder="https://mealspick.app/join/..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
          />
          
          {joinError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{joinError}</p>
            </div>
          )}
          
          <button
            onClick={handleRequestJoin}
            disabled={!joinLink.trim()}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отправить заявку
          </button>
        </div>

        {/* Create Family */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Создать новую семью</h3>
              <p className="text-xs text-gray-500">Станьте главой семьи</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Аватар семьи</label>
            <div className="flex gap-2 flex-wrap">
              {familyAvatars.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    avatar === a ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Название семьи</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Семья Ивановых"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Описание (необязательно)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="О вашей семье..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Создать профиль семьи
          </button>
        </div>
      </div>
    );
  }

  // Family exists - show management interface
  const isOwner = family.owner_id === currentUser.id;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Профиль семьи</h2>
      </div>

      {/* Success modal */}
      {showSuccess && family && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSuccess(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">{family.avatar}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Семья создана!</h3>
              <p className="text-gray-600">{family.name}</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-purple-700 text-center">
                Поделитесь ссылкой-приглашением с участниками семьи
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-6">
              <label className="text-xs font-medium text-gray-600 mb-2 block">Ссылка для приглашения</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={family.invite_link}
                  readOnly
                  className="flex-1 text-sm text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200 outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Отлично!
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Family card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="text-5xl mb-3">{family.avatar}</div>
        <h3 className="text-lg font-bold text-gray-800">{family.name}</h3>
        {family.description && <p className="text-sm text-gray-500 mt-1">{family.description}</p>}
      </div>

      {/* Pending Requests (for owner) */}
      {isOwner && pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-200 space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-500" />
            Заявки на вступление ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">{request.avatar}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{request.name}</p>
                  <p className="text-xs text-gray-500">{request.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespondToRequest(request.id, true)}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Принять
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request.id, false)}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Участники ({members.length})</h3>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
              <span className="text-2xl">{member.avatar}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
                {member.status && (
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                    <span>{member.status.emoji}</span>
                    <span>{member.status.title}</span>
                  </div>
                )}
              </div>
              {member.role === 'owner' && (
                <div title="Глава семьи">
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ссылка для приглашения</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={family.invite_link}
            readOnly
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'OK' : 'Копировать'}
          </button>
        </div>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Присоединяйся к семье "${family.name}" в MealPick!`,
                text: `Присоединяйся к нашей семье в MealPick и выбирай блюда вместе!`,
                url: family.invite_link,
              });
            } else {
              handleCopyLink();
            }
          }}
          className="w-full py-3 bg-purple-50 text-purple-600 font-medium rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
        >
          📤 Поделиться ссылкой
        </button>
      </div>
    </div>
  );
}
