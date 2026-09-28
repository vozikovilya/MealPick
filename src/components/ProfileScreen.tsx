import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { User, Users, ArrowLeft, Edit2, LogOut, Copy, Check, Trash2, Mail, Lock, AtSign, Crown, Link, UserPlus, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType, Family, FamilyMember, JoinRequest } from '../services/api';
import { JoinRequestModal } from './JoinRequestModal';
import { JoinResponseModal } from './JoinResponseModal';

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
      
      // Всегда загружаем полную информацию о семье через getFamily()
      const familyResponse = await api.getFamily();
      if (familyResponse.data.family) {
        setFamily(familyResponse.data.family);
        setMembers(familyResponse.data.members);
        setPendingRequests(familyResponse.data.pendingRequests);
      } else {
        setFamily(null);
        setMembers([]);
        setPendingRequests([]);
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
    return <PersonalProfile user={user} family={family} onUpdate={loadProfile} onBack={() => setView('main')} />;
  }

  const handleDeleteFamily = async () => {
    try {
      await api.deleteFamily();
      setFamily(null);
      setMembers([]);
      setPendingRequests([]);
      setView('main');
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления семьи');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await api.removeFamilyMember(memberId);
      await loadProfile();
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления участника');
    }
  };

  const handleAddStatus = async (userId: number, title: string, emoji: string) => {
    try {
      await api.addFamilyStatus(userId, title, emoji);
      await loadProfile();
    } catch (error: any) {
      alert(error.message || 'Ошибка добавления статуса');
    }
  };

  if (view === 'family') {
    return (
      <FamilyProfileView
        family={family}
        currentUser={user}
        members={members}
        pendingRequests={pendingRequests}
        onCreate={loadProfile}
        onDelete={handleDeleteFamily}
        onRemoveMember={handleRemoveMember}
        onAddStatus={handleAddStatus}
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
  family,
  onUpdate,
  onBack,
}: {
  user: UserType;
  family: Family | null;
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
      await api.deleteAccount();
      // После удаления аккаунта выходим и перенаправляем на экран входа
      api.logout();
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
        {family && family.owner_id === user.id && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              ⚠️ Вы являетесь главой семьи "{family.name}". Сначала удалите профиль семьи или передайте права другому участнику.
            </p>
          </div>
        )}
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!!(family && family.owner_id === user.id)}
            className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  onDelete,
  onRemoveMember,
  onAddStatus,
  onBack,
}: {
  family: Family | null;
  currentUser: UserType;
  members: FamilyMember[];
  pendingRequests: JoinRequest[];
  onCreate: () => void;
  onDelete: () => void;
  onRemoveMember: (memberId: number) => void;
  onAddStatus: (userId: number, title: string, emoji: string) => void;
  onBack: () => void;
}) {
  const [localFamily, setLocalFamily] = useState<Family | null>(family);
  const [name, setName] = useState(family?.name || '');
  const [avatar, setAvatar] = useState(family?.avatar || '👨‍👩‍👧‍👦');
  const [description, setDescription] = useState(family?.description || '');
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [showJoinResponse, setShowJoinResponse] = useState(false);
  const [joinResponseAccepted, setJoinResponseAccepted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [openActionsMenu, setOpenActionsMenu] = useState<number | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null);

  // Синхронизация localFamily с пропсом family
  useEffect(() => {
    setLocalFamily(family);
  }, [family]);

  const familyAvatars = ['👨‍👩‍👧‍👦', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👦', '👩‍👦', '👨‍👧', '👩‍👧', '🏠', '❤️'];

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await api.createFamily({ name, avatar, description });
      // Обновляем состояние в родительском компоненте (загружает полные данные семьи)
      await onCreate();
      // Показываем модальное окно
      setShowSuccess(true);
    } catch (error: any) {
      alert(error.message || 'Ошибка создания семьи');
    }
  };

  const handleDeleteFamily = async () => {
    setDeleteError('');
    try {
      await api.deleteFamily();
      setShowDeleteConfirm(false);
      // Перезагружаем страницу для обновления состояния
      window.location.reload();
    } catch (error: any) {
      setDeleteError(error.message || 'Ошибка удаления семьи');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await api.removeFamilyMember(memberId);
      onRemoveMember(memberId);
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления участника');
    }
  };

  const handleAddStatus = async (userId: number, title: string, emoji: string) => {
    try {
      await api.addFamilyStatus(userId, title, emoji);
      onAddStatus(userId, title, emoji);
    } catch (error: any) {
      alert(error.message || 'Ошибка добавления статуса');
    }
  };

  const handleAssignRole = async (userId: number, role: string) => {
    try {
      await api.assignFamilyRole(userId, role);
      await onCreate(); // Перезагружаем данные семьи
      setOpenActionsMenu(null);
    } catch (error: any) {
      alert(error.message || 'Ошибка назначения роли');
    }
  };

  const handleRemoveMemberFromFamily = async (memberId: number) => {
    try {
      await api.removeFamilyMember(memberId);
      await onCreate(); // Перезагружаем данные семьи
      setShowRemoveConfirm(null);
      setOpenActionsMenu(null);
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления участника');
    }
  };

  const handleShareToSocial = (platform: string) => {
    if (!localFamily) return;
    
    const url = encodeURIComponent(localFamily.invite_link);
    const text = encodeURIComponent(`Присоединяйся к нашей семье "${localFamily.name}" в MealPick и выбирай блюда вместе!`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'viber':
        shareUrl = `viber://forward?text=${text}%20${url}`;
        break;
      case 'vk':
        shareUrl = `https://vk.com/share.php?url=${url}&title=${text}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    if (!localFamily?.invite_link) {
      console.error('Ссылка-приглашение недоступна');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(localFamily.invite_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Ошибка копирования:', error);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = localFamily.invite_link;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback копирование не удалось:', err);
      }
      document.body.removeChild(textArea);
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
      setSelectedRequest(null);
      setJoinResponseAccepted(accept);
      setShowJoinResponse(true);
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
  const isOwner = localFamily?.owner_id === currentUser.id;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Профиль семьи</h2>
      </div>

      {/* Success modal */}
      {showSuccess && localFamily && (
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
                <span className="text-4xl">{localFamily.avatar}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Семья создана!</h3>
              <p className="text-gray-600">{localFamily.name}</p>
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
                  value={localFamily.invite_link}
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
        <div className="text-5xl mb-3">{localFamily?.avatar}</div>
        <h3 className="text-lg font-bold text-gray-800">{localFamily?.name}</h3>
        {localFamily?.description && <p className="text-sm text-gray-500 mt-1">{localFamily.description}</p>}
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
              <div 
                key={request.id} 
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => setSelectedRequest(request)}
              >
                <span className="text-2xl">{request.avatar}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{request.name}</p>
                  <p className="text-xs text-gray-500">{request.email}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRequest(request);
                  }}
                  className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Рассмотреть
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Участники ({members.length})</h3>
        <div className="space-y-2">
          {members
            .sort((a, b) => {
              // Иерархия: владелец первый, потом поварушки, потом остальные
              if (a.role === 'owner') return -1;
              if (b.role === 'owner') return 1;
              if (a.role === 'chef' && b.role !== 'chef') return -1;
              if (b.role === 'chef' && a.role !== 'chef') return 1;
              // Остальные по дате加入
              return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
            })
            .map((member) => {
              const isCurrentUser = member.id === currentUser.id;
              const canAssignRole = isOwner && member.id !== currentUser.id;
              
              return (
                <div 
                  key={member.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isCurrentUser 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <span className="text-2xl">{member.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{member.name}</p>
                      {isCurrentUser && (
                        <span className="text-xs text-orange-600 font-medium">(Вы)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {member.role === 'owner' && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                          <Crown className="w-3 h-3" />
                          <span>Глава семьи</span>
                        </div>
                      )}
                      {member.role === 'chef' && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          <span>👨‍🍳</span>
                          <span>Поварушка</span>
                        </div>
                      )}
                      {member.status && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                          <span>{member.status.emoji}</span>
                          <span>{member.status.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {canAssignRole && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenActionsMenu(openActionsMenu === member.id ? null : member.id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        Действия
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {openActionsMenu === member.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              const newRole = member.role === 'chef' ? 'member' : 'chef';
                              handleAssignRole(member.id, newRole);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            <span>{member.role === 'chef' ? '🚫' : '👨‍🍳'}</span>
                            <span>{member.role === 'chef' ? 'Убрать роль Поварушки' : 'Назначить Поварушкой'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowRemoveConfirm(member.id);
                              setOpenActionsMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Удалить из семьи</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Invite link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ссылка для приглашения</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={localFamily?.invite_link || ''}
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
            if (!localFamily) return;
            
            // Пробуем использовать нативный Share API
            if (navigator.share) {
              navigator.share({
                title: `Присоединяйся к семье "${localFamily.name}" в MealPick!`,
                text: `Присоединяйся к нашей семье в MealPick и выбирай блюда вместе!`,
                url: localFamily.invite_link,
              }).catch(() => {
                // Если пользователь отменил шаринг, показываем меню
                setShowShareMenu(true);
              });
            } else {
              // Если Share API недоступен, показываем меню шаринга
              setShowShareMenu(true);
            }
          }}
          className="w-full py-3 bg-purple-50 text-purple-600 font-medium rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
        >
          📤 Поделиться в соцсетях
        </button>
      </div>

      {/* Delete Family Section (for owner) */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-red-200 p-5 space-y-4">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Удалить профиль семьи
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 font-medium mb-1">Вы уверены?</p>
                <p className="text-xs text-red-600">Профиль семьи будет удалён для всех участников.</p>
              </div>
              
              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{deleteError}</p>
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
                  onClick={handleDeleteFamily}
                  className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Модалка заявки на вступление */}
      {selectedRequest && localFamily && (
        <JoinRequestModal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          onAccept={() => handleRespondToRequest(selectedRequest.id, true)}
          onReject={() => handleRespondToRequest(selectedRequest.id, false)}
          onLater={() => setSelectedRequest(null)}
          userName={selectedRequest.name}
          userEmail={selectedRequest.email}
          userAvatar={selectedRequest.avatar}
        />
      )}

      {/* Модалка результата заявки */}
      {showJoinResponse && localFamily && (
        <JoinResponseModal
          isOpen={true}
          onClose={() => setShowJoinResponse(false)}
          onNavigate={() => {
            setShowJoinResponse(false);
            if (joinResponseAccepted) {
              // Переход в профиль семьи
              window.location.reload();
            }
          }}
          accepted={joinResponseAccepted}
          familyName={localFamily.name}
        />
      )}

      {/* Модалка подтверждения удаления участника */}
      {showRemoveConfirm && localFamily && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowRemoveConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Удалить участника</h3>
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Вы уверены, что хотите удалить этого участника из семьи "{localFamily.name}"?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleRemoveMemberFromFamily(showRemoveConfirm)}
                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Модалка шаринга в социальные сети */}
      {showShareMenu && localFamily && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowShareMenu(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Поделиться в соцсетях</h3>
              <button
                onClick={() => setShowShareMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Пригласите друзей и семью присоединиться к "{localFamily.name}" в MealPick!
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Telegram */}
              <button
                onClick={() => handleShareToSocial('telegram')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                  ✈️
                </div>
                <span className="text-xs font-medium text-gray-700">Telegram</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShareToSocial('whatsapp')}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">
                  💬
                </div>
                <span className="text-xs font-medium text-gray-700">WhatsApp</span>
              </button>

              {/* Viber */}
              <button
                onClick={() => handleShareToSocial('viber')}
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl">
                  📱
                </div>
                <span className="text-xs font-medium text-gray-700">Viber</span>
              </button>

              {/* VK */}
              <button
                onClick={() => handleShareToSocial('vk')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  VK
                </div>
                <span className="text-xs font-medium text-gray-700">ВКонтакте</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShareToSocial('facebook')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  f
                </div>
                <span className="text-xs font-medium text-gray-700">Facebook</span>
              </button>

              {/* Twitter */}
              <button
                onClick={() => handleShareToSocial('twitter')}
                className="flex flex-col items-center gap-2 p-4 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white text-2xl">
                  🐦
                </div>
                <span className="text-xs font-medium text-gray-700">Twitter</span>
              </button>
            </div>

            <button
              onClick={() => {
                handleCopyLink();
                setShowShareMenu(false);
              }}
              className="w-full mt-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Скопировать ссылку
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
