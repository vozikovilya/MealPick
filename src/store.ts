import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe, User, SwipeRequest, Notification } from './types';

interface AppState {
  users: User[];
  currentUserId: string;
  swipeRequests: SwipeRequest[];
  notifications: Notification[];
  
  // Actions
  setCurrentUser: (userId: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'ownerId' | 'createdAt'>) => void;
  deleteRecipe: (recipeId: string) => void;
  sendSwipeRequest: (toUserId: string, recipeIds: string[], mode?: 'category' | 'select', category?: 'breakfast' | 'lunch' | 'dinner') => void;
  respondToSwipeRequest: (requestId: string, selectedRecipeIds: string[]) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

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
          'https://images.unsplash.com/photo-1519676867240-f03562e64571?w=400',
        ],
        ingredients: ['Мука', 'Молоко', 'Яйца', 'Творог', 'Мёд', 'Сахар'],
        mealType: 'breakfast',
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
          'https://images.unsplash.com/photo-1588013273468-315fd945e4d2?w=400',
        ],
        ingredients: ['Спагетти', 'Бекон', 'Яйца', 'Пармезан', 'Чёрный перец', 'Чеснок'],
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
        ingredients: ['Лосось', 'Лимон', 'Оливковое масло', 'Брокколи', 'Цуккини', 'Соль', 'Перец'],
        mealType: 'dinner',
        ownerId: 'user1',
        createdAt: Date.now() - 300000,
      },
      {
        id: 'r4',
        name: 'Овсянка с ягодами',
        description: 'Полезная овсяная каша со свежими ягодами и орехами',
        imageUrls: [
          'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
        ],
        ingredients: ['Овсяные хлопья', 'Молоко', 'Черника', 'Клубника', 'Мёд', 'Грецкие орехи'],
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
        ingredients: ['Творог', 'Яйца', 'Мука', 'Сахар', 'Ваниль', 'Сметана'],
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
        ingredients: ['Креветки', 'Кокосовое молоко', 'Грибы', 'Лемонграсс', 'Лайм', 'Перец чили'],
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
          'https://images.unsplash.com/photo-1607920592519-bab2a4e0d362?w=400',
        ],
        ingredients: ['Маскарпоне', 'Савоярди', 'Кофе', 'Яйца', 'Сахар', 'Какао'],
        mealType: 'dinner',
        ownerId: 'user2',
        createdAt: Date.now() - 700000,
      },
      {
        id: 'r8',
        name: 'Боул с курицей',
        description: 'Полезный боул с курицей гриль, киноа и овощами',
        imageUrls: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        ],
        ingredients: ['Куриная грудка', 'Киноа', 'Авокадо', 'Помидоры', 'Огурец', 'Оливковое масло'],
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
        
        const categoryLabels: Record<string, string> = {
          breakfast: 'завтрак',
          lunch: 'обед',
          dinner: 'ужин',
        };
        
        let message = '';
        if (mode === 'category' && category) {
          message = `${fromUser?.name} предлагает выбрать ${categoryLabels[category]}!`;
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

        const fromUser = users.find((u) => u.id === request.fromUserId);
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
    }),
    {
      name: 'meal-picker-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Миграция с версии 0/1 (imageUrl) на версию 2 (imageUrls)
        if (version < 2 && persistedState?.users) {
          persistedState.users = persistedState.users.map((user: any) => ({
            ...user,
            recipes: user.recipes?.map((recipe: any) => {
              // Если есть старое поле imageUrl и нет imageUrls
              if (recipe.imageUrl && !recipe.imageUrls) {
                return {
                  ...recipe,
                  imageUrls: [recipe.imageUrl],
                  imageUrl: undefined,
                };
              }
              // Если imageUrls undefined или пустой
              if (!recipe.imageUrls || recipe.imageUrls.length === 0) {
                return {
                  ...recipe,
                  imageUrls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
                };
              }
              return recipe;
            }),
          }));
        }
        return persistedState as AppState;
      },
    }
  )
);
