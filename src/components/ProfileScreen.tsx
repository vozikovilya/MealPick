import { useState } from 'react';
import { useStore } from '../store';
import { User, Users, ArrowLeft, Edit2, LogOut, Copy, Check, Trash2, Mail, Lock, AtSign, Crown, Link, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FamilyProfile, FamilyJoinRequest, FamilyStatus } from '../types';

type ProfileView = 'main' | 'personal' | 'family';

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export function ProfileScreen({ onBack, onLogout }: Props) {
  const [view, setView] = useState<ProfileView>('main');
  const { users, currentUserId, familyProfile, createFamilyProfile, updateProfile, updateFamilyProfile, logout, deleteAccount, deleteFamilyProfile, removeFamilyMember, requestJoinFamily, respondToJoinRequest, addFamilyStatus, removeFamilyStatus, familyJoinRequests } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);

  if (!currentUser) return null;

  if (view === 'personal') {
    return <PersonalProfile user={currentUser} familyProfile={familyProfile} onUpdate={updateProfile} onUpdateCredentials={useStore.getState().updateCredentials} onDeleteAccount={deleteAccount} onBack={() => setView('main')} onLogout={onLogout} />;
  }

  if (view === 'family') {
    return (
      <FamilyProfileView
        family={familyProfile}
        currentUser={currentUser}
        users={users}
        familyJoinRequests={familyJoinRequests}
        onCreate={createFamilyProfile}
        onUpdate={updateFamilyProfile}
        onDelete={deleteFamilyProfile}
        onRemoveMember={removeFamilyMember}
        onRequestJoin={requestJoinFamily}
        onRespondToRequest={respondToJoinRequest}
        onAddStatus={addFamilyStatus}
        onRemoveStatus={removeFamilyStatus}
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
        <div className="text-5xl mb-3">{currentUser.avatar}</div>
        <h3 className="text-lg font-bold text-gray-800">{currentUser.name}</h3>
        <p className="text-sm text-gray-500">{currentUser.email}</p>
        {currentUser.familyStatus && (
          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            <span>{currentUser.familyStatus.emoji}</span>
            <span>{currentUser.familyStatus.title}</span>
          </div>
        )}
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
              {familyProfile ? 'Управление семейным профилем' : 'Создать или присоединиться к семье'}
            </p>
          </div>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          onLogout();
        }}
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
  familyProfile,
  onUpdate,
  onUpdateCredentials,
  onDeleteAccount,
  onBack,
  onLogout,
}: {
  user: any;
  familyProfile: any;
  onUpdate: (data: any) => void;
  onUpdateCredentials: (data: any) => { success: boolean; message: string };
  onDeleteAccount: () => { success: boolean; message: string };
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

  const handleSave = () => {
    onUpdate({ name, avatar, description });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveCredentials = () => {
    setError('');
    const data: any = {};
    if (email !== user.email) data.email = email;
    if (username !== user.username) data.username = username;
    if (password) data.password = password;
    
    if (Object.keys(data).length === 0) {
      setError('Нет изменений для сохранения');
      return;
    }
    
    const result = onUpdateCredentials(data);
    if (result.success) {
      setCredentialsSaved(true);
      setPassword('');
      setTimeout(() => setCredentialsSaved(false), 2000);
    } else {
      setError(result.message);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteError('');
    const result = onDeleteAccount();
    if (result.success) {
      onLogout();
    } else {
      setDeleteError(result.message);
    }
  };

  const isFamilyOwner = familyProfile && familyProfile.ownerId === user.id;

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
        {isFamilyOwner && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              ⚠️ Вы являетесь создателем профиля семьи. Сначала удалите профиль семьи или передайте права другому участнику.
            </p>
          </div>
        )}

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isFamilyOwner}
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
  users,
  familyJoinRequests,
  onCreate,
  onUpdate,
  onDelete,
  onRemoveMember,
  onRequestJoin,
  onRespondToRequest,
  onAddStatus,
  onRemoveStatus,
  onBack,
}: {
  family: FamilyProfile | null;
  currentUser: any;
  users: any[];
  familyJoinRequests: FamilyJoinRequest[];
  onCreate: (name: string, avatar: string, description?: string) => void;
  onUpdate: (data: any) => void;
  onDelete: () => { success: boolean; message: string };
  onRemoveMember: (memberId: string) => { success: boolean; message: string };
  onRequestJoin: (inviteLink: string) => { success: boolean; message: string };
  onRespondToRequest: (requestId: string, accept: boolean) => void;
  onAddStatus: (userId: string, title: string, emoji: string) => { success: boolean; message: string };
  onRemoveStatus: (userId: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(family?.name || '');
  const [avatar, setAvatar] = useState(family?.avatar || '👨‍👩‍👧‍👦');
  const [description, setDescription] = useState(family?.description || '');
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showStatusModal, setShowStatusModal] = useState<string | null>(null);
  const [statusTitle, setStatusTitle] = useState('');
  const [statusEmoji, setStatusEmoji] = useState('');

  const familyAvatars = ['👨‍👩‍👧‍👦', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👦', '👩‍👦', '👨‍👧', '👩‍👧', '🏠', '❤️'];
  const statusEmojis = ['👑', '🎯', '⭐', '🔥', '💪', '🎨', '🎵', '📚', '🌟', '💎'];

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name, avatar, description);
    setShowSuccess(true);
  };

  const handleUpdate = () => {
    onUpdate({ name, avatar, description });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCopyLink = () => {
    if (family?.inviteLink) {
      navigator.clipboard.writeText(family.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteFamily = () => {
    setDeleteError('');
    const result = onDelete();
    if (result.success) {
      onBack();
    } else {
      setDeleteError(result.message);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setRemoveError('');
    const result = onRemoveMember(memberId);
    if (result.success) {
      setRemoveMemberId(null);
    } else {
      setRemoveError(result.message);
    }
  };

  const handleRequestJoin = () => {
    if (!joinLink.trim()) return;
    setJoinError('');
    const result = onRequestJoin(joinLink.trim());
    if (result.success) {
      setJoinLink('');
      alert('Заявка отправлена!');
    } else {
      setJoinError(result.message);
    }
  };

  const handleRespondToRequest = (requestId: string, accept: boolean) => {
    onRespondToRequest(requestId, accept);
  };

  const handleAddStatus = (userId: string) => {
    if (!statusTitle.trim() || !statusEmoji) return;
    const result = onAddStatus(userId, statusTitle, statusEmoji);
    if (result.success) {
      setShowStatusModal(null);
      setStatusTitle('');
      setStatusEmoji('');
    } else {
      alert(result.message);
    }
  };

  // Pending requests for family owner
  const pendingRequests = family
    ? familyJoinRequests.filter(r => r.familyId === family.id && r.status === 'pending')
    : [];

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
  const members = users.filter(u => family.memberIds.includes(u.id));
  const isOwner = family.ownerId === currentUser.id;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center justify-center w-7 h-7 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Профиль семьи</h2>
      </div>

      {/* Success modal - полноэкранное модальное окно */}
      {showSuccess && (
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
            {/* Заголовок с иконкой */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">{family.avatar}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Семья создана!</h3>
              <p className="text-gray-600">{family.name}</p>
            </div>

            {/* Описание */}
            <div className="bg-purple-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-purple-700 text-center">
                Поделитесь ссылкой-приглашением с участниками семьи
              </p>
            </div>

            {/* Поле с ссылкой */}
            <div className="bg-gray-50 rounded-xl p-3 mb-6">
              <label className="text-xs font-medium text-gray-600 mb-2 block">Ссылка для приглашения</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={family.inviteLink}
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

            {/* Кнопка закрытия */}
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
            {pendingRequests.map((request) => {
              const requestingUser = users.find(u => u.id === request.userId);
              if (!requestingUser) return null;
              
              return (
                <div key={request.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <span className="text-2xl">{requestingUser.avatar}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{requestingUser.name}</p>
                    <p className="text-xs text-gray-500">{requestingUser.email}</p>
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
              );
            })}
          </div>
        </div>
      )}

      {/* Edit form (for owner) */}
      {isOwner && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Аватар семьи</label>
            <div className="flex gap-2 flex-wrap">
              {familyAvatars.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    avatar === a ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название семьи"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
          />

          <button
            onClick={handleUpdate}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Edit2 className="w-5 h-5" />
            Сохранить изменения
          </button>
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
                {member.familyStatus && (
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                    <span>{member.familyStatus.emoji}</span>
                    <span>{member.familyStatus.title}</span>
                  </div>
                )}
              </div>
              {member.id === family.ownerId ? (
                <div title="Глава семьи">
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
              ) : isOwner ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowStatusModal(member.id)}
                    className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Назначить статус"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {removeMemberId === member.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setRemoveMemberId(null)}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRemoveMemberId(member.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить участника"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        
        {removeError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{removeError}</p>
          </div>
        )}
      </div>

      {/* Invite link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ссылка для приглашения</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={family.inviteLink}
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
                url: family.inviteLink,
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

      {/* Delete Family Section (for owner) */}
      {isOwner && (
        <div className="pt-4 border-t border-gray-200">
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

      {/* Status Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowStatusModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Назначить статус</h3>
                <button
                  onClick={() => setShowStatusModal(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Эмодзи</label>
                  <div className="flex gap-2 flex-wrap">
                    {statusEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setStatusEmoji(emoji)}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          statusEmoji === emoji ? 'bg-purple-100 ring-2 ring-purple-400' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Название статуса</label>
                  <input
                    type="text"
                    value={statusTitle}
                    onChange={(e) => setStatusTitle(e.target.value)}
                    placeholder="Например: Поварушка"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={() => handleAddStatus(showStatusModal)}
                  disabled={!statusTitle.trim() || !statusEmoji}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Назначить статус
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
