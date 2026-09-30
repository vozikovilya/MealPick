# 📋 Правила и стандарты проекта MealPick

## 🎯 Обзор

Этот документ содержит правила и стандарты разработки для проекта MealPick. Все разработчики должны следовать этим правилам для обеспечения консистентности кода и качества продукта.

---

## 📁 Структура проекта

```
src/
├── components/          # React компоненты
│   ├── AuthScreen.tsx
│   ├── RecipeList.tsx
│   ├── AddRecipe.tsx
│   ├── SendRequest.tsx
│   ├── SwipeSelector.tsx
│   ├── Notifications.tsx
│   ├── ProfileScreen.tsx
│   └── ...
├── ui/                  # UI библиотека
│   └── index.tsx        # Все UI компоненты
├── services/            # API сервисы
│   └── api.ts           # API запросы к backend
├── hooks/               # Custom React hooks
│   └── useRealTimeNotifications.ts
├── utils/               # Утилиты
│   ├── security.ts      # Безопасность
│   └── debugStorage.ts  # Отладка
├── types.ts             # TypeScript типы
├── store.ts             # Zustand store
├── App.tsx              # Главный компонент
└── main.tsx             # Точка входа

backend/
├── api/                 # PHP API endpoints
│   ├── auth/
│   ├── user/
│   ├── family/
│   ├── recipes/
│   ├── notifications/
│   └── swipe/
├── config/              # Конфигурация
│   └── database.php
├── utils/               # PHP утилиты
│   └── jwt.php
└── database/            # SQL скрипты
    └── schema.sql
```

---

## 🎨 UI Компоненты

### Использование UI библиотеки

**Всегда используйте компоненты из UI библиотеки вместо создания своих:**

```tsx
// ✅ ПРАВИЛЬНО
import { Button, Card, Input, Badge } from '../ui';

<Button variant="primary" size="md">Сохранить</Button>
<Card variant="elevated" padding="md">...</Card>
<Input label="Email" type="email" />
<Badge variant="success">Активен</Badge>

// ❌ НЕПРАВИЛЬНО
<button className="px-4 py-2 bg-orange-500 text-white rounded-xl">
  Сохранить
</button>
<div className="bg-white rounded-2xl border border-gray-200 p-5">
  ...
</div>
```

### Доступные компоненты

| Компонент | Описание | Варианты |
|-----------|----------|----------|
| `Button` | Кнопка | primary, secondary, danger, ghost, success |
| `Card` | Карточка-контейнер | default, bordered, elevated, gradient |
| `Input` | Текстовое поле | default, filled, bordered |
| `TextArea` | Многострочное поле | - |
| `Badge` | Бейдж/метка | default, success, warning, danger, info |
| `Avatar` | Аватар пользователя | xs, sm, md, lg, xl |
| `Modal` | Модальное окно | sm, md, lg, full |
| `Alert` | Предупреждение | info, success, warning, error |
| `Divider` | Разделитель | horizontal, vertical |
| `Spinner` | Индикатор загрузки | sm, md, lg |
| `EmptyState` | Пустое состояние | - |
| `SectionHeader` | Заголовок секции | - |
| `Tooltip` | Подсказка | top, bottom, left, right |
| `Progress` | Прогресс-бар | default, success, warning, danger |
| `Tag` | Тег | default, primary, success, warning, danger |
| `Checkbox` | Чекбокс | - |

### Цветовая палитра

Используйте токены из UI библиотеки:

```tsx
import { colors } from '../ui';

// ✅ ПРАВИЛЬНО
const primaryColor = colors.primary[500]; // #f97316
const dangerColor = colors.danger[500];   // #ef4444

// ❌ НЕПРАВИЛЬНО
const color = '#f97316'; // Магические числа
```

**Основные цвета:**
- **Primary (оранжевый)**: `#f97316` - основные действия, брендинг
- **Secondary (фиолетовый)**: `#a855f7` - семья, специальные действия
- **Success (зелёный)**: `#22c55e` - успех, подтверждение
- **Danger (красный)**: `#ef4444` - ошибки, удаление
- **Warning (жёлтый)**: `#f59e0b` - предупреждения
- **Info (синий)**: `#3b82f6` - информация

---

## 🎭 Анимации

### Использование Framer Motion

**Всегда используйте анимации из UI библиотеки:**

```tsx
import { animations } from '../ui';
import { motion } from 'framer-motion';

// ✅ ПРАВИЛЬНО
<motion.div
  initial={animations.fadeIn.initial}
  animate={animations.fadeIn.animate}
  exit={animations.fadeIn.exit}
>
  ...
</motion.div>

// ✅ ПРАВИЛЬНО (spring анимация)
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={animations.spring}
>
  ...
</motion.div>

// ❌ НЕПРАВИЛЬНО
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }} // Магические числа
>
  ...
</motion.div>
```

