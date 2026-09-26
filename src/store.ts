import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe, User, SwipeRequest, Notification, Ingredient, MealTypeOption, DeliveryOption, CookingStep, FamilyProfile } from './types';

interface AppState {
  users: User[];
  currentUserId: string | null;
  familyProfile: FamilyProfile | null;
  swipeRequests: SwipeRequest[];
  notifications: Notification[];
  customMealTypes: MealTypeOption[];
  deliveryOptions: DeliveryOption[];
  pendingNotification: Notification | null;

  // Auth
  register: (email: string, username: string, password: string, name: string) => { success: boolean; message: string };
  login: (emailOrUsername: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (data: { name?: string; avatar?: string; description?: string }) => void;
  
  // Family
  createFamilyProfile: (name: string, avatar: string, description?: string) => void;
  updateFamilyProfile: (data: { name?: string; avatar?: string; description?: string }) => void;
  
  setCurrentUser: (userId: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateRecipe: (recipeId: string, recipe: Omit<Recipe, 'id' | 'ownerId' | 'createdAt'>) => void;
  deleteRecipe: (recipeId: string) => void;
  sendSwipeRequest: (
    toUserId: string,
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
  markAllNotificationsRead: () => void;
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
      swipeRequests: [],
      notifications: [],
      customMealTypes: [],
      deliveryOptions: defaultDeliveryOptions,
      pendingNotification: null,

      // Auth
      register: (email, username, password, name) => {
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
          avatar: '👤',
          recipes: [],
        };
        set({
          users: [...users, newUser],
          currentUserId: newUser.id,
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
        set({ currentUserId: user.id });
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
        const { users } = get();
        set({
          users: users.map((u) => ({
            ...u,
            recipes: u.recipes.filter((r) => r.id !== recipeId),
          })),
        });
      },

      sendSwipeRequest: (toUserId, recipeIds, options = {}) => {
        const { currentUserId, swipeRequests, notifications, users } = get();
        if (!currentUserId) return;
        const request: SwipeRequest = {
          id: `req_${Date.now()}`,
          fromUserId: currentUserId,
          toUserId,
          recipeIds,
          status: 'pending',
          createdAt: Date.now(),
          mode: options.mode,
          category: options.category,
          message: options.message,
          deliveryIds: options.deliveryIds,
        };
        const fromUser = users.find((u) => u.id === currentUserId);

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
        set({
          swipeRequests: [...swipeRequests, request],
          notifications: [...notifications, notification],
          pendingNotification: notification,
        });
      },

      respondToSwipeRequest: (requestId, selectedRecipeIds) => {
        const { swipeRequests, notifications, users } = get();
        const request = swipeRequests.find((r) => r.id === requestId);
        if (!request) return;

        const toUser = users.find((u) => u.id === request.toUserId);

        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'swipe_response',
          fromUserId: request.toUserId,
          message: `${toUser?.name} выбрал(а) ${selectedRecipeIds.length} блюд для вас! 🎉`,
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

      markAllNotificationsRead: () => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) => ({ ...n, read: true })),
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
      version: 6,
      migrate: (persistedState: any) => {
        // Полная миграция на новую структуру
        return {
          users: persistedState?.users || [defaultUser],
          currentUserId: persistedState?.currentUserId || null,
          familyProfile: persistedState?.familyProfile || null,
          swipeRequests: persistedState?.swipeRequests || [],
          notifications: persistedState?.notifications || [],
          customMealTypes: persistedState?.customMealTypes || [],
          deliveryOptions: persistedState?.deliveryOptions || defaultDeliveryOptions,
          pendingNotification: null,
        } as AppState;
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
