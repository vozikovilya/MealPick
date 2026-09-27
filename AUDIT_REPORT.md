# Аудит кода MealPick: Уязвимости и Оптимизация

## 🔴 КРИТИЧЕСКИЕ УЯЗВИМОСТИ

### 1. Хранение паролей в открытом виде
**Файл:** `src/store.ts` (строка 92)
**Проблема:** Пароль пользователя хранится в открытом виде в коде и localStorage
**Риск:** Любой, кто имеет доступ к localStorage или исходному коду, может увидеть пароли всех пользователей

**Решение:**
```typescript
// Добавить хэширование паролей
import { hash, compare } from 'bcryptjs'; // или другую библиотеку

// При регистрации
const hashedPassword = await hash(password, 10);

// При входе
const isValid = await compare(password, user.passwordHash);
```

**Приоритет:** 🔴 КРИТИЧЕСКИЙ

---

### 2. Отсутствие валидации загружаемых файлов
**Файл:** `src/components/AddRecipe.tsx` (строки 96-125)
**Проблема:** Нет проверки размера и типа файлов
**Риск:** 
- Загрузка вредоносных файлов
- Превышение лимитов localStorage (5-10 MB)
- DoS атака через большие файлы

**Решение:**
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  Array.from(files).forEach((file) => {
    // Проверка типа
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Недопустимый тип файла: ${file.type}`);
      return;
    }
    
    // Проверка размера
    if (file.size > MAX_FILE_SIZE) {
      setError(`Файл ${file.name} слишком большой (макс. 5 MB)`);
      return;
    }
    
    // Продолжить загрузку...
  });
};
```

**Приоритет:** 🟠 ВЫСОКИЙ

---

### 3. XSS уязвимость через пользовательский ввод
**Файлы:** Все компоненты с формами
**Проблема:** Пользовательский ввод не санитизируется перед отображением
**Риск:** Внедрение вредоносного JavaScript кода

**Решение:**
```typescript
// Создать утилиту для санитизации
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Удалить HTML теги
    .replace(/javascript:/gi, '') // Удалить javascript: протокол
    .trim();
};

// Использовать во всех формах
const handleAddIngredient = () => {
  const sanitized = sanitizeInput(ingName);
  // ...
};
```

**Приоритет:** 🟠 ВЫСОКИЙ

---

### 4. Отсутствие rate limiting для авторизации
**Файл:** `src/components/AuthScreen.tsx`
**Проблема:** Нет защиты от brute force атак
**Риск:** Подбор паролей перебором

**Решение:**
```typescript
const [loginAttempts, setLoginAttempts] = useState(0);
const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Проверка блокировки
  if (lockoutUntil && Date.now() < lockoutUntil) {
    const seconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
    setError(`Слишком много попыток. Подождите ${seconds} сек.`);
    return;
  }
  
  const result = login(email, password);
  if (!result.success) {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    // Блокировка после 5 попыток на 30 секунд
    if (newAttempts >= 5) {
      setLockoutUntil(Date.now() + 30000);
      setLoginAttempts(0);
      setError('Слишком много неудачных попыток. Подождите 30 секунд.');
    }
  }
};
```

**Приоритет:** 🟡 СРЕДНИЙ

---

## 🟡 ПРОБЛЕМЫ БЕЗОПАСНОСТИ

### 5. Хранение чувствительных данных в localStorage
**Файл:** `src/store.ts`
**Проблема:** Все данные пользователей хранятся в localStorage без шифрования
**Риск:** Доступ к данным при XSS атаке или физическом доступе к устройству

**Решение:**
- Использовать шифрование для чувствительных данных
- Добавить опцию "Запомнить меня" с ограниченным сроком хранения
- Очищать данные при выходе

```typescript
// Использовать crypto-js для шифрования
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'your-secret-key'; // Хранить в env переменных

const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

const decryptData = (encrypted: string): any => {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

**Приоритет:** 🟡 СРЕДНИЙ

---

### 6. Отсутствие валидации email
**Файл:** `src/components/AuthScreen.tsx`
**Проблема:** Нет проверки формата email
**Риск:** Ввод некорректных данных

**Решение:**
```typescript
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleSubmit = (e: React.FormEvent) => {
  if (!validateEmail(email)) {
    setError('Некорректный формат email');
    return;
  }
  // ...
};
```

**Приоритет:** 🟡 СРЕДНИЙ

---

## 🚀 ОПТИМИЗАЦИЯ ПРОИЗВОДИТЕЛЬНОСТИ

### 7. Пересчет данных при каждом рендере
**Файлы:** `RecipeList.tsx`, `SwipeSelector.tsx`, `App.tsx`
**Проблема:** Вычисления выполняются при каждом рендере компонента
**Влияние:** Замедление работы при большом количестве данных

**Решение для RecipeList.tsx:**
```typescript
import { useMemo } from 'react';

export function RecipeList({ onEditRecipe, onAddRecipe }: Props) {
  const { users, currentUserId, deleteRecipe } = useStore();
  const allMealTypes = useAllMealTypes();
  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) : null;
  
  // Мемоизация группировки рецептов
  const { groupedRecipes, collectionRecipes } = useMemo(() => {
    if (!currentUser) return { groupedRecipes: {}, collectionRecipes: {} };
    
    const mainMealTypes = allMealTypes.filter((mt) => !mt.isCollection);
    const collectionMealTypes = allMealTypes.filter((mt) => mt.isCollection);
    
    const grouped: Record<string, Recipe[]> = {};
    const collection: Record<string, Recipe[]> = {};
    
    mainMealTypes.forEach((mt) => {
      const recipes = currentUser.recipes.filter((r) => r.mealType === mt.id);
      if (recipes.length > 0) grouped[mt.id] = recipes;
    });
    
    collectionMealTypes.forEach((mt) => {
      const recipes = currentUser.recipes.filter((r) => r.mealType === mt.id);
      if (recipes.length > 0) collection[mt.id] = recipes;
    });
    
    return { groupedRecipes: grouped, collectionRecipes: collection };
  }, [currentUser, allMealTypes]);
  
  // ...
}
```

**Решение для App.tsx:**
```typescript
import { useMemo } from 'react';

function App() {
  const { notifications, currentUserId, pendingNotification, setPendingNotification, users } = useStore();
  
  // Мемоизация подсчета непрочитанных
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && n.type === 'swipe_request').length;
  }, [notifications]);
  
  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId);
  }, [users, currentUserId]);
  
  // ...
}
```

**Решение для SwipeSelector.tsx:**
```typescript
import { useMemo } from 'react';

