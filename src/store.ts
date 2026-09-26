import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe, User, SwipeRequest, Notification, Ingredient, MealTypeOption, DeliveryOption, CookingStep } from './types';

interface AppState {
  users: User[];
  currentUserId: string;
  swipeRequests: SwipeRequest[];
  notifications: Notification[];
  customMealTypes: MealTypeOption[];
  deliveryOptions: DeliveryOption[];
  pendingNotification: Notification | null; // для полноэкранной модалки

  setCurrentUser: (userId: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'ownerId' | 'createdAt'>) => void;
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

// ID подборок для связи
const SIDE_IDS = ['side1', 'side2', 'side3', 'side4'];

const defaultUsers: User[] = [
  {
    id: 'user1',
    name: 'Алекс',
    avatar: '👨‍🍳',
    recipes: [
      {
        id: 'r1',
        name: 'Блинчики с творогом',
        description: 'Нежные блинчики с творожной начинкой и мёдом',
        imageUrls: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'],
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
        imageUrls: ['https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400'],
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
        imageUrls: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'],
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
        imageUrls: ['https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400'],
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
        imageUrls: ['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'],
        ingredients: [ing('Гречка', '200', 'г'), ing('Вода', '400', 'мл'), ing('Соль')],
        mealType: 'sides',
        ownerId: 'user1',
        createdAt: Date.now() - 450000,
      },
      {
        id: 'side2',
        name: 'Пюре картофельное',
        description: 'Нежное пюре со сливочным маслом',
        imageUrls: ['https://images.unsplash.com/photo-1600167705956-6b8633555b92?w=400'],
        ingredients: [ing('Картофель', '1', 'кг'), ing('Молоко', '150', 'мл'), ing('Масло', '50', 'г')],
        mealType: 'sides',
        ownerId: 'user1',
        createdAt: Date.now() - 460000,
      },
      {
        id: 'dessert1',
        name: 'Панна-котта',
        description: 'Итальянский сливочный десерт с ягодами',
        imageUrls: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'],
        ingredients: [ing('Сливки', '500', 'мл'), ing('Сахар', '100', 'г'), ing('Желатин', '10', 'г')],
        mealType: 'desserts',
        ownerId: 'user1',
        createdAt: Date.now() - 470000,
      },
      {
        id: 'dessert2',
        name: 'Чизкейк',
        description: 'Классический чизкейк Нью-Йорк',
        imageUrls: ['https://images.unsplash.com/photo-1533134242443-d4fd21530c7d?w=400'],
        ingredients: [ing('Сыр', '500', 'г'), ing('Сахар', '150', 'г'), ing('Яйца', '3', 'шт')],
        mealType: 'desserts',
        ownerId: 'user1',
        createdAt: Date.now() - 480000,
      },
      {
        id: 'drink1',
        name: 'Смузи ягодный',
        description: 'Освежающий смузи из свежих ягод',
        imageUrls: ['https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400'],
        ingredients: [ing('Клубника', '100', 'г'), ing('Банан', '1', 'шт'), ing('Йогурт', '200', 'мл')],
        mealType: 'drinks',
        ownerId: 'user1',
        createdAt: Date.now() - 490000,
      },
      {
        id: 'drink2',
        name: 'Лимонад',
        description: 'Домашний лимонад с мятой',
        imageUrls: ['https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400'],
        ingredients: [ing('Лимоны', '3', 'шт'), ing('Сахар', '100', 'г'), ing('Мята')],
        mealType: 'drinks',
        ownerId: 'user1',
        createdAt: Date.now() - 500000,
      },
      {
        id: 'sauce1',
        name: 'Песто',
        description: 'Итальянский соус из базилика',
        imageUrls: ['https://images.unsplash.com/photo-1601314167039-470909f76620?w=400'],
        ingredients: [ing('Базилик', '50', 'г'), ing('Орехи', '30', 'г'), ing('Пармезан', '50', 'г'), ing('Оливковое масло', '100', 'мл')],
        mealType: 'sauces',
        ownerId: 'user1',
        createdAt: Date.now() - 510000,
      },
      {
        id: 'sauce2',
        name: 'Ткемали',
        description: 'Грузинский соус из алычи',
        imageUrls: ['https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400'],
        ingredients: [ing('Алыча', '500', 'г'), ing('Чеснок', '3', 'зубч.'), ing('Кинза'), ing('Соль')],
        mealType: 'sauces',
        ownerId: 'user1',
        createdAt: Date.now() - 520000,
      },
    ],
  },
  {
    id: 'user2',
    name: 'Мария',
    avatar: '👩‍🍳',
    recipes: [
      {
        id: 'r5',
        name: 'Сырники',
        description: 'Пышные сырники со сметаной и вареньем',
        imageUrls: ['https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400'],
        ingredients: [ing('Творог', '500', 'г'), ing('Яйца', '2', 'шт'), ing('Мука', '3', 'ст.л.'), ing('Сахар', '2', 'ст.л.')],
        mealType: 'breakfast',
        ownerId: 'user2',
        createdAt: Date.now() - 500000,
      },
      {
        id: 'r6',
        name: 'Том Ям',
        description: 'Тайский острый суп с креветками и грибами',
        imageUrls: ['https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400'],
        ingredients: [ing('Креветки', '300', 'г'), ing('Кокосовое молоко', '400', 'мл'), ing('Грибы', '200', 'г')],
        mealType: 'lunch',
        ownerId: 'user2',
        createdAt: Date.now() - 600000,
      },
      {
        id: 'r7',
        name: 'Тирамису',
        description: 'Классический итальянский десерт с маскарпоне и кофе',
        imageUrls: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400'],
        ingredients: [ing('Маскарпоне', '500', 'г'), ing('Савоярди', '200', 'г'), ing('Кофе', '300', 'мл')],
        mealType: 'dinner',
        cookingSteps: [
          step('Кофе', 'Заварите крепкий кофе и остудите.'),
          step('Крем', 'Взбейте желтки с сахаром, добавьте маскарпоне.'),
          step('Сборка', 'Обмакните савоярди в кофе, выложите слоями с кремом.', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400'),
          step('Охлаждение', 'Посыпьте какао и уберите в холодильник на 4 часа.'),
        ],
        ownerId: 'user2',
        createdAt: Date.now() - 700000,
      },
      {
        id: 'r8',
        name: 'Боул с курицей',
        description: 'Полезный боул с курицей гриль, киноа и овощами',
        imageUrls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
        ingredients: [ing('Куриная грудка', '1', 'шт'), ing('Киноа', '150', 'г'), ing('Авокадо', '1', 'шт')],
        mealType: 'lunch',
        pairedRecipeIds: ['side3'],
        ownerId: 'user2',
        createdAt: Date.now() - 800000,
      },
      // Подборки
      {
        id: 'side3',
        name: 'Рис',
        description: 'Рассыпчатый рис басмати',
        imageUrls: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
        ingredients: [ing('Рис', '200', 'г'), ing('Вода', '400', 'мл')],
        mealType: 'sides',
        ownerId: 'user2',
        createdAt: Date.now() - 850000,
      },
      {
        id: 'side4',
        name: 'Кускус',
        description: 'Лёгкий гарнир с овощами',
        imageUrls: ['https://images.unsplash.com/photo-1580913428706-cdd742fd1bb2?w=400'],
        ingredients: [ing('Кускус', '200', 'г'), ing('Кипяток', '250', 'мл')],
        mealType: 'sides',
        ownerId: 'user2',
        createdAt: Date.now() - 860000,
      },
      {
        id: 'dessert3',
        name: 'Штрудель',
        description: 'Яблочный штрудель с корицей',
        imageUrls: ['https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400'],
        ingredients: [ing('Тесто', '1', 'лист'), ing('Яблоки', '4', 'шт'), ing('Корица')],
        mealType: 'desserts',
        ownerId: 'user2',
        createdAt: Date.now() - 870000,
      },
      {
        id: 'drink3',
        name: 'Матча латте',
        description: 'Японский чай матча с молоком',
        imageUrls: ['https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400'],
        ingredients: [ing('Матча', '2', 'ч.л.'), ing('Молоко', '200', 'мл')],
        mealType: 'drinks',
        ownerId: 'user2',
        createdAt: Date.now() - 880000,
      },
      {
        id: 'sauce3',
        name: 'Томатный соус',
        description: 'Домашний соус из свежих томатов',
        imageUrls: ['https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400'],
        ingredients: [ing('Томаты', '500', 'г'), ing('Чеснок', '2', 'зубч.'), ing('Базилик')],
        mealType: 'sauces',
        ownerId: 'user2',
        createdAt: Date.now() - 890000,
      },
    ],
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: defaultUsers,
      currentUserId: 'user1',
      swipeRequests: [],
      notifications: [],
      customMealTypes: [],
      deliveryOptions: defaultDeliveryOptions,
      pendingNotification: null,

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      addRecipe: (recipeData) => {
        const { currentUserId, users } = get();
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
          pendingNotification: notification, // показываем полноэкранную модалку
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
          pendingNotification: notification, // показываем модалку с ответом
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
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          if (persistedState?.users) {
            persistedState.users = persistedState.users.map((user: any) => ({
              ...user,
              recipes: user.recipes?.map((recipe: any) => {
                let imageUrls = recipe.imageUrls;
                if (recipe.imageUrl && !imageUrls) imageUrls = [recipe.imageUrl];
                if (!imageUrls || imageUrls.length === 0) {
                  imageUrls = ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'];
                }
                let ingredients = recipe.ingredients;
                if (ingredients && ingredients.length > 0 && typeof ingredients[0] === 'string') {
                  ingredients = ingredients.map((name: string) => ({
                    id: `ing_${Math.random().toString(36).slice(2, 9)}`,
                    name,
                  }));
                }
                if (!ingredients) ingredients = [];
                // Миграция cookingSteps: добавляем title если его нет
                let cookingSteps = recipe.cookingSteps;
                if (cookingSteps) {
                  cookingSteps = cookingSteps.map((s: any, i: number) => ({
                    ...s,
                    title: s.title || `Шаг ${i + 1}`,
                  }));
                }
                return {
                  ...recipe,
                  imageUrls,
                  imageUrl: undefined,
                  ingredients,
                  cookingSteps,
                  pairedRecipeIds: recipe.pairedRecipeIds || [],
                };
              }),
            }));
          }
          if (!persistedState.customMealTypes) persistedState.customMealTypes = [];
          if (!persistedState.deliveryOptions) persistedState.deliveryOptions = defaultDeliveryOptions;
        }
        return persistedState as AppState;
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