### Доступные анимации

| Анимация | Описание | Использование |
|----------|----------|---------------|
| `animations.fast` | Быстрая (150ms) | Hover эффекты |
| `animations.normal` | Нормальная (300ms) | Появление элементов |
| `animations.slow` | Медленная (500ms) | Сложные переходы |
| `animations.spring` | Пружинная | Кнопки, бейджи |
| `animations.springBouncy` | Упругая пружина | Модальные окна |
| `animations.springSmooth` | Плавная пружина | Карточки |
| `animations.fadeIn` | Появление | Простые элементы |
| `animations.slideUp` | Выезд снизу | Списки |
| `animations.slideDown` | Выезд сверху | Dropdown |
| `animations.scaleIn` | Увеличение | Модалки, popup |

---

## 📏 Отступы и размеры

###Spacing (отступы)

Используйте токены из UI библиотеки:

```tsx
import { spacing } from '../ui';

// ✅ ПРАВИЛЬНО
<div style={{ padding: spacing[4] }}> // 16px
<div style={{ margin: spacing[2] }}>  // 8px

// ❌ НЕПРАВИЛЬНО
<div style={{ padding: '16px' }}> // Магические числа
```

**Стандартные отступы:**
- `spacing[1]` = 4px - мелкие отступы
- `spacing[2]` = 8px - между элементами
- `spacing[3]` = 12px - между группами
- `spacing[4]` = 16px - стандартный padding
- `spacing[6]` = 24px - между секциями
- `spacing[8]` = 32px - большие отступы

### Border Radius (скругления)

```tsx
import { borderRadius } from '../ui';

// ✅ ПРАВИЛЬНО
<div style={{ borderRadius: borderRadius.xl }}> // 16px

// ❌ НЕПРАВИЛЬНО
<div style={{ borderRadius: '16px' }}>
```

**Стандартные скругления:**
- `borderRadius.sm` = 6px - мелкие элементы
- `borderRadius.md` = 8px - кнопки, инпуты
- `borderRadius.lg` = 12px - карточки
- `borderRadius.xl` = 16px - большие карточки
- `borderRadius['2xl']` = 24px - модальные окна
- `borderRadius.full` = 9999px - круглые элементы

### Shadows (тени)

```tsx
import { shadows } from '../ui';

// ✅ ПРАВИЛЬНО
<div style={{ boxShadow: shadows.md }}>

// ❌ НЕПРАВИЛЬНО
<div style={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
```

**Стандартные тени:**
- `shadows.sm` - лёгкая тень (hover)
- `shadows.md` - средняя тень (карточки)
- `shadows.lg` - большая тень (модалки)
- `shadows.xl` - очень большая (dropdown)
- `shadows['2xl']` - максимальная (popup)

---

## 📝 Именование

### Компоненты

**Используйте PascalCase для компонентов:**

```tsx
// ✅ ПРАВИЛЬНО
const RecipeCard = () => { ... }
const UserProfile = () => { ... }
const NotificationBadge = () => { ... }

// ❌ НЕПРАВИЛЬНО
const recipeCard = () => { ... }
const user_profile = () => { ... }
```

### Файлы

**Используйте PascalCase для файлов компонентов:**

```
✅ ПРАВИЛЬНО:
- RecipeList.tsx
- AddRecipe.tsx
- ProfileScreen.tsx

❌ НЕПРАВИЛЬНО:
- recipe-list.tsx
- add_recipe.tsx
- profileScreen.tsx
```

### Переменные и функции

**Используйте camelCase:**

```tsx
// ✅ ПРАВИЛЬНО
const userName = 'Илья';
const handleDeleteRecipe = () => { ... };
const isLoading = false;

// ❌ НЕПРАВИЛЬНО
const user_name = 'Илья';
const HandleDeleteRecipe = () => { ... };
const is_loading = false;
```

### Константы

**Используйте UPPER_SNAKE_CASE для констант:**

```tsx
// ✅ ПРАВИЛЬНО
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const API_BASE_URL = 'http://q91929se.beget.tech/backend/api';
const JWT_EXPIRATION = 86400 * 7;

// ❌ НЕПРАВИЛЬНО
const maxFileSize = 5 * 1024 * 1024;
const apiBaseUrl = '...';
```

---

## 🎯 TypeScript

### Типы

**Всегда используйте TypeScript типы:**

```tsx
// ✅ ПРАВИЛЬНО
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

const user: User = { ... };

// ❌ НЕПРАВИЛЬНО
const user = { ... }; // Без типа
const user: any = { ... }; // Any тип
```

