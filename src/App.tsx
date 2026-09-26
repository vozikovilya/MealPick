import { useState, useEffect } from 'react';
import { useStore } from './store';
import { Recipe } from './types';
import { RecipeList } from './components/RecipeList';
import { AddRecipe } from './components/AddRecipe';
import { SendRequest } from './components/SendRequest';
import { SwipeSelector } from './components/SwipeSelector';
import { Notifications } from './components/Notifications';
import { SelectedResults } from './components/SelectedResults';
import { PendingNotificationModal } from './components/PendingNotificationModal';
import { AuthScreen } from './components/AuthScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ChefHat, Bell, Send, UtensilsCrossed, Plus, User } from 'lucide-react';

type Screen = 'recipes' | 'add' | 'edit' | 'send' | 'swipe' | 'notifications' | 'results' | 'profile';

function App() {
  const [screen, setScreen] = useState<Screen>('recipes');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const { notifications, currentUserId, pendingNotification, setPendingNotification, users } = useStore();

  const unreadCount = notifications.filter((n) => !n.read && n.type === 'swipe_request').length;
  const currentUser = users.find(u => u.id === currentUserId);

  // Если не авторизован - показываем экран авторизации
  if (!currentUserId || !currentUser) {
    return <AuthScreen onAuth={() => setScreen('recipes')} />;
  }

  const handleOpenSwipe = (requestId: string) => {
    setActiveRequestId(requestId);
    setScreen('swipe');
  };

  const handleViewResults = (requestId: string) => {
    setActiveRequestId(requestId);
    setScreen('results');
  };

  const handleLogout = () => {
    setScreen('recipes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-orange-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-orange-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              MealPick
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScreen('notifications')}
              className="relative p-2 rounded-full hover:bg-orange-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setScreen('profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <span className="text-lg">{currentUser.avatar}</span>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{currentUser.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {screen === 'recipes' && (
          <RecipeList
            onEditRecipe={(recipe) => {
              setEditingRecipe(recipe);
              setScreen('edit');
            }}
          />
        )}
        {screen === 'add' && <AddRecipe onDone={() => setScreen('recipes')} />}
        {screen === 'edit' && editingRecipe && (
          <AddRecipe
            onDone={() => {
              setEditingRecipe(null);
              setScreen('recipes');
            }}
            editRecipe={editingRecipe}
          />
        )}
        {screen === 'send' && <SendRequest onDone={() => setScreen('recipes')} />}
        {screen === 'swipe' && activeRequestId && (
          <SwipeSelector
            requestId={activeRequestId}
            onDone={() => {
              setScreen('notifications');
              setActiveRequestId(null);
            }}
          />
        )}
        {screen === 'notifications' && (
          <Notifications
            onOpenSwipe={handleOpenSwipe}
            onViewResults={handleViewResults}
          />
        )}
        {screen === 'results' && activeRequestId && (
          <SelectedResults
            requestId={activeRequestId}
            onBack={() => setScreen('notifications')}
          />
        )}
        {screen === 'profile' && (
          <ProfileScreen
            onBack={() => setScreen('recipes')}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-orange-100 shadow-lg z-30">
        <div className="max-w-lg mx-auto px-4 py-2 flex justify-around items-center">
          <NavButton
            active={screen === 'recipes'}
            onClick={() => setScreen('recipes')}
            icon={<UtensilsCrossed className="w-5 h-5" />}
            label="Меню"
          />
          <NavButton
            active={screen === 'add'}
            onClick={() => setScreen('add')}
            icon={<Plus className="w-5 h-5" />}
            label="Добавить"
          />
          <NavButton
            active={screen === 'send'}
            onClick={() => setScreen('send')}
            icon={<Send className="w-5 h-5" />}
            label="Спросить"
          />
          <NavButton
            active={screen === 'notifications'}
            onClick={() => setScreen('notifications')}
            icon={<Bell className="w-5 h-5" />}
            label="Запросы"
            badge={unreadCount}
          />
          <NavButton
            active={screen === 'profile'}
            onClick={() => setScreen('profile')}
            icon={<User className="w-5 h-5" />}
            label="Профиль"
          />
        </div>
      </nav>

      {/* Полноэкранное модальное уведомление */}
      {pendingNotification && (
        <PendingNotificationModal
          notification={pendingNotification}
          onClose={() => setPendingNotification(null)}
          onAction={() => {
            const notif = pendingNotification;
            setPendingNotification(null);
            if (notif.type === 'swipe_request' && notif.requestId) {
              handleOpenSwipe(notif.requestId);
            } else if (notif.type === 'swipe_response' && notif.requestId) {
              handleViewResults(notif.requestId);
            }
          }}
        />
      )}
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl transition-all min-w-[50px] relative ${
        active ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className="h-5 w-5 flex items-center justify-center">{icon}</div>
      <span className="text-[10px] font-medium leading-tight">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

export default App;
