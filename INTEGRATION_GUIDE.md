# 🔧 Пошаговая интеграция Frontend с Backend

## 📋 Обзор

Backend готов и работает на сервере. Теперь нужно интегрировать frontend с API.

**Важно:** Из-за объема изменений, интеграция будет выполняться поэтапно.

---

## 🎯 Этап 1: Обновление API URL

### Файл: `src/services/api.ts`

**Замените строку 5:**

```typescript
const API_BASE_URL = 'http://ваш_логин.beget.tech/backend/api';
```

**На ваш реальный домен:**

```typescript
const API_BASE_URL = 'http://q91929se.beget.tech/backend/api';
```

---

## 🎯 Этап 2: Обновление AuthScreen

### Файл: `src/components/AuthScreen.tsx`

**Замените функцию handleSubmit:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    if (mode === 'login') {
      await api.login({ login: email || username, password });
      onAuth();
    } else {
      if (!email || !username || !password || !name) {
        setError('Заполните все поля');
        return;
      }
      await api.register({
        email,
        username,
        password,
        name,
        avatar,
      });
      setShowSuccess(true);
      setTimeout(() => {
        onAuth();
      }, 2000);
    }
  } catch (error: any) {
    setError(error.message || 'Произошла ошибка');
  }
};
```

**Добавьте импорт в начало файла:**

```typescript
import * as api from '../services/api';
```

---

## 🎯 Этап 3: Обновление App.tsx

### Файл: `src/App.tsx`

**Замените проверку авторизации (строки 27-29):**

```typescript
// Если не авторизован - показываем экран авторизации
if (!api.isAuthenticated()) {
  return <AuthScreen onAuth={() => {
    setScreen('recipes');
    // Загружаем данные после входа
    useStore.getState().loadProfile();
    useStore.getState().loadRecipes();
    useStore.getState().loadNotifications();
  }} />;
}
```

**Добавьте импорт:**

```typescript
import * as api from './services/api';
```

---

## 🎯 Этап 4: Обновление RecipeList

### Файл: `src/components/RecipeList.tsx`

**Замените получение рецептов (строки 17-29):**

```typescript
export function RecipeList({ onEditRecipe, onAddRecipe }: Props) {
  const { recipes, currentUser, family, deleteRecipe, loadRecipes } = useStore();
  const allMealTypes = useAllMealTypes();
  
  // Загружаем рецепты при монтировании
  useEffect(() => {
    loadRecipes();
  }, []);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Получаем все рецепты семьи (если есть семья) или только свои
  const allFamilyRecipes = recipes;
```

**Добавьте импорт:**

```typescript
import { useEffect } from 'react';
```

---

## 🎯 Этап 5: Обновление AddRecipe

### Файл: `src/components/AddRecipe.tsx`

**Замените функцию handleSubmit (строки 170-185):**

```typescript
const handleSubmit = async () => {
  if (!name.trim()) return;
  
  const validUrls = imageUrls.filter((url) => url.trim());
  const recipeData = {
    name: name.trim(),
    description: description.trim(),
    image_urls: validUrls.length > 0 ? validUrls : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
    video_url: videoUrl.trim() || undefined,
    ingredients,
    meal_type: mealType,
    cooking_steps: cookingSteps.length > 0 ? cookingSteps : undefined,
    paired_recipe_ids: pairedRecipeIds.length > 0 ? pairedRecipeIds : undefined,
  };

  try {
    await createRecipe(recipeData);
    onDone();
  } catch (error: any) {
    alert('Ошибка при создании блюда: ' + error.message);
  }
};
```

**Замените деструктуризацию store (строка 14):**

```typescript
const { createRecipe, currentUser, family } = useStore();
```

---

## 🎯 Этап 6: Обновление ProfileScreen

### Файл: `src/components/ProfileScreen.tsx`

**Замените получение данных (строки 16-17):**

```typescript
const { currentUser, family, familyMembers, pendingRequests, loadProfile, loadFamily, createFamily, deleteFamily, respondToJoinRequest, addFamilyStatus, logout } = useStore();
```

**Замените функцию handleSave в PersonalProfile:**

```typescript
const handleSave = async () => {
  try {
    await updateProfile({ name, avatar, description });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  } catch (error: any) {
    alert('Ошибка при сохранении: ' + error.message);
  }
};
```

---

## 🎯 Этап 7: Обновление Notifications

### Файл: `src/components/Notifications.tsx`

**Замените получение уведомлений (строки 13-18):**

```typescript
const { notifications, unreadCount, loadNotifications, updateNotifications } = useStore();

// Загружаем уведомления при монтировании
useEffect(() => {
  loadNotifications();
}, []);
```

**Замените функцию handleMarkSelectedRead:**

```typescript
const handleMarkSelectedRead = async () => {
  if (selectedIds.length === 0) return;
  try {
    await updateNotifications({ notification_ids: selectedIds.map(id => parseInt(id)) });
    setSelectedIds([]);
    setSelectionMode(false);
  } catch (error: any) {
    alert('Ошибка: ' + error.message);
  }
};
```

---

## 🎯 Этап 8: Обновление SendRequest

### Файл: `src/components/SendRequest.tsx`

**Замените функцию handleSend (строки 50-80):**

```typescript
const handleSend = async () => {
  try {
    const recipeIds = selectedCategories.flatMap(cat => 
      getRecipesByCategory(cat).map((r) => r.id)
    );
    
    await createSwipeRequest({
      recipe_ids: recipeIds,
      to_user_id: sendTo === 'member' && partner ? parseInt(partner.id) : null,
      to_family_id: sendTo === 'family' && family ? parseInt(family.id) : null,
      mode: sendMode,
      category: selectedCategories[0],
      message: message.trim() || undefined,
    });
    
    setSent(true);
    setTimeout(() => onDone(), 2000);
  } catch (error: any) {
    alert('Ошибка при отправке: ' + error.message);
  }
};
```

---

## 🎯 Этап 9: Обновление SwipeSelector

### Файл: `src/components/SwipeSelector.tsx`

**Замените функцию respondToSwipe (строки 55-75):**

```typescript
const handleSwipe = async (direction: 'left' | 'right') => {
  const recipe = recipes[currentIndex];
  if (!recipe) return;

  if (direction === 'right') {
    setSelected((prev) => [...prev, recipe.id]);
  } else {
    setSkipped((prev) => [...prev, recipe.id]);
  }

  if (currentIndex >= recipes.length - 1) {
    // Отправляем ответ
    try {
      await respondToSwipeRequest(parseInt(requestId), selected);
      onDone();
    } catch (error: any) {
      alert('Ошибка: ' + error.message);
    }
  } else {
    setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
  }
};
```

---

## 🧪 Тестирование после каждого этапа

После каждого этапа:

1. **Сохраните файл**
2. **Запустите dev сервер:** `npm run dev`
3. **Откройте браузер:** `http://localhost:5173`
4. **Проверьте функциональность**
5. **Если есть ошибки** - пришлите текст ошибки

---

## 📞 Если возникли ошибки

### Ошибка: "Cannot find module '../services/api'"

**Решение:** Убедитесь, что файл `src/services/api.ts` существует.

### Ошибка: "Property 'X' does not exist on type 'AppState'"

**Решение:** Проверьте, что вы обновили store.ts на новую версию.

### Ошибка: "Type 'X' is not assignable to type 'Y'"

**Решение:** Проверьте типы данных в api.ts и убедитесь, что они совпадают с backend.

---

## ✅ Чек-лист интеграции

- [ ] Обновлен API_BASE_URL в api.ts
- [ ] Обновлен AuthScreen.tsx
- [ ] Обновлен App.tsx
- [ ] Обновлен RecipeList.tsx
- [ ] Обновлен AddRecipe.tsx
- [ ] Обновлен ProfileScreen.tsx
- [ ] Обновлен Notifications.tsx
- [ ] Обновлен SendRequest.tsx
- [ ] Обновлен SwipeSelector.tsx
- [ ] Протестирована регистрация
- [ ] Протестирован вход
- [ ] Протестировано создание семьи
- [ ] Протестировано создание блюда
- [ ] Протестированы уведомления

---

## 🚀 Альтернатива: Автоматическая интеграция

Если вы хотите, чтобы я автоматически обновил все компоненты, сообщите мне, и я выполню полную интеграцию.

**Время на автоматическую интеграцию:** ~30 минут

**Что будет сделано:**
- Обновлены все компоненты
- Исправлены все ошибки типов
- Протестирована работа с backend
- Создана финальная сборка

---

**Выберите вариант:**
1. **Ручная интеграция** (по этой инструкции)
2. **Автоматическая интеграция** (я обновлю все файлы)

Сообщите ваш выбор! 🎯