### Props

**Определяйте типы для props:**

```tsx
// ✅ ПРАВИЛЬНО
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, size, onClick, children }) => { ... }

// ❌ НЕПРАВИЛЬНО
const Button = ({ variant, size, onClick, children }: any) => { ... }
```

### Enum vs Union Types

**Используйте Union Types вместо Enum:**

```tsx
// ✅ ПРАВИЛЬНО
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

// ❌ НЕПРАВИЛЬНО
enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
}
```

---

## 🔄 State Management

### Zustand Store

**Используйте Zustand для глобального состояния:**

```tsx
// ✅ ПРАВИЛЬНО
import { useStore } from '../store';

const { currentUser, family, recipes } = useStore();

// ❌ НЕПРАВИЛЬНО
import { useStore } from '../store';

const store = useStore(); // Не деструктуризируем
const currentUser = store.currentUser;
```

### Локальное состояние

**Используйте useState для локального состояния:**

```tsx
// ✅ ПРАВИЛЬНО
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// ❌ НЕПРАВИЛЬНО
let isLoading = false; // Не реактивное
var error = null; // Не типизировано
```

---

## 🌐 API Запросы

### Использование API сервиса

**Всегда используйте API сервис для запросов:**

```tsx
// ✅ ПРАВИЛЬНО
import * as api from '../services/api';

const response = await api.getRecipes();
const recipes = response.data.recipes;

// ❌ НЕПРАВИЛЬНО
const response = await fetch('http://q91929se.beget.tech/backend/api/recipes/list.php');
const data = await response.json();
```

### Обработка ошибок

**Всегда обрабатывайте ошибки:**

```tsx
// ✅ ПРАВИЛЬНО
try {
  const response = await api.getRecipes();
  setRecipes(response.data.recipes);
} catch (error) {
  console.error('Ошибка загрузки рецептов:', error);
  setError('Не удалось загрузить рецепты');
}

// ❌ НЕПРАВИЛЬНО
const response = await api.getRecipes();
setRecipes(response.data.recipes); // Без обработки ошибок
```

---

## 🎨 Стилизация

### Tailwind CSS

**Используйте Tailwind CSS для стилей:**

```tsx
// ✅ ПРАВИЛЬНО
<div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-md">
  ...
</div>

// ❌ НЕПРАВИЛЬНО
<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
  ...
</div>
```

### Условные классы

**Используйте template literals для условных классов:**

```tsx
// ✅ ПРАВИЛЬНО
<div className={`
  p-4 rounded-xl
  ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}
  ${isDisabled && 'opacity-50 cursor-not-allowed'}
`}>
  ...
</div>

// ❌ НЕПРАВИЛЬНО
<div className={isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}>
  ...
</div>
```

---

## 📱 Адаптивность

### Mobile First

**Всегда проектируйте сначала для мобильных устройств:**

```tsx
// ✅ ПРАВИЛЬНО
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>

// ❌ НЕПРАВИЛЬНО
<div className="grid grid-cols-3 gap-4">
  ...
</div>
```

### Breakpoints

**Используйте стандартные breakpoints:**

- `sm`: 640px - маленькие планшеты
- `md`: 768px - планшеты
- `lg`: 1024px - маленькие ноутбуки
- `xl`: 1280px - ноутбуки
- `2xl`: 1536px - большие экраны

---

## ♿ Доступность (Accessibility)

### ARIA атрибуты

**Добавляйте ARIA атрибуты для интерактивных элементов:**

```tsx
// ✅ ПРАВИЛЬНО
<button
  aria-label="Закрыть модальное окно"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <XIcon />
</button>

<input
  aria-label="Email адрес"
  aria-required="true"
  aria-invalid={error ? 'true' : 'false'}
  type="email"
/>

// ❌ НЕПРАВИЛЬНО
<button onClick={handleClose}>
  <XIcon />
</button>
```

### Keyboard Navigation

**Обеспечьте навигацию с клавиатуры:**

```tsx
// ✅ ПРАВИЛЬНО
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  ...
</button>

// ❌ НЕПРАВИЛЬНО
<div onClick={handleClick}>
  ...
</div>
```

---

## ⚡ Производительность

### Мемоизация

**Используйте useMemo и useCallback для оптимизации:**

```tsx
// ✅ ПРАВИЛЬНО
const filteredRecipes = useMemo(() => {
  return recipes.filter(r => r.mealType === selectedType);
}, [recipes, selectedType]);

const handleDelete = useCallback((id: number) => {
  deleteRecipe(id);
}, [deleteRecipe]);

// ❌ НЕПРАВИЛЬНО
const filteredRecipes = recipes.filter(r => r.mealType === selectedType); // Пересчитывается каждый рендер

const handleDelete = (id: number) => {
  deleteRecipe(id);
}; // Создаётся каждый рендер
```

