# 🎨 UI Библиотека MealPick - Руководство по использованию

## 📖 Введение

UI библиотека MealPick содержит переиспользуемые компоненты, которые обеспечивают консистентный дизайн и ускоряют разработку. Все компоненты следуют единому дизайн-системе и используют токены (цвета, отступы, анимации).

---

## 🚀 Быстрый старт

### Импорт компонентов

```tsx
import { 
  Button, 
  Card, 
  Input, 
  Badge, 
  Avatar,
  Modal,
  Alert,
  colors,
  animations 
} from '../ui';
```

### Базовый пример

```tsx
function MyComponent() {
  return (
    <Card variant="elevated" padding="md">
      <Avatar emoji="👨‍🍳" size="lg" />
      <h2 className="text-xl font-bold mt-4">Привет, Илья!</h2>
      <p className="text-gray-600 mt-2">Добро пожаловать в MealPick</p>
      <Button variant="primary" className="mt-4">
        Начать готовить
      </Button>
    </Card>
  );
}
```

---

## 📦 Компоненты

### Button

Кнопка с различными вариантами стилей и размеров.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' (по умолчанию: 'primary')
- `size`: 'sm' | 'md' | 'lg' (по умолчанию: 'md')
- `loading`: boolean (по умолчанию: false)
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right' (по умолчанию: 'left')
- `fullWidth`: boolean (по умолчанию: false)

**Примеры:**

```tsx
// Основная кнопка
<Button variant="primary">Сохранить</Button>

// Кнопка с иконкой
<Button variant="primary" icon={<PlusIcon />}>
  Добавить блюдо
</Button>

// Кнопка в состоянии загрузки
<Button variant="primary" loading>
  Загрузка...
</Button>

// Опасная кнопка
<Button variant="danger">Удалить</Button>

// Полноширинная кнопка
<Button variant="primary" fullWidth>
  Войти
</Button>

// Маленькая кнопка
<Button variant="secondary" size="sm">
  Отмена
</Button>
```

---

### Card

Карточка-контейнер для группировки контента.

**Props:**
- `variant`: 'default' | 'bordered' | 'elevated' | 'gradient' (по умолчанию: 'default')
- `padding`: 'none' | 'sm' | 'md' | 'lg' (по умолчанию: 'md')
- `onClick`: () => void (опционально)

**Примеры:**

```tsx
// Базовая карточка
<Card>
  <h3>Заголовок</h3>
  <p>Содержимое карточки</p>
</Card>

// Карточка с тенью
<Card variant="elevated">
  <h3>Заголовок</h3>
  <p>Содержимое карточки</p>
</Card>

// Карточка с градиентом
<Card variant="gradient">
  <h3>Специальное предложение</h3>
  <p>Попробуйте новые рецепты!</p>
</Card>

// Интерактивная карточка
<Card 
  variant="elevated" 
  onClick={() => navigate('/recipe/123')}
>
  <h3>Кликабельная карточка</h3>
  <p>Нажмите, чтобы открыть</p>
</Card>
```

---

### Input

Текстовое поле ввода с валидацией.

**Props:**
- `variant`: 'default' | 'filled' | 'bordered' (по умолчанию: 'default')
- `size`: 'sm' | 'md' | 'lg' (по умолчанию: 'md')
- `label`: string
- `error`: string
- `icon`: ReactNode

**Примеры:**

```tsx
// Базовое поле ввода
<Input 
  type="text" 
  placeholder="Введите имя"
/>

// Поле с лейблом
<Input 
  label="Email"
  type="email"
  placeholder="your@email.com"
/>

// Поле с ошибкой
<Input 
  label="Пароль"
  type="password"
  error="Пароль должен быть минимум 6 символов"
/>

// Поле с иконкой
<Input 
  label="Поиск"
  icon={<SearchIcon />}
  placeholder="Найти блюдо..."
/>

// Заполненное поле
<Input 
  variant="filled"
  placeholder="Заполненное поле"
/>
```

---

### TextArea

Многострочное текстовое поле.

**Props:**
- `label`: string
- `error`: string
- `rows`: number (по умолчанию: 3)

**Примеры:**

```tsx
// Базовое текстовое поле
<TextArea 
  placeholder="Описание блюда..."
/>

// Поле с лейблом
<TextArea 
  label="Описание"
  placeholder="Расскажите о блюде"
  rows={5}
/>

// Поле с ошибкой
<TextArea 
  label="Комментарий"
  error="Комментарий слишком короткий"
/>
```

---

### Badge

Бейдж для отображения статуса или количества.

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info' (по умолчанию: 'default')
- `size`: 'sm' | 'md' | 'lg' (по умолчанию: 'md')
- `animated`: boolean (по умолчанию: false)

**Примеры:**

