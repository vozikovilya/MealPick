import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe, User, SwipeRequest, Notification, Ingredient, MealTypeOption, DeliveryOption, CookingStep, FamilyProfile, FamilyStatus, FamilyJoinRequest } from './types';

interface AppState {
  users: User[];
  currentUserId: string | null;
  familyProfile: FamilyProfile | null;
  familyJoinRequests: FamilyJoinRequest[];
  swipeRequests: SwipeRequest[];
  notifications: Notification[];
  customMealTypes: MealTypeOption[];
  deliveryOptions: DeliveryOption[];
  pendingNotification: Notification | null;

  // Auth
  register: (email: string, username: string, password: string, name: string, avatar?: string) => { success: boolean; message: string };
  login: (emailOrUsername: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (data: { name?: string; avatar?: string; description?: string }) => void;
  updateCredentials: (data: { email?: string; username?: string; password?: string }) => { success: boolean; message: string };
  deleteAccount: () => { success: boolean; message: string };
  
  // Family
  createFamilyProfile: (name: string, avatar: string, description?: string) => void;
  updateFamilyProfile: (data: { name?: string; avatar?: string; description?: string }) => void;
  deleteFamilyProfile: () => { success: boolean; message: string };
  removeFamilyMember: (memberId: string) => { success: boolean; message: string };
  requestJoinFamily: (inviteLink: string) => { success: boolean; message: string };
  respondToJoinRequest: (requestId: string, accept: boolean) => void;
  addFamilyStatus: (userId: string, title: string, emoji: string) => { success: boolean; message: string };
  removeFamilyStatus: (userId: string) => void;
  
  setCurrentUser: (userId: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateRecipe: (recipeId: string, recipe: Omit<Recipe, 'id' | 'ownerId' | 'createdAt'>) => void;
  deleteRecipe: (recipeId: string) => { success: boolean; message: string };
  sendSwipeRequest: (
    toUserId: string | null,
    toFamilyId: string | null,
    recipeIds: string[],
    options?: {
      mode?: 'category' | 'select' | 'delivery';
      category?: string;
      message?: string;
      deliveryIds?: string[];
    }
  ) => void;
  respondToSwipeRequest: (requestId: string, selectedRecipeIds: string[]) => void;
  markNotificationRead: (notificationId: string) => void;
  markNotificationsRead: (notificationIds: string[]) => void;
  markAllNotificationsRead: () => void;
  deleteNotifications: (notificationIds: string[]) => void;
  clearNotifications: () => void;
  addCustomMealType: (name: string, emoji: string, isCollection?: boolean) => void;
  deleteCustomMealType: (id: string) => void;
  setPendingNotification: (notification: Notification | null) => void;
}

const defaultMealTypes: MealTypeOption[] = [
  { id: 'breakfast', name: 'Завтрак', emoji: '🌅', isDefault: true },
  { id: 'lunch', name: 'Обед', emoji: '☀️', isDefault: true },
  { id: 'dinner', name: 'Ужин', emoji: '🌙', isDefault: true },
  { id: 'sides', name: 'Гарниры', emoji: '🥔', isDefault: true, isCollection: true },
  { id: 'desserts', name: 'Десерты', emoji: '🍰', isDefault: true, isCollection: true },
  { id: 'drinks', name: 'Напитки', emoji: '🥤', isDefault: true, isCollection: true },
  { id: 'sauces', name: 'Соусы', emoji: '🥫', isDefault: true, isCollection: true },
];

const defaultDeliveryOptions: DeliveryOption[] = [
  { id: 'd1', name: 'Суши', emoji: '🍣', description: 'Японская кухня' },
  { id: 'd2', name: 'Пицца', emoji: '🍕', description: 'Итальянская кухня' },
  { id: 'd3', name: 'Бургеры', emoji: '🍔', description: 'Фастфуд' },
  { id: 'd4', name: 'Вок', emoji: '🍜', description: 'Азиатская кухня' },
  { id: 'd5', name: 'Шаурма', emoji: '🌯', description: 'Восточная кухня' },
  { id: 'd6', name: 'Салаты', emoji: '🥗', description: 'Здоровая еда' },
];

const ing = (name: string, amount?: string, unit?: string): Ingredient => ({
  id: `ing_${Math.random().toString(36).slice(2, 9)}`,
  name,
  amount,
  unit,
});

const step = (title: string, text: string, imageUrl?: string): CookingStep => ({
  id: `s_${Math.random().toString(36).slice(2, 9)}`,
  title,
  text,
  imageUrl,
});

// Илья - единственный пользователь по умолчанию
const defaultUser: User = {
  id: 'user1',
  email: 'vozikov-ilya@mail.ru',
  username: 'ilya',
  password: 'ilya',
  name: 'Илья',
  avatar: '👨‍🍳',
  recipes: [
    {
      id: 'r1',
      name: 'Блинчики с творогом',
      description: 'Нежные блинчики с творожной начинкой и мёдом',
      imageUrls: [
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
        'https://images.unsplash.com/photo-1519676867240-f03562e4571?w=400'
      ],
      ingredients: [ing('Мука', '200', 'г'), ing('Молоко', '500', 'мл'), ing('Яйца', '2', 'шт'), ing('Творог', '300', 'г'), ing('Мёд', '2', 'ст.л.')],
      mealType: 'breakfast',
      cookingSteps: [
        step('Тесто', 'Смешайте муку, яйца, молоко и сахар до однородной массы.'),
        step('Жарка', 'Разогрейте сковороду, налейте тонкий слой теста. Обжаривайте с двух сторон.', 'https://images.unsplash.com/photo-1519676867240-f03562e4571?w=400'),
        step('Подача', 'Намажьте творогом, сверните и подавайте с мёдом.'),
      ],
      ownerId: 'user1',
      createdAt: Date.now() - 100000,
    },
    {
      id: 'r2',
      name: 'Паста Карбонара',
      description: 'Классическая итальянская паста с беконом и сливочным соусом',
      imageUrls: [
        'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'
      ],
      ingredients: [ing('Спагетти', '400', 'г'), ing('Бекон', '200', 'г'), ing('Яйца', '3', 'шт'), ing('Пармезан', '100', 'г')],
      mealType: 'lunch',
      pairedRecipeIds: ['side2'],
      ownerId: 'user1',
      createdAt: Date.now() - 200000,
    },
    {
      id: 'r3',
      name: 'Лосось на гриле',
      description: 'Стейк лосося с овощами гриль и лимонным соусом',
      imageUrls: [
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400'
      ],
      ingredients: [ing('Лосось', '2', 'стейка'), ing('Лимон', '1', 'шт'), ing('Брокколи', '200', 'г')],
      mealType: 'dinner',
      pairedRecipeIds: ['side1'],
      ownerId: 'user1',
      createdAt: Date.now() - 300000,
    },
    {
      id: 'r4',
      name: 'Овсянка с ягодами',
      description: 'Полезная овсяная каша со свежими ягодами и орехами',
      imageUrls: [
        'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
        'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400'
      ],
      ingredients: [ing('Овсяные хлопья', '100', 'г'), ing('Молоко', '250', 'мл'), ing('Черника', '50', 'г'), ing('Мёд', '1', 'ст.л.')],
      mealType: 'breakfast',
      pairedRecipeIds: ['drink1'],
      ownerId: 'user1',
      createdAt: Date.now() - 400000,
    },
    // Подборки
    {
      id: 'side1',
      name: 'Гречка',
      description: 'Рассыпчатая гречневая каша',
      imageUrls: [
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
        'https://images.unsplash.com/photo-1585996838523-4a1b9a5e4a7d?w=400'
      ],
      ingredients: [ing('Гречка', '200', 'г'), ing('Вода', '400', 'мл'), ing('Соль')],
      mealType: 'sides',
      ownerId: 'user1',
      createdAt: Date.now() - 450000,
    },
    {
      id: 'side2',
      name: 'Пюре картофельное',
      description: 'Нежное пюре со сливочным маслом',
      imageUrls: [
        'https://images.unsplash.com/photo-1600167705956-6b8633555b92?w=400',
        'https://images.unsplash.com/photo-1633478062482-5a1e5f6e4a7d?w=400'
      ],
      ingredients: [ing('Картофель', '1', 'кг'), ing('Молоко', '150', 'мл'), ing('Масло', '50', 'г')],
      mealType: 'sides',
      ownerId: 'user1',
      createdAt: Date.now() - 460000,
    },
    {
      id: 'dessert1',
      name: 'Панна-котта',
      description: 'Итальянский сливочный десерт с ягодами',
      imageUrls: [
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        'https://images.unsplash.com/photo-1572573260193-4a1e4a3d6f7d?w=400'
      ],
      ingredients: [ing('Сливки', '500', 'мл'), ing('Сахар', '100', 'г'), ing('Желатин', '10', 'г')],
      mealType: 'desserts',
      ownerId: 'user1',
      createdAt: Date.now() - 470000,
    },
    {
      id: 'dessert2',
      name: 'Чизкейк',
      description: 'Классический чизкейк Нью-Йорк',
      imageUrls: [
        'https://images.unsplash.com/photo-1533134242443-d4fd21530c7d?w=400',
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'
      ],
      ingredients: [ing('Сыр', '500', 'г'), ing('Сахар', '150', 'г'), ing('Яйца', '3', 'шт')],
      mealType: 'desserts',
      ownerId: 'user1',
      createdAt: Date.now() - 480000,
    },
    {
      id: 'drink1',
      name: 'Смузи ягодный',
      description: 'Освежающий смузи из свежих ягод',
      imageUrls: [
        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400',
        'https://images.unsplash.com/photo-1502741338009-cac2772e229c?w=400'
      ],
      ingredients: [ing('Клубника', '100', 'г'), ing('Банан', '1', 'шт'), ing('Йогурт', '200', 'мл')],
      mealType: 'drinks',
      ownerId: 'user1',
      createdAt: Date.now() - 490000,
    },
    {
      id: 'drink2',
      name: 'Лимонад',
      description: 'Домашний лимонад с мятой',
      imageUrls: [
        'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400',
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400'
      ],
      ingredients: [ing('Лимоны', '3', 'шт'), ing('Сахар', '100', 'г'), ing('Мята')],
      mealType: 'drinks',
      ownerId: 'user1',
      createdAt: Date.now() - 500000,
    },
    {
      id: 'sauce1',
      name: 'Песто',
      description: 'Итальянский соус из базилика',
      imageUrls: [
        'https://images.unsplash.com/photo-1601314167039-470909f76620?w=400',
        'https://images.unsplash.com/photo-1601577303509-37a2f853a1e0?w=400'
      ],
      ingredients: [ing('Базилик', '50', 'г'), ing('Орехи', '30', 'г'), ing('Пармезан', '50', 'г'), ing('Оливковое масло', '100', 'мл')],
      mealType: 'sauces',
      ownerId: 'user1',
      createdAt: Date.now() - 510000,
    },
    {
      id: 'sauce2',
      name: 'Ткемали',
      description: 'Грузинский соус из алычи',
      imageUrls: [
        'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400',
        'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&sat=-50'
      ],
      ingredients: [ing('Алыча', '500', 'г'), ing('Чеснок', '3', 'зубч.'), ing('Кинза'), ing('Соль')],
      mealType: 'sauces',
      ownerId: 'user1',
      createdAt: Date.now() - 520000,
    },
  ],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [defaultUser],
      currentUserId: null, // По умолчанию не авторизован
      familyProfile: null,
      familyJoinRequests: [],
      swipeRequests: [],
      notifications: [],
      customMealTypes: [],
      deliveryOptions: defaultDeliveryOptions,
      pendingNotification: null,

      // Auth
      register: (email, username, password, name, avatar = '👤') => {
        const { users } = get();
        if (users.find(u => u.email === email)) {
          return { success: false, message: 'Пользователь с таким email уже существует' };
        }
        if (users.find(u => u.username === username)) {
          return { success: false, message: 'Пользователь с таким логином уже существует' };
        }
        const newUser: User = {
          id: `user_${Date.now()}`,
          email,
          username,
          password,
          name,
          avatar,
          recipes: [],
        };
        set({
          users: [...users, newUser],
          currentUserId: newUser.id,
          // НЕ очищаем глобальные данные - они сохраняются для всех пользователей
          // familyProfile, notifications и т.д. остаются в localStorage
        });
        return { success: true, message: 'Регистрация успешна!' };
      },

      login: (emailOrUsername, password) => {
        const { users } = get();
        const user = users.find(
          u => (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
        );
        if (!user) {
          return { success: false, message: 'Неверный email/логин или пароль' };
        }
        
        // Просто меняем текущего пользователя
        // Данные НЕ фильтруем и НЕ очищаем - они сохраняются в localStorage
        // Компоненты сами будут фильтровать данные по currentUserId
        set({ 
          currentUserId: user.id,
          pendingNotification: null,
        });
        return { success: true, message: 'Вход выполнен!' };
      },

      logout: () => {
        set({ currentUserId: null });
      },

      updateProfile: (data) => {
        const { currentUserId, users } = get();
        if (!currentUserId) return;
        set({
          users: users.map(u =>
            u.id === currentUserId ? { ...u, ...data } : u
          ),
        });
      },

      updateCredentials: (data) => {
        const { currentUserId, users } = get();
        if (!currentUserId) return { success: false, message: 'Пользователь не авторизован' };
        
        const currentUser = users.find(u => u.id === currentUserId);
        if (!currentUser) return { success: false, message: 'Пользователь не найден' };
        
        // Проверяем уникальность email
        if (data.email && data.email !== currentUser.email) {
          if (users.some(u => u.email === data.email)) {
            return { success: false, message: 'Email уже используется' };
          }
        }
        
        // Проверяем уникальность username
        if (data.username && data.username !== currentUser.username) {
          if (users.some(u => u.username === data.username)) {
            return { success: false, message: 'Логин уже используется' };
          }
        }
        
        set({
          users: users.map(u =>
            u.id === currentUserId ? { ...u, ...data } : u
          ),
        });
        return { success: true, message: 'Данные обновлены' };
      },

      deleteAccount: () => {
        const { currentUserId, users, familyProfile } = get();
        if (!currentUserId) return { success: false, message: 'Пользователь не авторизован' };
        
        // Проверяем, является ли пользователь главным в семье
        if (familyProfile && familyProfile.ownerId === currentUserId) {
          return { success: false, message: 'Нельзя удалить аккаунт, пока вы являетесь создателем профиля семьи. Сначала удалите профиль семьи или передайте права другому участнику.' };
        }
        
        // Удаляем пользователя
        set({
          users: users.filter(u => u.id !== currentUserId),
          currentUserId: null,
          // Если пользователь был в семье, удаляем его из списка участников
          familyProfile: familyProfile ? {
            ...familyProfile,
            memberIds: familyProfile.memberIds.filter(id => id !== currentUserId)
          } : null,
        });
        return { success: true, message: 'Аккаунт удалён' };
      },

      // Family
      createFamilyProfile: (name, avatar, description) => {
        const { currentUserId, familyProfile } = get();
        if (!currentUserId || familyProfile) return;
        
        const newFamily: FamilyProfile = {
          id: `family_${Date.now()}`,
          name,
          avatar,
          description,
          ownerId: currentUserId,
          memberIds: [currentUserId],
          inviteLink: `https://mealspick.app/join/${Date.now()}`,
          createdAt: Date.now(),
        };
        
        set({
          familyProfile: newFamily,
          users: get().users.map(u =>
            u.id === currentUserId ? { ...u, familyId: newFamily.id, isFamilyOwner: true } : u
          ),
        });
      },

      updateFamilyProfile: (data) => {
        const { familyProfile } = get();
        if (!familyProfile) return;
        set({ familyProfile: { ...familyProfile, ...data } });
      },

      deleteFamilyProfile: () => {
        const { currentUserId, familyProfile, users } = get();
        if (!currentUserId) return { success: false, message: 'Пользователь не авторизован' };
        if (!familyProfile) return { success: false, message: 'Профиль семьи не найден' };
        
        // Проверяем, является ли пользователь создателем
        if (familyProfile.ownerId !== currentUserId) {
          return { success: false, message: 'Только создатель может удалить профиль семьи' };
        }
        
        // Удаляем профиль семьи и очищаем familyId у всех участников
        set({
          familyProfile: null,
          users: users.map(u => ({
            ...u,
            familyId: undefined,
            isFamilyOwner: false,
          })),
        });
        return { success: true, message: 'Профиль семьи удалён' };
      },

      removeFamilyMember: (memberId) => {
        const { currentUserId, familyProfile, users } = get();
        if (!currentUserId) return { success: false, message: 'Пользователь не авторизован' };
        if (!familyProfile) return { success: false, message: 'Профиль семьи не найден' };
        
        // Проверяем, является ли пользователь создателем
        if (familyProfile.ownerId !== currentUserId) {
          return { success: false, message: 'Только создатель может удалять участников' };
        }
        
        // Нельзя удалить самого создателя
        if (memberId === familyProfile.ownerId) {
          return { success: false, message: 'Нельзя удалить создателя профиля семьи' };
        }
        
        // Удаляем участника из семьи
        set({
          familyProfile: {
            ...familyProfile,
            memberIds: familyProfile.memberIds.filter(id => id !== memberId),
          },
          users: users.map(u =>
            u.id === memberId ? { ...u, familyId: undefined, isFamilyOwner: false } : u
          ),
        });
        return { success: true, message: 'Участник удалён из семьи' };
      },

      requestJoinFamily: (inviteLink) => {
        const { currentUserId, familyProfile, familyJoinRequests, users, notifications } = get();
        if (!currentUserId) return { success: false, message: 'Пользователь не авторизован' };
        
        // Извлекаем familyId из ссылки
        const familyId = inviteLink.split('/').pop();
        if (!familyId) return { success: false, message: 'Неверная ссылка-приглашение' };
        
        // Проверяем, существует ли семья
        const targetFamily = familyProfile?.id === familyId ? familyProfile : null;
        if (!targetFamily) return { success: false, message: 'Семья не найдена' };
        
        // Проверяем, не состоит ли пользователь уже в семье
        const currentUser = users.find(u => u.id === currentUserId);
        if (currentUser?.familyId) {
          return { success: false, message: 'Вы уже состоите в семье' };
        }
        
        // Проверяем, не отправлял ли пользователь уже заявку
        const existingRequest = familyJoinRequests.find(
          r => r.familyId === familyId && r.userId === currentUserId && r.status === 'pending'
        );
        if (existingRequest) {
          return { success: false, message: 'Вы уже отправили заявку' };
        }
        
        // Создаём заявку
        const newRequest: FamilyJoinRequest = {
          id: `fjr_${Date.now()}`,
          familyId,
          userId: currentUserId,
          status: 'pending',
          createdAt: Date.now(),
        };
        
        // Создаём уведомление для главы семьи
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'family_join_request',
          fromUserId: currentUserId,
          message: `${currentUser?.name} хочет присоединиться к вашей семье`,
          familyJoinRequestId: newRequest.id,
          read: false,
          createdAt: Date.now(),
        };
        
        set({
          familyJoinRequests: [...familyJoinRequests, newRequest],
          notifications: [...notifications, notification],
          pendingNotification: notification,
        });
        
        return { success: true, message: 'Заявка отправлена' };
      },

      respondToJoinRequest: (requestId, accept) => {
        const { familyJoinRequests, users, familyProfile, notifications, currentUserId } = get();
        const request = familyJoinRequests.find(r => r.id === requestId);
        if (!request) return;
        
        const requestingUser = users.find(u => u.id === request.userId);
        const currentUser = users.find(u => u.id === currentUserId);
        
        // Обновляем статус заявки
        const updatedRequests = familyJoinRequests.map(r =>
          r.id === requestId
            ? { ...r, status: accept ? 'accepted' as const : 'rejected' as const, processedAt: Date.now() }
            : r
        );
        
        // Создаём уведомление для заявителя
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'family_join_response',
          fromUserId: currentUserId!,
          message: accept
            ? `Вы приняты в семью "${familyProfile?.name}"! 🎉`
            : `Ваша заявка в семью "${familyProfile?.name}" отклонена 😔`,
          familyJoinRequestId: requestId,
          read: false,
          createdAt: Date.now(),
        };
        
        if (accept && familyProfile) {
          // Добавляем пользователя в семью
          set({
            familyJoinRequests: updatedRequests,
            familyProfile: {
              ...familyProfile,
              memberIds: [...familyProfile.memberIds, request.userId],
            },
            users: users.map(u =>
              u.id === request.userId ? { ...u, familyId: familyProfile.id } : u
            ),
            notifications: [...notifications, notification],
            pendingNotification: notification,
          });
        } else {
          set({
            familyJoinRequests: updatedRequests,
            notifications: [...notifications, notification],
            pendingNotification: notification,
          });
        }
      },

      addFamilyStatus: (userId, title, emoji) => {
        const { currentUserId, familyProfile, users } = get();
        if (!currentUserId) return { success: false, message: 'Пользователь не авторизован' };
        if (!familyProfile) return { success: false, message: 'Профиль семьи не найден' };
        
        // Только глава семьи может добавлять статусы
        if (familyProfile.ownerId !== currentUserId) {
          return { success: false, message: 'Только глава семьи может назначать статусы' };
        }
        
        // Нельзя назначить статус самому себе
        if (userId === currentUserId) {
          return { success: false, message: 'Нельзя назначить статус самому себе' };
        }
        
        const newStatus: FamilyStatus = {
          id: `fs_${Date.now()}`,
          userId,
          title,
          emoji,
          createdBy: currentUserId,
          createdAt: Date.now(),
        };
        
        set({
          users: users.map(u =>
            u.id === userId ? { ...u, familyStatus: newStatus } : u
          ),
        });
        
        return { success: true, message: 'Статус назначен' };
      },

      removeFamilyStatus: (userId) => {
        const { currentUserId, familyProfile, users } = get();
        if (!currentUserId) return;
        if (!familyProfile) return;
        
        // Только глава семьи может удалять статусы
        if (familyProfile.ownerId !== currentUserId) return;
        
        set({
          users: users.map(u =>
            u.id === userId ? { ...u, familyStatus: undefined } : u
          ),
        });
      },

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      addRecipe: (recipeData) => {
        const { currentUserId, users } = get();
        if (!currentUserId) return;
        const newRecipe: Recipe = {
          ...recipeData,
          id: `r_${Date.now()}`,
          ownerId: currentUserId,
          createdAt: Date.now(),
          imageUrls: recipeData.imageUrls && recipeData.imageUrls.length > 0
            ? recipeData.imageUrls
            : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
        };
        set({
          users: users.map((u) =>
            u.id === currentUserId ? { ...u, recipes: [...u.recipes, newRecipe] } : u
          ),
        });
      },

      updateRecipe: (recipeId, recipeData) => {
        const { users } = get();
        set({
          users: users.map((u) => ({
            ...u,
            recipes: u.recipes.map((r) =>
              r.id === recipeId
                ? {
                    ...r,
                    ...recipeData,
                    imageUrls: recipeData.imageUrls && recipeData.imageUrls.length > 0
                      ? recipeData.imageUrls
                      : r.imageUrls,
                  }
                : r
            ),
          })),
        });
      },

      deleteRecipe: (recipeId) => {
        const { users, currentUserId, familyProfile } = get();
        const currentUser = users.find((u) => u.id === currentUserId);
        
        // Проверка прав: только владелец рецепта, глава семьи или поварушка могут удалять
        const recipe = users.flatMap((u) => u.recipes).find((r) => r.id === recipeId);
        if (!recipe) return { success: false, message: 'Блюдо не найдено' };
        
        const isOwner = recipe.ownerId === currentUserId;
        const isFamilyHead = familyProfile?.ownerId === currentUserId;
        const hasChefStatus = currentUser?.familyStatus?.title === 'Поварушка';
        
        if (!isOwner && !isFamilyHead && !hasChefStatus) {
          return { success: false, message: 'У вас нет прав на удаление этого блюда' };
        }
        
        set({
          users: users.map((u) => ({
            ...u,
            recipes: u.recipes.filter((r) => r.id !== recipeId),
          })),
        });
        return { success: true, message: 'Блюдо удалено' };
      },

      sendSwipeRequest: (toUserId, toFamilyId, recipeIds, options = {}) => {
        const { currentUserId, swipeRequests, notifications, users, familyProfile } = get();
        if (!currentUserId) return;
        
        const request: SwipeRequest = {
          id: `req_${Date.now()}`,
          fromUserId: currentUserId,
          toUserId: toUserId || undefined,
          toFamilyId: toFamilyId || undefined,
          recipeIds,
          status: 'pending',
          createdAt: Date.now(),
          mode: options.mode,
          category: options.category,
          message: options.message,
          deliveryIds: options.deliveryIds,
          responses: {},
        };
        
        const fromUser = users.find((u) => u.id === currentUserId);
        const notificationsToAdd: Notification[] = [];

        let message = '';
        if (options.mode === 'delivery') {
          message = `${fromUser?.name} предлагает заказать доставку! 🚀`;
        } else if (options.mode === 'category' && options.category) {
          const allTypes = [...defaultMealTypes, ...get().customMealTypes];
          const mealType = allTypes.find((m) => m.id === options.category);
          message = `${fromUser?.name} предлагает выбрать на ${mealType?.name.toLowerCase() || 'блюда'}!`;
        } else {
          message = `${fromUser?.name} хочет, чтобы вы выбрали блюда!`;
        }

        // Если отправлено всей семье
        if (toFamilyId && familyProfile) {
          const familyMembers = users.filter((u) => 
            familyProfile.memberIds.includes(u.id) && u.id !== currentUserId
          );
          
          familyMembers.forEach((member) => {
            const notification: Notification = {
              id: `notif_${Date.now()}_${member.id}`,
              type: 'swipe_request',
              fromUserId: currentUserId,
              message,
              senderMessage: options.message,
              requestId: request.id,
              read: false,
              createdAt: Date.now(),
            };
            notificationsToAdd.push(notification);
          });
        } else if (toUserId) {
          // Отправлено конкретному пользователю
          const notification: Notification = {
            id: `notif_${Date.now()}`,
            type: 'swipe_request',
            fromUserId: currentUserId,
            message,
            senderMessage: options.message,
            requestId: request.id,
            read: false,
            createdAt: Date.now(),
          };
          notificationsToAdd.push(notification);
        }

        set({
          swipeRequests: [...swipeRequests, request],
          notifications: [...notifications, ...notificationsToAdd],
          pendingNotification: notificationsToAdd[0] || null,
        });
      },

      respondToSwipeRequest: (requestId, selectedRecipeIds) => {
        const { swipeRequests, notifications, users, currentUserId } = get();
        const request = swipeRequests.find((r) => r.id === requestId);
        if (!request || !currentUserId) return;

        const currentUser = users.find((u) => u.id === currentUserId);

        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'swipe_response',
          fromUserId: currentUserId,
          message: `${currentUser?.name} выбрал(а) ${selectedRecipeIds.length} блюд для вас! 🎉`,
          requestId,
          read: false,
          createdAt: Date.now(),
        };

        set({
          swipeRequests: swipeRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'completed' as const, selectedRecipeIds } : r
          ),
          notifications: [...notifications, notification],
          pendingNotification: notification,
        });
      },

      markNotificationRead: (notificationId) => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        });
      },

      markNotificationsRead: (notificationIds) => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) =>
            notificationIds.includes(n.id) ? { ...n, read: true } : n
          ),
        });
      },

      markAllNotificationsRead: () => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) => ({ ...n, read: true })),
        });
      },

      deleteNotifications: (notificationIds) => {
        const { notifications } = get();
        set({
          notifications: notifications.filter((n) => !notificationIds.includes(n.id)),
        });
      },

      clearNotifications: () => set({ notifications: [] }),

      addCustomMealType: (name, emoji, isCollection = false) => {
        const { customMealTypes } = get();
        const newType: MealTypeOption = {
          id: `mt_${Date.now()}`,
          name,
          emoji,
          isDefault: false,
          isCollection,
        };
        set({ customMealTypes: [...customMealTypes, newType] });
      },

      deleteCustomMealType: (id) => {
        const { customMealTypes } = get();
        set({ customMealTypes: customMealTypes.filter((m) => m.id !== id) });
      },

      setPendingNotification: (notification) => set({ pendingNotification: notification }),
    }),
    {
      name: 'meal-picker-storage',
      version: 7,
      migrate: (persistedState: any) => {
        // Если есть сохраненные данные - используем их, не перезаписываем
        if (persistedState?.users && persistedState.users.length > 0) {
          return {
            users: persistedState.users,
            currentUserId: persistedState.currentUserId || null,
            familyProfile: persistedState.familyProfile || null,
            swipeRequests: persistedState.swipeRequests || [],
            notifications: persistedState.notifications || [],
            customMealTypes: persistedState.customMealTypes || [],
            deliveryOptions: persistedState.deliveryOptions || defaultDeliveryOptions,
            pendingNotification: null,
          };
        }
        
        // Если нет данных - используем дефолтного пользователя
        return {
      users: [defaultUser],
      currentUserId: defaultUser.id,
      familyProfile: null,
      familyJoinRequests: [],
      swipeRequests: [],
      notifications: [],
      customMealTypes: [],
      deliveryOptions: defaultDeliveryOptions,
      pendingNotification: null,        };
      },
    }
  )
);

export const useAllMealTypes = () => {
  const customMealTypes = useStore((s) => s.customMealTypes);
  return [...defaultMealTypes, ...customMealTypes];
};

export const useMainMealTypes = () => {
  return useAllMealTypes().filter((m) => !m.isCollection);
};

export const useCollectionMealTypes = () => {
  return useAllMealTypes().filter((m) => m.isCollection);
};