export function SwipeSelector({ requestId, onDone }: Props) {
  const { swipeRequests, users, respondToSwipeRequest, currentUserId } = useStore();
  const request = swipeRequests.find((r) => r.id === requestId);
  
  // Мемоизация поиска рецептов
  const recipes = useMemo(() => {
    if (!request) return [];
    
    return request.recipeIds
      .map((id) => {
        for (const user of users) {
          const recipe = user.recipes.find((r) => r.id === id);
          if (recipe) return recipe;
        }
        return null;
      })
      .filter(Boolean) as Recipe[];
  }, [request, users]);
  
  // ...
}
```

**Приоритет:** 🟡 СРЕДНИЙ

---

### 8. Отсутствие ленивой загрузки изображений
**Файлы:** Все компоненты с изображениями
**Проблема:** Все изображения загружаются сразу
**Влияние:** Медленная начальная загрузка, большой расход трафика

**Решение:**
```typescript
// Использовать Intersection Observer для lazy loading
import { useEffect, useRef, useState } from 'react';

function LazyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isVisible ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

**Приоритет:** 🟢 НИЗКИЙ

---

### 9. Отсутствие кэширования вычислений
**Файл:** `src/store.ts`
**Проблема:** Селекторы пересчитываются при каждом обращении
**Влияние:** Избыточные вычисления

**Решение:**
```typescript
import { createSelector } from 'reselect';

// Создать мемоизированные селекторы
const selectUsers = (state: AppState) => state.users;
const selectCurrentUserId = (state: AppState) => state.currentUserId;

export const selectCurrentUser = createSelector(
  [selectUsers, selectCurrentUserId],
  (users, currentUserId) => users.find(u => u.id === currentUserId)
);

export const selectUnreadCount = createSelector(
  [(state: AppState) => state.notifications],
  (notifications) => notifications.filter((n) => !n.read && n.type === 'swipe_request').length
);

// Использовать в компонентах
const currentUser = useStore(selectCurrentUser);
const unreadCount = useStore(selectUnreadCount);
```

**Приоритет:** 🟢 НИЗКИЙ

---

### 10. Оптимизация размера бандла
**Проблема:** Большой размер JavaScript бандла
**Влияние:** Медленная загрузка приложения

**Решения:**