```tsx
// Базовый бейдж
<Badge>Новое</Badge>

// Бейдж успеха
<Badge variant="success">Активен</Badge>

// Бейдж предупреждения
<Badge variant="warning">В процессе</Badge>

// Бейдж опасности
<Badge variant="danger">Удалено</Badge>

// Бейдж информации
<Badge variant="info">Информация</Badge>

// Анимированный бейдж
<Badge variant="danger" animated>
  3
</Badge>

// Маленький бейдж
<Badge size="sm">Маленький</Badge>
```

---

### Avatar

Аватар пользователя с эмодзи или изображением.

**Props:**
- `emoji`: string (эмодзи)
- `src`: string (URL изображения)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (по умолчанию: 'md')
- `status`: 'online' | 'offline' | 'busy'

**Примеры:**

```tsx
// Аватар с эмодзи
<Avatar emoji="👨‍🍳" />

// Аватар с изображением
<Avatar src="https://example.com/avatar.jpg" />

// Разные размеры
<Avatar emoji="👨‍🍳" size="xs" />
<Avatar emoji="👨‍🍳" size="sm" />
<Avatar emoji="👨‍🍳" size="md" />
<Avatar emoji="👨‍🍳" size="lg" />
<Avatar emoji="👨‍🍳" size="xl" />

// Аватар со статусом
<Avatar emoji="👨‍🍳" status="online" />
<Avatar emoji="👨‍🍳" status="offline" />
<Avatar emoji="👨‍🍳" status="busy" />
```

---

### Modal

Модальное окно для диалогов и форм.

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'full' (по умолчанию: 'md')
- `showCloseButton`: boolean (по умолчанию: true)

**Примеры:**

```tsx
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Открыть модальное окно
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Подтверждение"
      >
        <p>Вы уверены, что хотите удалить это блюдо?</p>
        <div className="flex gap-3 mt-4">
          <Button 
            variant="secondary" 
            onClick={() => setIsOpen(false)}
          >
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

---

### Alert

Предупреждение для отображения важных сообщений.

**Props:**
- `variant`: 'info' | 'success' | 'warning' | 'error' (по умолчанию: 'info')
- `title`: string
- `icon`: ReactNode

**Примеры:**

```tsx
// Информационное сообщение
<Alert variant="info" title="Информация">
  Это информационное сообщение
</Alert>

// Успешное сообщение
<Alert variant="success" title="Успех!">
  Блюдо успешно сохранено
</Alert>

// Предупреждение
<Alert variant="warning" title="Внимание!">
  Вы не заполнили все поля
</Alert>

// Ошибка
<Alert variant="error" title="Ошибка!">
  Не удалось сохранить данные
</Alert>

// С иконкой
<Alert 
  variant="success" 
  title="Готово!"
  icon={<CheckIcon />}
>
  Операция завершена успешно
</Alert>
```

---

### Divider

Разделитель для визуального разделения контента.

**Props:**
- `orientation`: 'horizontal' | 'vertical' (по умолчанию: 'horizontal')
- `label`: string (опционально)

**Примеры:**

```tsx
// Горизонтальный разделитель
<Divider />

// Разделитель с текстом
<Divider label="или" />

// Вертикальный разделитель
<div className="flex">
  <div>Левая часть</div>
  <Divider orientation="vertical" />
  <div>Правая часть</div>
</div>
```

---

### Spinner

Индикатор загрузки.

**Props:**
- `size`: 'sm' | 'md' | 'lg' (по умолчанию: 'md')

**Примеры:**

```tsx
// Маленький спиннер
<Spinner size="sm" />

// Средний спиннер
<Spinner size="md" />

// Большой спиннер
<Spinner size="lg" />

// Спиннер с текстом
<div className="flex items-center gap-3">
  <Spinner size="sm" />
  <span>Загрузка...</span>
</div>
```

---

### EmptyState

Компонент для отображения пустого состояния.

**Props:**
- `icon`: ReactNode
- `title`: string
- `description`: string
- `action`: ReactNode

**Примеры:**

```tsx
// Пустое состояние
<EmptyState
  icon={<InboxIcon className="w-10 h-10 text-gray-300" />}
  title="Нет уведомлений"
  description="Когда вам придут запросы, они появятся здесь"
/>

// С действием
<EmptyState
  icon={<RecipeIcon className="w-10 h-10 text-gray-300" />}
  title="Нет блюд"
  description="Добавьте свои любимые блюда"
  action={
    <Button variant="primary">
      Добавить первое блюдо
    </Button>
  }
/>
```

---

### SectionHeader

Заголовок секции с иконкой и действием.

**Props:**
- `icon`: ReactNode
- `title`: string
- `subtitle`: string
- `action`: ReactNode

**Примеры:**

```tsx
// Базовый заголовок секции
<SectionHeader
  icon={<UtensilsIcon className="w-4 h-4 text-orange-600" />}
  title="Мои блюда"
