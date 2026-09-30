import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as api from './services/api';
import type { Recipe } from './types';
import { usePolling } from './hooks/usePolling';
import { RecipeList } from './components/RecipeList';
import { AddRecipe } from './components/AddRecipe';
import { SendRequest } from './components/SendRequest';
import { SwipeSelector } from './components/SwipeSelector';
import { Notifications } from './components/Notifications';
import { SelectedResults } from './components/SelectedResults';
import { SwipeRequestDetails } from './components/SwipeRequestDetails';
import { AuthScreen } from './components/AuthScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { FamilyScreen } from './components/FamilyScreen';
import { ToastNotifications, ToastNotification } from './components/ToastNotifications';
import { ChefHat, Bell, Send, UtensilsCrossed, Plus, User, Users } from 'lucide-react';

// ==================== Экраны-обёртки (параметры маршрутов -> пропсы) ====================

function RecipesPage() {
  const navigate = useNavigate();
  return (
    <RecipeList
      onEditRecipe={(recipe) => {
        sessionStorage.setItem('editRecipe', JSON.stringify(recipe));
        navigate('/edit');
      }}
      onAddRecipe={() => navigate('/add')}
    />
  );
}

function AddPage() {
  const navigate = useNavigate();
  return <AddRecipe onDone={() => navigate('/recipes')} />;
}

function EditPage() {
  const navigate = useNavigate();
  const raw = sessionStorage.getItem('editRecipe');
  if (!raw) {
    navigate('/recipes');
    return null;
  }
  const editRecipe = JSON.parse(raw) as Recipe;
  return (
    <AddRecipe
      editRecipe={editRecipe}
      onDone={() => {
        sessionStorage.removeItem('editRecipe');
        navigate('/recipes');
      }}
    />
  );
}

function SendPage() {
  const navigate = useNavigate();
  return <SendRequest onDone={() => navigate('/recipes')} />;
}

function SwipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return null;
  return <SwipeSelector requestId={Number(id)} onDone={() => navigate('/notifications')} />;
}

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return null;
  return <SelectedResults requestId={Number(id)} onBack={() => navigate('/notifications')} />;
}

function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return null;
  return <SwipeRequestDetails requestId={Number(id)} onBack={() => navigate('/notifications')} />;
}

function FamilyPage() {
  const navigate = useNavigate();
  return <FamilyScreen onBack={() => navigate('/recipes')} />;
}