1. **Code splitting с React.lazy:**
```typescript
import { lazy, Suspense } from 'react';

const AddRecipe = lazy(() => import('./components/AddRecipe'));
const SwipeSelector = lazy(() => import('./components/SwipeSelector'));

function App() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      {screen === 'add' && <AddRecipe />}
    </Suspense>
  );
}
```

2. **Оптимизация изображений:**
- Использовать WebP формат
- Добавить srcset для разных разрешений
- Сжимать изображения перед загрузкой

3. **Удаление неиспользуемого кода:**
```bash
# Установить анализатор бандла
npm install --save-dev rollup-plugin-visualizer

# Добавить в vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      filename: 'dist/stats.html',
    }),
  ],
});
```

**Приоритет:** 🟢 НИЗКИЙ

---

## 📊 РЕКОМЕНДАЦИИ ПО АРХИТЕКТУРЕ

### 11. Разделение бизнес-логики и UI
**Проблема:** Бизнес-логика смешана с UI компонентами
**Решение:**
- Вынести валидацию в отдельные утилиты
- Создать сервисный слой для работы с данными
- Использовать custom hooks для сложной логики

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const { login, register, logout } = useStore();
  
  const validateCredentials = (email: string, password: string) => {
    // Валидация
  };
  
  const handleLogin = async (email: string, password: string) => {
    // Логика входа
  };
  
  return { validateCredentials, handleLogin, logout };
};
```

---

### 12. Добавление тестов
**Проблема:** Отсутствие тестов
**Решение:**
```typescript
// Установить Jest и React Testing Library
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

// Пример теста
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthScreen } from './AuthScreen';

test('показывает ошибку при неверном пароле', () => {
  render(<AuthScreen onAuth={() => {}} />);
  
  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'test@test.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Пароль'), {
    target: { value: 'wrong' },
  });
  fireEvent.click(screen.getByText('Войти'));
  
  expect(screen.getByText('Неверный email/логин или пароль')).toBeInTheDocument();
});
```

---

## 🎯 ПРИОРИТЕТЫ ИСПРАВЛЕНИЙ

### Фаза 1: Критические уязвимости (1-2 дня)
1. ✅ Хэширование паролей
2. ✅ Валидация загружаемых файлов
3. ✅ Санитизация пользовательского ввода

### Фаза 2: Важные улучшения (3-5 дней)
4. ✅ Rate limiting для авторизации
5. ✅ Валидация email
6. ✅ Мемоизация вычислений (useMemo)

### Фаза 3: Оптимизация (1 неделя)
7. ✅ Ленивая загрузка изображений
8. ✅ Code splitting
9. ✅ Оптимизация размера бандла
10. ✅ Добавление тестов

---

## 📈 МЕТРИКИ ДЛЯ МОНИТОРИНГА

После внедрения оптимизаций отслеживайте:
- **Largest Contentful Paint (LCP)** - должен быть < 2.5 сек
- **First Input Delay (FID)** - должен быть < 100 мс
- **Cumulative Layout Shift (CLS)** - должен быть < 0.1
- **Размер бандла** - целевой < 200 KB (gzip)
- **Время загрузки** - целевой < 3 сек на 3G

Используйте Lighthouse для аудита:
```bash
npm install -g lighthouse
lighthouse https://your-app.com --view
```

---

## 🔐 БЕЗОПАСНОСТЬ В ПРОДЫ

Для production версии необходимо:
1. **HTTPS** - обязательное шифрование трафика
2. **Content Security Policy (CSP)** - защита от XSS
3. **Secure cookies** - для сессионных данных
4. **Rate limiting на сервере** - защита от DDoS
5. **Регулярные security audits** - автоматические проверки
6. **Мониторинг уязвимостей** - npm audit, Snyk

```javascript
// Добавить в index.html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https:;
">
```

---

## 📝 ЗАКЛЮЧЕНИЕ

Текущая версия приложения имеет несколько критических уязвимостей безопасности, которые необходимо исправить перед использованием в production. Основные проблемы:

1. **Безопасность:** Пароли в открытом виде, отсутствие валидации файлов
2. **Производительность:** Избыточные пересчеты, отсутствие ленивой загрузки
3. **Архитектура:** Смешение логики и UI, отсутствие тестов

Рекомендуется начать с исправления критических уязвимостей (Фаза 1), затем перейти к оптимизации производительности (Фаза 2-3).

**Общее время на исправления:** 2-3 недели
**Приоритет:** 🔴 КРИТИЧЕСКИЙ для production