/>

// С подзаголовком
<SectionHeader
  icon={<FamilyIcon className="w-4 h-4 text-purple-600" />}
  title="Семья"
  subtitle="Управление семейным профилем"
/>

// С действием
<SectionHeader
  icon={<RecipeIcon className="w-4 h-4 text-orange-600" />}
  title="Рецепты"
  subtitle="12 блюд"
  action={
    <Button variant="ghost" size="sm">
      Добавить
    </Button>
  }
/>
```

---

### Tooltip

Подсказка при наведении.

**Props:**
- `content`: string
- `position`: 'top' | 'bottom' | 'left' | 'right' (по умолчанию: 'top')

**Примеры:**

```tsx
// Подсказка сверху
<Tooltip content="Удалить блюдо" position="top">
  <Button variant="danger">
    <TrashIcon />
  </Button>
</Tooltip>

// Подсказка снизу
<Tooltip content="Редактировать" position="bottom">
  <Button variant="secondary">
    <EditIcon />
  </Button>
</Tooltip>

// Подсказка слева
<Tooltip content="Назад" position="left">
  <Button>
    <ArrowLeftIcon />
  </Button>
</Tooltip>
```

---

### Progress

Прогресс-бар.

**Props:**
- `value`: number (0-100)
- `variant`: 'default' | 'success' | 'warning' | 'danger' (по умолчанию: 'default')
- `size`: 'sm' | 'md' | 'lg' (по умолчанию: 'md')
- `showLabel`: boolean (по умолчанию: false)

**Примеры:**

```tsx
// Базовый прогресс-бар
<Progress value={75} />

// С лейблом
<Progress value={75} showLabel />

// Успешный прогресс
<Progress value={100} variant="success" />

// Предупреждение
<Progress value={50} variant="warning" />

// Опасность
<Progress value={25} variant="danger" />

// Маленький прогресс-бар
<Progress value={75} size="sm" />
```

---

### Tag

Тег для категоризации.

**Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' (по умолчанию: 'default')
- `removable`: boolean (по умолчанию: false)
- `onRemove`: () => void

**Примеры:**

```tsx
// Базовый тег
<Tag>Завтрак</Tag>

// Тег с цветом
<Tag variant="primary">Обед</Tag>
<Tag variant="success">Готово</Tag>
<Tag variant="warning">В процессе</Tag>
<Tag variant="danger">Удалено</Tag>

// Удаляемый тег
<Tag 
  variant="primary" 
  removable 
  onRemove={() => removeTag('breakfast')}
>
  Завтрак
</Tag>
```

---

### Checkbox

Чекбокс с анимацией.

**Props:**
- `checked`: boolean
- `onChange`: (checked: boolean) => void
- `label`: string
- `disabled`: boolean

**Примеры:**

```tsx
// Базовый чекбокс
<Checkbox 
  checked={isChecked}
  onChange={setIsChecked}
/>

// С лейблом
<Checkbox 
  checked={rememberMe}
  onChange={setRememberMe}
  label="Запомнить меня"
/>

// Отключённый чекбокс
<Checkbox 
  checked={false}
  onChange={() => {}}
  label="Недоступно"
  disabled
/>
```

---

## 🎨 Токены дизайн-системы

### Цвета

```tsx
import { colors } from '../ui';

// Основные цвета
const primary = colors.primary[500]; // #f97316
const secondary = colors.secondary[500]; // #a855f7
const success = colors.success[500]; // #22c55e
const danger = colors.danger[500]; // #ef4444
const warning = colors.warning[500]; // #f59e0b
const info = colors.info[500]; // #3b82f6

// Использование в компонентах
<div style={{ color: colors.primary[500] }}>
  Оранжевый текст
</div>
```

### Отступы

```tsx
import { spacing } from '../ui';

// Стандартные отступы
<div style={{ padding: spacing[4] }}> // 16px
<div style={{ margin: spacing[2] }}>  // 8px
<div style={{ gap: spacing[3] }}>     // 12px
```

### Скругления

```tsx
import { borderRadius } from '../ui';

// Стандартные скругления
<div style={{ borderRadius: borderRadius.md }}> // 8px
<div style={{ borderRadius: borderRadius.xl }}> // 16px
<div style={{ borderRadius: borderRadius.full }}> // 9999px
```

### Тени

```tsx
import { shadows } from '../ui';

// Стандартные тени
<div style={{ boxShadow: shadows.sm }}> // Лёгкая тень
<div style={{ boxShadow: shadows.md }}> // Средняя тень
<div style={{ boxShadow: shadows.lg }}> // Большая тень
```

---

## 🎭 Анимации

### Использование анимаций

```tsx
import { animations } from '../ui';
import { motion } from 'framer-motion';

