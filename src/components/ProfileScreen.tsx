import { useState } from 'react';
import { useStore } from '../store';
import { User, Users, ArrowLeft, Edit2, LogOut, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

type ProfileView = 'main' | 'personal' | 'family';

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export function ProfileScreen({ onBack, onLogout }: Props) {
  const [view, setView] = useState<ProfileView>('main');
  const { users, currentUserId, familyProfile, createFamilyProfile, updateProfile, updateFamilyProfile, logout } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);

  if (!currentUser) return null;

  if (view === 'personal') {
    return <PersonalProfile user={currentUser} onUpdate={updateProfile} onBack={() => setView('main')} />;
  }

  if (view === 'family') {
    return (
      <FamilyProfileView
        family={familyProfile}
        currentUser={currentUser}
        users={users}
        onCreate={createFamilyProfile}
        onUpdate={updateFamilyProfile}
        onBack={() => setView('main')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Профиль</h2>
      </div>

      {/* User card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="text-5xl mb-3">{currentUser.avatar}</div>
        <h3 className="text-lg font-bold text-gray-800">{currentUser.name}</h3>
        <p className="text-sm text-gray-500">{currentUser.email}</p>
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
            <p className="text-xs text-gray-500">Аватар, имя, описание</p>
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
              {familyProfile ? 'Управление семейным профилем' : 'Создать профиль семьи'}
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
  onUpdate,
  onBack,
}: {
  user: any;
  onUpdate: (data: any) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [description, setDescription] = useState(user.description || '');
  const [saved, setSaved] = useState(false);

  const avatars = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨', '👩', '🧑', '👦', '👧', '🧒'];

  const handleSave = () => {
    onUpdate({ name, avatar, description });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Личный профиль</h2>
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

      {/* Email (readonly) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
        />
      </div>

      {/* Save */}
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
  );
}

function FamilyProfileView({
  family,
  currentUser,
  users,
  onCreate,
  onUpdate,
  onBack,
}: {
  family: any;
  currentUser: any;
  users: any[];
  onCreate: (name: string, avatar: string, description?: string) => void;
  onUpdate: (data: any) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(family?.name || '');
  const [avatar, setAvatar] = useState(family?.avatar || '👨‍👩‍👧‍👦');
  const [description, setDescription] = useState(family?.description || '');
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const familyAvatars = ['👨‍👩‍👧‍👦', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👦', '👩‍👦', '👨‍👧', '👩‍👧', '🏠', '❤️'];

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

  // Если нет семьи - показываем форму создания
  if (!family) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Создать профиль семьи</h2>
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
    );
  }

  // Профиль семьи создан
  const members = users.filter(u => family.memberIds.includes(u.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Профиль семьи</h2>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-50 border border-green-200 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-800">Профиль семьи создан!</p>
              <p className="text-xs text-green-600">Поделитесь ссылкой для приглашения</p>
            </div>
          </div>
          <div className="mt-3 p-2 bg-white rounded-lg border border-green-100 flex items-center gap-2">
            <input
              type="text"
              value={family.inviteLink}
              readOnly
              className="flex-1 text-xs text-gray-600 bg-transparent outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-purple-100 text-purple-600 text-xs font-medium rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Family card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="text-5xl mb-3">{family.avatar}</div>
        <h3 className="text-lg font-bold text-gray-800">{family.name}</h3>
        {family.description && <p className="text-sm text-gray-500 mt-1">{family.description}</p>}
      </div>

      {/* Edit form */}
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
              </div>
              {member.id === family.ownerId && (
                <span className="text-lg" title="Создатель">👑</span>
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
    </div>
  );
}
