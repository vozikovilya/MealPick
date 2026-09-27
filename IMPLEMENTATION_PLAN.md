# План внедрения улучшений безопасности и оптимизации

## 📋 Краткая сводка аудита

### 🔴 Критические проблемы (требуют немедленного решения)
1. **Пароли в открытом виде** - `src/store.ts`
2. **Отсутствие валидации файлов** - `src/components/AddRecipe.tsx`
3. **XSS уязвимости** - все формы ввода

### 🟡 Важные проблемы
4. **Нет rate limiting** - `src/components/AuthScreen.tsx`
5. **Пересчет данных при каждом рендере** - `RecipeList.tsx`, `App.tsx`
6. **Отсутствие ленивой загрузки** - все компоненты с изображениями

### 🟢 Оптимизации
7. **Мемоизация вычислений** - использовать `useMemo` и `useCallback`
8. **Code splitting** - React.lazy для тяжелых компонентов
9. **Оптимизация размера бандла** - анализ и удаление неиспользуемого кода

---

## 🚀 Быстрый старт: Внедрение критических исправлений

### Шаг 1: Добавьте хэширование паролей

**Файл:** `src/store.ts`

```typescript
import { hashPassword, verifyPassword } from './utils/security';

// В функции register:
register: async (email, username, password, name) => {
  const { users } = get();
  
  // Проверка уникальности
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email уже используется' };
  }
  
  // Хэширование пароля
  const passwordHash = await hashPassword(password);
  
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    username,
    passwordHash, // Вместо password
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

// В функции login:
login: async (emailOrUsername, password) => {
  const { users } = get();
  const user = users.find(
    u => u.email === emailOrUsername || u.username === emailOrUsername
  );
  
  if (!user) {
    return { success: false, message: 'Пользователь не найден' };
  }
  
  // Проверка пароля
  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    return { success: false, message: 'Неверный пароль' };
  }
  
  set({ currentUserId: user.id });
  return { success: true, message: 'Вход выполнен!' };
},
```

**Обновите тип User в `src/types.ts`:**
```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string; // Было: password: string;
  name: string;
  avatar: string;
  description?: string;
  recipes: Recipe[];
  familyId?: string;
  isFamilyOwner?: boolean;
}
```

---

### Шаг 2: Добавьте валидацию файлов

**Файл:** `src/components/AddRecipe.tsx`

```typescript
import { validateFile, sanitizeInput } from '../utils/security';

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  Array.from(files).forEach((file) => {
    // Валидация файла
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (file.type.startsWith('video/')) {
        setVideoUrl(result);
      } else {
        setImageUrls((prev) => {
          const filtered = prev.filter((url) => url.trim());
          return [...filtered, result];
        });
      }
    };
    reader.readAsDataURL(file);
  });
};

// Санитизация всех полей формы
const handleSubmit = () => {
  if (!name.trim()) return;
  
  const sanitizedName = sanitizeInput(name);
  const sanitizedDescription = sanitizeInput(description);
  
  const validUrls = imageUrls.filter((url) => url.trim());
  addRecipe({
    name: sanitizedName,
    description: sanitizedDescription,
    imageUrls: validUrls.length > 0 ? validUrls : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'],
    videoUrl: videoUrl.trim() || undefined,
    ingredients,
    mealType,
    cookingSteps: cookingSteps.length > 0 ? cookingSteps : undefined,
    pairedRecipeIds: pairedRecipeIds.length > 0 ? pairedRecipeIds : undefined,
  });
  onDone();
};
```

---

### Шаг 3: Добавьте rate limiting

**Файл:** `src/components/AuthScreen.tsx`

```typescript
import { authRateLimiter, validateEmail } from '../utils/security';

export function AuthScreen({ onAuth }: Props) {
  const { login, register, users, currentUserId } = useStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Проверка rate limit
    const rateCheck = authRateLimiter.canAttempt(email || username);
    if (!rateCheck.allowed) {
      setError(rateCheck.message);
      return;
    }

    if (mode === 'login') {
      // Валидация email
      if (email && !validateEmail(email)) {
        setError('Некорректный формат email');
        return;
      }
      
      const result = login(email || username, password);
      
      if (result.success) {
        authRateLimiter.resetAttempts(email || username);
        onAuth();
      } else {
        authRateLimiter.recordAttempt(email || username);
        setError(result.message);
      }
    } else {
      if (!email || !username || !password || !name) {
        setError('Заполните все поля');
        return;
      }
      
      // Валидация email
      if (!validateEmail(email)) {
        setError('Некорректный формат email');
        return;
      }
      
      const result = register(email, username, password, name);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onAuth();
        }, 2000);
      } else {
        setError(result.message);
      }
    }
  };
  
  // ... остальной код
}
```