// Появление
<motion.div
  initial={animations.fadeIn.initial}
  animate={animations.fadeIn.animate}
  exit={animations.fadeIn.exit}
>
  Контент
</motion.div>

// Выезд снизу
<motion.div
  initial={animations.slideUp.initial}
  animate={animations.slideUp.animate}
  exit={animations.slideUp.exit}
>
  Контент
</motion.div>

// Пружинная анимация
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={animations.spring}
>
  Контент
</motion.div>
```

### Доступные анимации

- `animations.fast` - быстрая (150ms)
- `animations.normal` - нормальная (300ms)
- `animations.slow` - медленная (500ms)
- `animations.spring` - пружинная
- `animations.springBouncy` - упругая пружина
- `animations.springSmooth` - плавная пружина
- `animations.fadeIn` - появление
- `animations.slideUp` - выезд снизу
- `animations.slideDown` - выезд сверху
- `animations.scaleIn` - увеличение

---

## 📝 Лучшие практики

### 1. Используйте UI компоненты вместо кастомных

```tsx
// ✅ ПРАВИЛЬНО
<Button variant="primary">Сохранить</Button>

// ❌ НЕПРАВИЛЬНО
<button className="px-4 py-2 bg-orange-500 text-white rounded-xl">
  Сохранить
</button>
```

### 2. Используйте токены вместо магических чисел

```tsx
// ✅ ПРАВИЛЬНО
import { colors, spacing } from '../ui';

<div style={{ 
  color: colors.primary[500],
  padding: spacing[4]
}}>

// ❌ НЕПРАВИЛЬНО
<div style={{ 
  color: '#f97316',
  padding: '16px'
}}>
```

### 3. Комбинируйте компоненты

```tsx
// ✅ ПРАВИЛЬНО
<Card variant="elevated" padding="md">
  <SectionHeader 
    icon={<RecipeIcon />}
    title="Мои блюда"
    subtitle="12 рецептов"
  />
  <Divider />
  <div className="space-y-3">
    {recipes.map(recipe => (
      <RecipeCard key={recipe.id} recipe={recipe} />
    ))}
  </div>
  {recipes.length === 0 && (
    <EmptyState
      icon={<InboxIcon />}
      title="Нет блюд"
      description="Добавьте первое блюдо"
    />
  )}
</Card>
```

### 4. Используйте правильные варианты

```tsx
// ✅ ПРАВИЛЬНО
<Button variant="primary">Сохранить</Button>
<Button variant="secondary">Отмена</Button>
<Button variant="danger">Удалить</Button>

// ❌ НЕПРАВИЛЬНО
<Button variant="primary">Удалить</Button>
<Button variant="danger">Сохранить</Button>
```

---

## 🎯 Примеры использования

### Форма входа

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.login({ email, password });
      // Успешный вход
    } catch (err) {
      setError('Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />

        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth
          loading={isLoading}
        >
          Войти
        </Button>
      </form>
    </Card>
  );
}
```

### Список рецептов

```tsx
function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await api.getRecipes();
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <EmptyState
        icon={<RecipeIcon className="w-10 h-10 text-gray-300" />}
        title="Нет блюд"
        description="Добавьте свои любимые блюда"
        action={
          <Button variant="primary">
            Добавить первое блюдо
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {recipes.map(recipe => (
        <Card key={recipe.id} variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <Avatar emoji="🍽️" size="md" />
            <div className="flex-1">
              <h3 className="font-semibold">{recipe.name}</h3>
              <p className="text-sm text-gray-600">{recipe.description}</p>
            </div>
            <Badge variant="primary">
              {recipe.mealType}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### Модальное окно подтверждения

```tsx
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Подтверждение удаления"
      size="sm"
    >
      <Alert variant="warning">
        Вы уверены, что хотите удалить это блюдо? Это действие нельзя отменить.
      </Alert>
      
      <div className="flex gap-3 mt-4">
        <Button 
          variant="secondary" 
          fullWidth
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button 
          variant="danger" 
          fullWidth
          onClick={onConfirm}
        >
          Удалить
        </Button>
      </div>
    </Modal>
  );
}
```

---

## 📚 Дополнительные ресурсы

- **PROJECT_RULES.md** - правила и стандарты проекта
- **src/ui/index.tsx** - исходный код UI библиотеки
- **Framer Motion** - документация по анимациям: https://www.framer.com/motion/
- **Tailwind CSS** - документация по стилям: https://tailwindcss.com/docs

---

**Версия:** 1.0  
**Дата обновления:** 2024  
**Статус:** ✅ Активно