// ==================== App ====================

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);

  // Refs для callback функций (паттерн "latest ref")
  const handleOpenSwipeRef = useRef<(id: number) => void>(() => {});
  const handleViewDetailsRef = useRef<(id: number) => void>(() => {});

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

          // Проверяем количество заявок на вступление (для главы семьи)
          if (profile.data.family && profile.data.family.owner_id === profile.data.user.id) {
            const familyResponse = await api.getFamily();
            setPendingRequestsCount(familyResponse.data.pendingRequests?.length || 0);
          }
        } catch (error) {
          api.logout();
          setIsAuthenticated(false);
        }
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  // После проверки авторизации редиректим с "/" на "/recipes"
  useEffect(() => {
    if (authChecked && isAuthenticated && location.pathname === '/') {
      navigate('/recipes', { replace: true });
    }
  }, [authChecked, isAuthenticated, location.pathname, navigate]);

  // Polling количества заявок на вступление (глава семьи)
  usePolling(
    async () => {
      try {
        const profile = await api.getProfile();
        if (profile.data.family && profile.data.family.owner_id === currentUser.id) {
          const familyResponse = await api.getFamily();
          setPendingRequestsCount(familyResponse.data.pendingRequests?.length || 0);
        } else {
          setPendingRequestsCount(0);
        }
      } catch (error) {
        console.error('Ошибка проверки заявок:', error);
      }
    },
    5_000,
    isAuthenticated && !!currentUser
  );

  // Функция для удаления toast уведомления
  const removeToastNotification = (id: string) => {
    setToastNotifications((prev) => prev.filter((n) => n.id !== id));
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

    setToastNotifications((prev) => [...prev, newNotification]);

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

    setToastNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      removeToastNotification(notificationId);
    }, 10000);
  };

  // Polling уведомлений в реальном времени
  const lastCheckRef = useRef(Date.now());
  usePolling(
    async () => {
      try {
        const response = await api.getNotifications();
        const notifications = response.data.notifications;

        // Обновляем счётчик непрочитанных уведомлений
        setUnreadCount(notifications.filter((n: any) => !n.is_read).length);

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
      }
    },
    5_000,
    isAuthenticated,
    true
  );

  // Функции-обработчики навигации по запросу
  const handleOpenSwipe = (requestId: number) => navigate(`/swipe/${requestId}`);
  const handleViewResults = (requestId: number) => navigate(`/results/${requestId}`);
  const handleViewDetails = (requestId: number) => navigate(`/details/${requestId}`);

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem('editRecipe');
    navigate('/', { replace: true });
  };

  // Обновляем refs
  handleOpenSwipeRef.current = handleOpenSwipe;
  handleViewDetailsRef.current = handleViewDetails;

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <AuthScreen
              onAuth={async () => {
                try {
                  const profile = await api.getProfile();
                  setCurrentUser(profile.data.user);
                  setIsAuthenticated(true);
                  navigate('/recipes', { replace: true });
                } catch (error) {
                  console.error('Ошибка загрузки профиля:', error);
                }
              }}
            />
          }
        />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-orange-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/recipes')}>
            <ChefHat className="w-7 h-7 text-orange-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              MealPick
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className={`relative p-2 rounded-full transition-all ${
                location.pathname.startsWith('/notifications')
                  ? 'bg-gradient-to-br from-orange-100 to-amber-100 shadow-md shadow-orange-200'
                  : 'hover:bg-orange-50'
              }`}
            >
              <Bell
                className={`w-5 h-5 transition-colors ${
                  location.pathname.startsWith('/notifications') ? 'text-orange-600' : 'text-gray-600'
                }`}
              />
              {unreadCount > 0 && (
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
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
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Routes>
            <Route path="/" element={<RecipesPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/edit" element={<EditPage />} />
            <Route path="/send" element={<SendPage />} />
            <Route path="/swipe/:id" element={<SwipePage />} />
            <Route
              path="/notifications"
              element={
                <Notifications
                  onOpenSwipe={handleOpenSwipe}
                  onViewResults={handleViewResults}
                  onViewDetails={handleViewDetails}
                  onUnreadCountChange={setUnreadCount}
                />
              }
            />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/details/:id" element={<DetailsPage />} />
            <Route
              path="/profile"
              element={
                <ProfileScreen
                  key={location.key}
                  onBack={() => navigate('/recipes')}
                  onLogout={handleLogout}
                />
              }
            />
            <Route path="/family" element={<FamilyPage />} />
          </Routes>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-lg border-t border-orange-200 shadow-2xl z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-around items-center">
          <NavButton
            active={location.pathname === '/recipes' || location.pathname === '/'}
            onClick={() => navigate('/recipes')}
            icon={<UtensilsCrossed className="w-5 h-5" />}
            label="Меню"
            color="orange"
          />
          <NavButton
            active={location.pathname === '/add'}
            onClick={() => navigate('/add')}
            icon={<Plus className="w-5 h-5" />}
            label="Новое блюдо"
            color="blue"
          />
          <NavButton
            active={location.pathname === '/send'}
            onClick={() => navigate('/send')}
            icon={<Send className="w-5 h-5" />}
            label="Спросить"
            color="green"
          />
          <NavButton
            active={location.pathname === '/family'}
            onClick={() => navigate('/family')}
            icon={<Users className="w-5 h-5" />}
            label="Семья"
            badge={pendingRequestsCount}
            color="purple"
          />
          <NavButton
            active={location.pathname === '/profile'}
            onClick={() => navigate('/profile')}
            icon={<User className="w-5 h-5" />}
            label="Я"
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
        <motion.span
          key={badge}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg"
        >
          {badge}
        </motion.span>
      )}
    </button>
  );
}

export default App;
