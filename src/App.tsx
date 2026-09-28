import { useState, useEffect, useRef } from 'react';
import * as api from './services/api';
import type { Recipe } from './services/api';
import { RecipeList } from './components/RecipeList';
import { AddRecipe } from './components/AddRecipe';
import { SendRequest } from './components/SendRequest';
import { SwipeSelector } from './components/SwipeSelector';
import { Notifications } from './components/Notifications';
import { SelectedResults } from './components/SelectedResults';
import { SwipeRequestDetails } from './components/SwipeRequestDetails';
import { AuthScreen } from './components/AuthScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ToastNotifications, ToastNotification } from './components/ToastNotifications';
import { ChefHat, Bell, Send, UtensilsCrossed, Plus, User } from 'lucide-react';

type Screen = 'recipes' | 'add' | 'edit' | 'send' | 'swipe' | 'notifications' | 'results' | 'details' | 'profile';

function App() {
  // Восстанавливаем сохранённый экран из localStorage
  const savedScreen = localStorage.getItem('currentScreen') as Screen | null;
  const [screen, setScreen] = useState<Screen>(savedScreen || 'recipes');
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [profileKey, setProfileKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);

  // Refs для callback функций (паттерн "latest ref")
  const handleOpenSwipeRef = useRef<(id: number) => void>(() => {});
  const handleViewDetailsRef = useRef<(id: number) => void>(() => {});

  // Сохраняем текущий экран в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('currentScreen', screen);
  }, [screen]);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const profile = await api.getProfile();
          setCurrentUser(profile.data.user);
          setIsAuthenticated(true);
          
          const notifResponse = await api.getNotifications();
          const count = notifResponse.data.notifications.filter(
            (n) => !n.is_read && n.type === 'swipe_request'
          ).length;
          setUnreadCount(count);
        } catch (error) {
          api.logout();
          setIsAuthenticated(false);
        }
      }
    };
    checkAuth();
  }, []);

  // Функция для удаления toast уведомления
  const removeToastNotification = (id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Обработчик нового запроса на выбор блюд
  const handleNewSwipeRequest = (requestId: number, fromUserName: string) => {
    const notificationId = `toast_${Date.now()}_${Math.random()}`;
    const newNotification: ToastNotification = {
      id: notificationId,
      type: 'swipe_request',
      title: 'Новый запрос на выбор блюд',
      message: `${fromUserName} отправил(а) вам запрос на выбор блюд`,
      fromUserAvatar: '🍽️',
      fromUserName,
      requestId,
      onAction: () => {
        handleOpenSwipeRef.current(requestId);
        removeToastNotification(notificationId);
      },
    };
    
    setToastNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      removeToastNotification(notificationId);
    }, 10000);
  };

  // Обработчик ответа на запрос
  const handleNewSwipeResponse = (requestId: number, fromUserName: string) => {
    const notificationId = `toast_${Date.now()}_${Math.random()}`;
    const newNotification: ToastNotification = {
      id: notificationId,
      type: 'swipe_response',
      title: 'Получен ответ на запрос',
      message: `${fromUserName} выбрал(а) блюда`,
      fromUserAvatar: '✅',
      fromUserName,
      requestId,
      onAction: () => {
        handleViewDetailsRef.current(requestId);
        removeToastNotification(notificationId);
      },
    };
    
    setToastNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      removeToastNotification(notificationId);
    }, 10000);
  };

  // Polling для уведомлений в реальном времени (без кастомного хука)
  useEffect(() => {
    if (!isAuthenticated) return;

    const lastCheckRef = { current: Date.now() };
    const isRunningRef = { current: false };

    const checkForNewNotifications = async () => {
      if (isRunningRef.current) return;

      try {
        isRunningRef.current = true;
        const response = await api.getNotifications();
        const notifications = response.data.notifications;

        const newNotifications = notifications.filter(
          (n: any) => new Date(n.created_at).getTime() > lastCheckRef.current
        );

        if (newNotifications.length > 0) {
          newNotifications.forEach((notification: any) => {
            if (notification.type === 'swipe_request') {
              handleNewSwipeRequest(notification.request_id, notification.from_user_name);
            } else if (notification.type === 'swipe_response') {
              handleNewSwipeResponse(notification.request_id, notification.from_user_name);
            }
          });
        }

        lastCheckRef.current = Date.now();
      } catch (error) {
        console.error('Ошибка проверки уведомлений:', error);
      } finally {
        isRunningRef.current = false;
      }
    };

    checkForNewNotifications();
    const intervalId = setInterval(checkForNewNotifications, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  // Определяем функции-обработчики
  const handleOpenSwipe = (requestId: number) => {
    setActiveRequestId(requestId);
    setScreen('swipe');
  };

  const handleViewResults = (requestId: number) => {
    setActiveRequestId(requestId);
    setScreen('results');
  };

  const handleViewDetails = (requestId: number) => {
    setActiveRequestId(requestId);
    setScreen('details');
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setScreen('recipes');
    localStorage.removeItem('currentScreen');
  };

  // Обновляем refs
  handleOpenSwipeRef.current = handleOpenSwipe;
  handleViewDetailsRef.current = handleViewDetails;

  // Условный возврат ПОСЛЕ всех хуков и функций
  if (!isAuthenticated || !currentUser) {
    return <AuthScreen onAuth={async () => {
      try {
        const profile = await api.getProfile();
        setCurrentUser(profile.data.user);
        setIsAuthenticated(true);
        setScreen('recipes');
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    }} />;
  }

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
              onClick={() => {
                setScreen('profile');
                setProfileKey(prev => prev + 1);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border border-orange-200 transition-all shadow-sm hover:shadow-md"
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
            onAddRecipe={() => setScreen('add')}
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
            onViewDetails={handleViewDetails}
            onUnreadCountChange={setUnreadCount}
          />
        )}
        {screen === 'results' && activeRequestId && (
          <SelectedResults
            requestId={activeRequestId}
            onBack={() => setScreen('notifications')}
          />
        )}
        {screen === 'details' && activeRequestId && (
          <SwipeRequestDetails
            requestId={activeRequestId}
            onBack={() => setScreen('notifications')}
          />
        )}
        {screen === 'profile' && (
          <ProfileScreen
            key={profileKey}
            onBack={() => setScreen('recipes')}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-lg border-t border-orange-200 shadow-2xl z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-around items-center">
          <NavButton
            active={screen === 'recipes'}
            onClick={() => setScreen('recipes')}
            icon={<UtensilsCrossed className="w-5 h-5" />}
            label="Меню"
            color="orange"
          />
          <NavButton
            active={screen === 'add'}
            onClick={() => setScreen('add')}
            icon={<Plus className="w-5 h-5" />}
            label="Новое блюдо"
            color="blue"
          />
          <NavButton
            active={screen === 'send'}
            onClick={() => setScreen('send')}
            icon={<Send className="w-5 h-5" />}
            label="Спросить"
            color="green"
          />
          <NavButton
            active={screen === 'notifications'}
            onClick={() => setScreen('notifications')}
            icon={<Bell className="w-5 h-5" />}
            label="Запросы"
            badge={unreadCount}
            color="purple"
          />
          <NavButton
            active={screen === 'profile'}
            onClick={() => setScreen('profile')}
            icon={<User className="w-5 h-5" />}
            label="Профиль"
            color="pink"
          />
        </div>
      </nav>

      {/* Toast уведомления в реальном времени */}
      <ToastNotifications
        notifications={toastNotifications}
        onClose={removeToastNotification}
        onAction={(notification) => {
          if (notification.onAction) {
            notification.onAction();
          }
        }}
      />
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
  badge,
  color = 'orange',
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'pink';
}) {
  const colorClasses = {
    orange: {
      active: 'text-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-md shadow-orange-200',
      icon: 'text-orange-500',
    },
    blue: {
      active: 'text-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md shadow-blue-200',
      icon: 'text-blue-500',
    },
    green: {
      active: 'text-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md shadow-green-200',
      icon: 'text-green-500',
    },
    purple: {
      active: 'text-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md shadow-purple-200',
      icon: 'text-purple-500',
    },
    pink: {
      active: 'text-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-md shadow-pink-200',
      icon: 'text-pink-500',
    },
  };

  const currentColor = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-2xl transition-all min-w-[60px] relative ${
        active 
          ? `${currentColor.active} scale-105` 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className={`h-6 w-6 flex items-center justify-center transition-transform ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-[11px] font-semibold leading-tight ${active ? currentColor.icon : ''}`}>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
}

export default App;