---

### Шаг 4: Оптимизируйте RecipeList

**Замените `src/components/RecipeList.tsx` на `src/components/RecipeList.optimized.tsx`:**

```bash
# В терминале:
mv src/components/RecipeList.optimized.tsx src/components/RecipeList.tsx
```

Основные изменения:
- Добавлен `useMemo` для группировки рецептов
- Добавлен `useCallback` для обработчиков событий
- Добавлен `loading="lazy"` для изображений

---

### Шаг 5: Оптимизируйте App.tsx

**Файл:** `src/App.tsx`

```typescript
import { useState, useEffect, useMemo } from 'react';

function App() {
  const [screen, setScreen] = useState<Screen>('recipes');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const { notifications, currentUserId, pendingNotification, setPendingNotification, users } = useStore();

  // Мемоизация подсчета непрочитанных
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && n.type === 'swipe_request').length;
  }, [notifications]);

  // Мемоизация текущего пользователя
  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId);
  }, [users, currentUserId]);

  // ... остальной код
}
```

---

## 📊 Метрики для отслеживания

После внедрения проверьте:

```bash
# Анализ размера бандла
npm run build
ls -lh dist/assets/*.js

# Lighthouse аудит
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

**Целевые показатели:**
- Размер JS бандла: < 200 KB (gzip)
- LCP (Largest Contentful Paint): < 2.5 сек
- FID (First Input Delay): < 100 мс
- CLS (Cumulative Layout Shift): < 0.1

---

## ✅ Чек-лист внедрения

### Критические исправления (День 1)
- [ ] Добавить хэширование паролей
- [ ] Добавить валидацию файлов
- [ ] Добавить санитизацию ввода
- [ ] Добавить rate limiting
- [ ] Обновить типы данных

### Оптимизация производительности (День 2-3)
- [ ] Заменить RecipeList на оптимизированную версию
- [ ] Добавить useMemo в App.tsx
- [ ] Добавить useMemo в SwipeSelector.tsx
- [ ] Добавить loading="lazy" для всех изображений
- [ ] Протестировать производительность

### Дополнительные улучшения (День 4-5)
- [ ] Добавить code splitting с React.lazy
- [ ] Оптимизировать изображения (WebP, сжатие)
- [ ] Добавить тесты для критических функций
- [ ] Настроить Content Security Policy
- [ ] Провести финальный security audit

---

## 🔐 Дополнительные рекомендации для production

1. **HTTPS обязательно**
   - Используйте Let's Encrypt для бесплатных SSL сертификатов
   - Настройте редирект с HTTP на HTTPS

2. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" content="
     default-src 'self';
     script-src 'self' 'unsafe-inline';
     style-src 'self' 'unsafe-inline';
     img-src 'self' data: https:;
     connect-src 'self' https:;
   ">
   ```

3. **Secure cookies** (если используете)
   ```typescript
   document.cookie = "session=abc123; Secure; HttpOnly; SameSite=Strict";
   ```

4. **Регулярные обновления**
   ```bash
   # Проверка уязвимостей
   npm audit
   
   # Автоматическое исправление
   npm audit fix
   ```

5. **Мониторинг**
   - Настройте Sentry для отслеживания ошибок
   - Используйте Google Analytics для метрик производительности
   - Настройте алерты при критических ошибках

---

## 📚 Полезные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Топ-10 уязвимостей веб-приложений
- [React Performance](https://react.dev/learn/render-and-commit) - Оптимизация React приложений
- [Web Vitals](https://web.dev/vitals/) - Метрики производительности веб-приложений
- [Security Headers](https://securityheaders.com/) - Проверка заголовков безопасности

---

## 🎯 Итоговый результат

После внедрения всех улучшений ваше приложение будет:

✅ **Безопасным:**
- Пароли хэшированы
- Защита от XSS атак
- Валидация всех входных данных
- Защита от brute force

✅ **Быстрым:**
- Оптимизированные пересчеты
- Ленивая загрузка изображений
- Мемоизация компонентов
- Малый размер бандла

✅ **Надежным:**
- Обработка ошибок
- Валидация данных
- Rate limiting
- Безопасное хранение данных

**Время на внедрение:** 2-3 дня
**Приоритет:** 🔴 КРИТИЧЕСКИЙ для production
