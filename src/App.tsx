import { useState } from 'react';
import { useStore } from './store';
import { RecipeList } from './components/RecipeList';
import { AddRecipe } from './components/AddRecipe';
import { SendRequest } from './components/SendRequest';
import { SwipeSelector } from './components/SwipeSelector';
import { Notifications } from './components/Notifications';
import { UserSwitcher } from './components/UserSwitcher';
import { SelectedResults } from './components/SelectedResults';
import { ChefHat, Bell, Send, UtensilsCrossed } from 'lucide-react';

type Screen = 'recipes' | 'add' | 'send' | 'swipe' | 'notifications' | 'results';

function App() {
  const [screen, setScreen] = useState<Screen>('recipes');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const { notifications, currentUserId } = useStore();

  const unreadCount = notifications.filter((n) => !n.read && n.type === 'swipe_request').length;

  const handleOpenSwipe = (requestId: string) => {
    setActiveRequestId(requestId);
    setScreen('swipe');
  };

  const handleViewResults = (requestId: string) => {
    setActiveRequestId(requestId);
    setScreen('results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100 shadow-sm">
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
            <UserSwitcher />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {screen === 'recipes' && <RecipeList />}
        {screen === 'add' && <AddRecipe onDone={() => setScreen('recipes')} />}
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-orange-100 shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-2 flex justify-around">
          <button
            onClick={() => setScreen('recipes')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              screen === 'recipes' ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-xs font-medium">Рецепты</span>
          </button>
          <button
            onClick={() => setScreen('add')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              screen === 'add' ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xl">➕</span>
            <span className="text-xs font-medium">Добавить</span>
          </button>
          <button
            onClick={() => setScreen('send')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              screen === 'send' ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Send className="w-5 h-5" />
            <span className="text-xs font-medium">Спросить</span>
          </button>
          <button
            onClick={() => setScreen('notifications')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${
              screen === 'notifications' ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-xs font-medium">Запросы</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