### Ленивая загрузка

**Используйте lazy loading для изображений:**

```tsx
// ✅ ПРАВИЛЬНО
<img
  src={imageUrl}
  alt={alt}
  loading="lazy"
/>

// ❌ НЕПРАВИЛЬНО
<img
  src={imageUrl}
  alt={alt}
/>
```

---

## 🧪 Тестирование

### Ручное тестирование

**Перед коммитом проверьте:**

1. ✅ Все функции работают корректно
2. ✅ Нет ошибок в консоли браузера
3. ✅ Адаптивность на мобильных устройствах
4. ✅ Доступность с клавиатуры
5. ✅ Производительность (нет лагов)

### Browser DevTools

**Используйте DevTools для отладки:**

- **Console** - проверка ошибок и логов
- **Network** - проверка API запросов
- **Performance** - анализ производительности
- **Lighthouse** - аудит качества

---

## 📦 Git

### Коммиты

**Используйте осмысленные сообщения коммитов:**

```bash
# ✅ ПРАВИЛЬНО
git commit -m "feat: добавить анимацию для счётчика уведомлений"
git commit -m "fix: исправить ошибку JSON.parse в SwipeRequestDetails"
git commit -m "refactor: оптимизировать загрузку рецептов"
git commit -m "docs: обновить README.md"
git commit -m "style: применить форматирование кода"

# ❌ НЕПРАВИЛЬНО
git commit -m "fix"
git commit -m "update"
git commit -m "123"
```

### Ветки

**Используйте понятные названия веток:**

```bash
# ✅ ПРАВИЛЬНО
git checkout -b feature/notification-counter
git checkout -b bugfix/json-parse-error
git checkout -b refactor/api-service
git checkout -b docs/readme-update

# ❌ НЕПРАВИЛЬНО
git checkout -b test
git checkout -b fix
git checkout -b new
```

---

## 📚 Документация

### Комментарии

**Добавляйте комментарии для сложной логики:**

```tsx
// ✅ ПРАВИЛЬНО
// Polling для уведомлений в реальном времени
// Проверяет новые уведомления каждые 5 секунд
useEffect(() => {
  const interval = setInterval(checkForNewNotifications, 5000);
  return () => clearInterval(interval);
}, []);

// ❌ НЕПРАВИЛЬНО
// Проверка
useEffect(() => {
  const interval = setInterval(checkForNewNotifications, 5000);
  return () => clearInterval(interval);
}, []);
```

### JSDoc

**Используйте JSDoc для функций:**

```tsx
/**
 * Загружает список рецептов из API
 * @param mealType - Тип блюда (опционально)
 * @returns Promise с массивом рецептов
 * @throws Error если запрос не удался
 */
const loadRecipes = async (mealType?: string): Promise<Recipe[]> => {
  const response = await api.getRecipes(mealType);
  return response.data.recipes;
};
```

---

## 🔒 Безопасность

### Валидация данных

**Всегда валидируйте данные на клиенте и сервере:**

```tsx
// ✅ ПРАВИЛЬНО
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

if (!validateEmail(email)) {
  setError('Неверный формат email');
  return;
}

// ❌ НЕПРАВИЛЬНО
// Отправляем данные без валидации
await api.register({ email, password });
```

### Санитизация ввода

**Используйте санитизацию для пользовательского ввода:**

```tsx
import { sanitizeInput } from '../utils/security';

// ✅ ПРАВИЛЬНО
const sanitizedName = sanitizeInput(name);
await api.updateProfile({ name: sanitizedName });

// ❌ НЕПРАВИЛЬНО
await api.updateProfile({ name }); // Без санитизации
```

---

## 🎯 Чек-лист перед коммитом

Перед каждым коммитом проверьте:

- [ ] Код соответствует правилам проекта
- [ ] Используются компоненты из UI библиотеки
- [ ] Нет магических чисел (используются токены)
- [ ] Все типы TypeScript определены
- [ ] Обработаны все ошибки
- [ ] Проверена адаптивность
- [ ] Проверена доступность
- [ ] Нет ошибок в консоли
- [ ] Код отформатирован
- [ ] Добавлены комментарии для сложной логики
- [ ] Сообщение коммита осмысленное

---

## 📞 Поддержка

Если у вас есть вопросы по правилам проекта:

1. Проверьте документацию в этом файле
2. Проверьте примеры в UI библиотеке (`src/ui/index.tsx`)
3. Проверьте существующие компоненты для примеров
4. Создайте issue в репозитории

---

**Версия:** 1.0  
**Дата обновления:** 2024  
**Статус:** ✅ Активно
