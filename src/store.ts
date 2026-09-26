import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe, User, SwipeRequest, Notification, Ingredient, MealTypeOption } from './types';

interface AppState {
  users: User[];
  currentUserId: string;
  swipeRequests: SwipeRequest[];
  notifications: Notification[];
  customMealTypes: MealTypeOption[];

  // Actions
  setCurrentUser: (userId: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'ownerId' | 'createdAt'>) => void;
  deleteRecipe: (recipeId: string) => void;
  sendSwipeRequest: (toUserId: string, recipeIds: string[], mode?: 'category' | 'select', category?: string) => void;
  respondToSwipeRequest: (requestId: string, selectedRecipeIds: string[]) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  addCustomMealType: (name: string, emoji: string) => void;
  deleteCustomMealType: (id: string) => void;
}

const defaultMealTypes: MealTypeOption[] = [
  { id: 'breakfast', name: 'Завтрак', emoji: '🌅', isDefault: true },
  { id: 'lunch', name: 'Обед', emoji: '☀️', isDefault: true },
  { id: 'dinner', name: 'Ужин', emoji: '🌙', isDefault: true },
];

// Хелпер для создания ингредиента из строки
const ing = (name: string, amount?: string, unit?: string): Ingredient => ({
  id: `ing_${Math.random().toString(36).slice(2, 9)}`,
  name,
  amount,
  unit,
});

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
        imageUrls: [
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
          'https://images.unsplash.com/photo-1519676867240-f03562e4571?w=400',
        ],
        ingredients: [
          ing('Мука', '200', 'г'),
          ing('Молоко', '500', 'мл'),
          ing('Яйца', '2', 'шт'),
          ing('Творог', '300', 'г'),
          ing('Мёд', '2', 'ст.л.'),
          ing('Сахар', '1', 'ст.л.'),
        ],
        mealType: 'breakfast',
        cookingSteps: [
          { id: 's1', text: 'Смешайте муку, яйца, молоко и сахар до однородной массы.' },
          { id: 's2', text: 'Разогрейте сковороду, налейте тонкий слой теста.', imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e4571?w=400' },
          { id: 's3', text: 'Обжаривайте с двух сторон до золотистого цвета.' },
          { id: 's4', text: 'Намажьте творогом, сверните и подавайте с мёдом.' },
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
          'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
        ],
        ingredients: [
          ing('Спагетти', '400', 'г'),
          ing('Бекон', '200', 'г'),
          ing('Яйца', '3', 'шт'),
          ing('Пармезан', '100', 'г'),
          ing('Чёрный перец', '1', 'ч.л.'),
          ing('Чеснок', '2', 'зубч.'),
        ],
        mealType: 'lunch',
        ownerId: 'user1',
        createdAt: Date.now() - 200000,
      },
      {
        id: 'r3',
        name: 'Лосось на гриле',
        description: 'Стейк лосося с овощами гриль и лимонным соусом',
        imageUrls: [
          'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
          'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
        ],
        ingredients: [
          ing('Лосось', '2', 'стейка'),
          ing('Лимон', '1', 'шт'),
          ing('Оливковое масло', '3', 'ст.л.'),
          ing('Брокколи', '200', 'г'),
          ing('Цуккини', '1', 'шт'),
          ing('Соль'),
          ing('Перец'),
        ],
        mealType: 'dinner',
        ownerId: 'user1',
        createdAt: Date.now() - 300000,
      },
      {
        id: 'r4',
        name: 'Овсянка с ягодами',
        description: 'Полезная овсяная каша со свежими ягодами и орехами',
        imageUrls: ['https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400'],
        ingredients: [
          ing('Овсяные хлопья', '100', 'г'),
          ing('Молоко', '250', 'мл'),
          ing('Черника', '50', 'г'),
          ing('Клубника', '50', 'г'),
          ing('Мёд', '1', 'ст.л.'),
          ing('Грецкие орехи', '30', 'г'),
        ],
        mealType: 'breakfast',
        ownerId: 'user1',
        createdAt: Date.now() - 400000,
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
        imageUrls: [
          'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400',
          'https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=400',
        ],
        ingredients: [
          ing('Творог', '500', 'г'),
          ing('Яйца', '2', 'шт'),
          ing('Мука', '3', 'ст.л.'),
          ing('Сахар', '2', 'ст.л.'),
          ing('Ваниль', '1', 'ч.л.'),
          ing('Сметана', '100', 'г'),
        ],
        mealType: 'breakfast',
        ownerId: 'user2',
        createdAt: Date.now() - 500000,
      },
      {
        id: 'r6',
        name: 'Том Ям',
        description: 'Тайский острый суп с креветками и грибами',
        imageUrls: [
          'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400',
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ],
        ingredients: [
          ing('Креветки', '300', 'г'),
          ing('Кокосовое молоко', '400', 'мл'),
          ing('Грибы', '200', 'г'),
          ing('Лемонграсс', '2', 'стебля'),
          ing('Лайм', '2', 'шт'),
          ing('Перец чили', '1', 'шт'),
        ],
        mealType: 'lunch',
        ownerId: 'user2',
        createdAt: Date.now() - 600000,
      },
      {
        id: 'r7',
        name: 'Тирамису',
        description: 'Классический итальянский десерт с маскарпоне и кофе',
        imageUrls: [
          'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
          'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400',
        ],
        ingredients: [
          ing('Маскарпоне', '500', 'г'),
          ing('Савоярди', '200', 'г'),
          ing('Кофе эспрессо', '300', 'мл'),
          ing('Яйца', '4', 'шт'),
          ing('Сахар', '100', 'г'),
          ing('Какао', '2', 'ст.л.'),
        ],
        mealType: 'dinner',
        cookingSteps: [
          { id: 's1', text: 'Заварите крепкий кофе и остудите.' },
          { id: 's2', text: 'Отделите белки от желтков. Взбейте желтки с сахаром до белой массы.' },
          { id: 's3', text: 'Добавьте маскарпоне к желткам, аккуратно перемешайте.', imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400' },
          { id: 's4', text: 'Взбейте белки в крепкую пену и введите в крем.' },
          { id: 's5', text: 'Обмакните савоярди в кофе, выложите слоем. Покройте кремом. Повторите слои.' },
          { id: 's6', text: 'Посыпьте какао и уберите в холодильник на 4 часа.' },
        ],
        ownerId: 'user2',
        createdAt: Date.now() - 700000,
      },
      {
        id: 'r8',
        name: 'Боул с курицей',
        description: 'Полезный боул с курицей гриль, киноа и овощами',
        imageUrls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
        ingredients: [
          ing('Куриная грудка', '1', 'шт'),
          ing('Киноа', '150', 'г'),
          ing('Авокадо', '1', 'шт'),
          ing('Помидоры', '2', 'шт'),
          ing('Огурец', '1', 'шт'),
          ing('Оливковое масло', '2', 'ст.л.'),
        ],
        mealType: 'lunch',
        ownerId: 'user2',
        createdAt: Date.now() - 800000,
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

      sendSwipeRequest: (toUserId, recipeIds, mode, category) => {
        const { currentUserId, swipeRequests, notifications, users } = get();
        const request: SwipeRequest = {
          id: `req_${Date.now()}`,
          fromUserId: currentUserId,
          toUserId,
          recipeIds,
          status: 'pending',
          createdAt: Date.now(),
          mode,
          category,
        };
        const fromUser = users.find((u) => u.id === currentUserId);
        
        const allTypes = [...defaultMealTypes, ...get().customMealTypes];
        const mealType = allTypes.find((m) => m.id === category);
        const categoryName = mealType?.name.toLowerCase() || 'блюда';
        
        let message = '';
        if (mode === 'category' && category) {
          message = `${fromUser?.name} предлагает выбрать на ${categoryName}!`;
        } else {
          message = `${fromUser?.name} хочет, чтобы вы выбрали блюда!`;
        }
        
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'swipe_request',
          fromUserId: currentUserId,
          message,
          requestId: request.id,
          read: false,
          createdAt: Date.now(),
        };
        set({
          swipeRequests: [...swipeRequests, request],
          notifications: [...notifications, notification],
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
          message: `${toUser?.name} выбрал(а) ${selectedRecipeIds.length} блюд для вас!`,
          requestId,
          read: false,
          createdAt: Date.now(),
        };

        set({
          swipeRequests: swipeRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'completed' as const, selectedRecipeIds }
              : r
          ),
          notifications: [...notifications, notification],
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

      addCustomMealType: (name, emoji) => {
        const { customMealTypes } = get();
        const newType: MealTypeOption = {
          id: `mt_${Date.now()}`,
          name,
          emoji,
          isDefault: false,
        };
        set({ customMealTypes: [...customMealTypes, newType] });
      },

      deleteCustomMealType: (id) => {
        const { customMealTypes } = get();
        set({ customMealTypes: customMealTypes.filter((m) => m.id !== id) });
      },
    }),
    {
      name: 'meal-picker-storage',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // Миграция ингредиентов из string[] в Ingredient[]
          if (persistedState?.users) {
            persistedState.users = persistedState.users.map((user: any) => ({
              ...user,
              recipes: user.recipes?.map((recipe: any) => {
                // Миграция imageUrl -> imageUrls
                let imageUrls = recipe.imageUrls;
                if (recipe.imageUrl && !imageUrls) {
                  imageUrls = [recipe.imageUrl];
                }
                if (!imageUrls || imageUrls.length === 0) {
                  imageUrls = ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'];
                }

                // Миграция ингредиентов
                let ingredients = recipe.ingredients;
                if (ingredients && ingredients.length > 0 && typeof ingredients[0] === 'string') {
                  ingredients = ingredients.map((name: string) => ({
                    id: `ing_${Math.random().toString(36).slice(2, 9)}`,
                    name,
                  }));
                }
                if (!ingredients) ingredients = [];

                return {
                  ...recipe,
                  imageUrls,
                  imageUrl: undefined,
                  ingredients,
                  cookingSteps: recipe.cookingSteps || [],
                };
              }),
            }));
          }
          if (!persistedState.customMealTypes) {
            persistedState.customMealTypes = [];
          }
        }
        return persistedState as AppState;
      },
    }
  )
);

// Селектор для получения всех типов приёмов пищи
export const useAllMealTypes = () => {
  const customMealTypes = useStore((s) => s.customMealTypes);
  return [...defaultMealTypes, ...customMealTypes];
};
