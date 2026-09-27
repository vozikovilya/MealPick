import { useStore } from '../store';

export function UserSwitcher() {
  const { users, currentUserId, setCurrentUser } = useStore();
  const currentUser = users.find((u) => u.id === currentUserId);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors">
        <span className="text-lg">{currentUser?.avatar}</span>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">{currentUser?.name}</span>
      </button>
      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2">
          <p className="text-xs text-gray-400 px-3 py-1">Переключить пользователя</p>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setCurrentUser(user.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                user.id === currentUserId
                  ? 'bg-orange-50 text-orange-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-xl">{user.avatar}</span>
              <span className="text-sm font-medium">{user.name}</span>
              {user.id === currentUserId && (
                <span className="ml-auto text-xs text-orange-500">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
