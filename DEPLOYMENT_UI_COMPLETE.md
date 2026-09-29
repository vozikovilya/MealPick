# 🚀 Развёртывание UI библиотеки и демо-страницы

## ✅ Что создано

1. **UI библиотека** (`src/ui/index.tsx`) - 16 компонентов
2. **Правила проекта** (`PROJECT_RULES.md`) - стандарты разработки
3. **Документация** - 4 файла с подробными инструкциями
4. **Демо-страница React** (`src/components/UIDemo.tsx`) - интерактивная демонстрация
5. **Демо-страница HTML** (`public/ui-demo.html`) - автономная демонстрация

---

## 📤 Загрузка файлов на сервер

### Шаг 1: Frontend файлы

```bash
# Загрузите из dist/ в public_html/:
- index.html
- assets/index-D0FWe_TI.css
- assets/index-4bl8pR7b.js
```

**Инструкция:**
1. Откройте файловый менеджер Beget
2. Перейдите в `public_html/`
3. Удалите старые файлы из `assets/`
4. Загрузите новые файлы из `dist/assets/`
5. Замените `public_html/index.html`

### Шаг 2: Демо-страница HTML

```bash
# Загрузите из public/ в public_html/:
- ui-demo.html
```

**Инструкция:**
1. Откройте файловый менеджер Beget
2. Перейдите в `public_html/`
3. Загрузите файл `public/ui-demo.html`

### Шаг 3: Очистка кэша

```bash
# В браузере:
Ctrl + Shift + R  # Жёсткая перезагрузка
```

---

## 🧪 Тестирование

### Тест 1: Демо-страница в приложении

1. Откройте `http://q91929se.beget.tech/`
2. Войдите в аккаунт
3. Нажмите на кнопку палитры 🎨 в хедере (справа от колокольчика)
4. ✅ Должна открыться демо-страница UI библиотеки
5. ✅ Все 16 компонентов отображаются
6. ✅ Интерактивные примеры работают

### Тест 2: Автономная HTML страница

1. Откройте `http://q91929se.beget.tech/ui-demo.html`
2. ✅ Страница загружается без ошибок
3. ✅ Все компоненты отображаются
4. ✅ CSS стили применяются корректно
5. ✅ Чекбоксы интерактивны

### Тест 3: Использование UI компонентов

Откройте консоль браузера (F12) и выполните:

```javascript
// Проверьте, что UI библиотека загружена
import { Button, Card } from '../ui';
console.log(Button, Card);
```

✅ Компоненты импортируются без ошибок

---

## 📚 Документация

### Файлы для изучения:

1. **`UI_LIBRARY_COMPLETE.md`** - финальный отчёт
   - Статистика
   - Преимущества
   - Примеры использования

2. **`PROJECT_RULES.md`** - правила проекта
   - Структура файлов
   - Именование
   - TypeScript
   - State Management
   - Стилизация
   - Доступность
   - Производительность

3. **`UI_LIBRARY_GUIDE.md`** - руководство по UI
   - Все 16 компонентов
   - Props и варианты
   - Примеры использования
   - Токены дизайн-системы
   - Анимации

4. **`DEPLOYMENT_UI_LIBRARY.md`** - развёртывание
   - Загрузка файлов
   - Тестирование
   - Решение проблем

---

## 🎯 Как использовать UI библиотеку

### 1. Импортируйте компоненты

```tsx
import { Button, Card, Input, Badge, Avatar } from '../ui';
```

### 2. Используйте в компонентах

```tsx
function MyComponent() {
  return (
    <Card variant="elevated" padding="md">
      <Avatar emoji="👨‍🍳" size="lg" />
      <h2>Привет!</h2>
      <Input label="Email" type="email" />
      <Button variant="primary">Сохранить</Button>
    </Card>
  );
}
```

### 3. Используйте токены дизайн-системы

```tsx
import { colors, spacing, animations } from '../ui';

<div style={{ 
  color: colors.primary[500],
  padding: spacing[4]
}}>
  ...
</div>
```

---

## 📊 Компоненты UI библиотеки

| Компонент | Описание | Варианты |
|-----------|----------|----------|
| **Button** | Кнопка | primary, secondary, danger, ghost, success |
| **Card** | Карточка | default, bordered, elevated, gradient |
| **Input** | Текстовое поле | default, filled, bordered |
| **TextArea** | Многострочное поле | - |
| **Badge** | Бейдж | default, success, warning, danger, info |
| **Avatar** | Аватар | xs, sm, md, lg, xl + статусы |
| **Modal** | Модальное окно | sm, md, lg, full |
| **Alert** | Предупреждение | info, success, warning, error |
| **Divider** | Разделитель | horizontal, vertical |
| **Spinner** | Индикатор загрузки | sm, md, lg |
| **EmptyState** | Пустое состояние | - |
| **SectionHeader** | Заголовок секции | - |
| **Tooltip** | Подсказка | top, bottom, left, right |
| **Progress** | Прогресс-бар | default, success, warning, danger |
| **Tag** | Тег | default, primary, success, warning, danger |
| **Checkbox** | Чекбокс | - |

---

## 🎨 Дизайн-система

### Цветовая палитра

```tsx
import { colors } from '../ui';

colors.primary[500]   // #f97316 - оранжевый
colors.secondary[500] // #a855f7 - фиолетовый
colors.success[500]   // #22c55e - зелёный
colors.danger[500]    // #ef4444 - красный
colors.warning[500]   // #f59e0b - жёлтый
colors.info[500]      // #3b82f6 - синий
```

### Отступы

```tsx
import { spacing } from '../ui';

spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px
spacing[6]  // 24px
spacing[8]  // 32px
```

### Скругления

```tsx
import { borderRadius } from '../ui';

borderRadius.sm    // 6px
borderRadius.md    // 8px
borderRadius.lg    // 12px
borderRadius.xl    // 16px
borderRadius['2xl'] // 24px
borderRadius.full  // 9999px
```

### Тени

```tsx
import { shadows } from '../ui';

shadows.sm   // Лёгкая тень
shadows.md   // Средняя тень
shadows.lg   // Большая тень
shadows.xl   // Очень большая
shadows['2xl'] // Максимальная
```

### Анимации

```tsx
import { animations } from '../ui';

animations.fast     // 150ms
animations.normal   // 300ms
animations.slow     // 500ms
animations.spring   // Пружинная
animations.fadeIn   // Появление
animations.slideUp  // Выезд снизу
```

---

## 🐛 Решение проблем

### Проблема 1: Демо-страница не открывается

**Симптом:** Кнопка палитры не работает

**Решение:**
1. Убедитесь, что загружены новые файлы из `dist/`
2. Очистите кэш браузера (Ctrl+Shift+R)
3. Проверьте консоль на наличие ошибок

### Проблема 2: HTML демо-страница не загружается

**Симптом:** 404 ошибка при открытии `ui-demo.html`

**Решение:**
1. Убедитесь, что файл загружен в `public_html/`
2. Проверьте права доступа к файлу (644)
3. Проверьте URL: `http://q91929se.beget.tech/ui-demo.html`

### Проблема 3: Компоненты не импортируются

**Симптом:** Ошибка "Cannot find module '../ui'"

**Решение:**
1. Убедитесь, что файл `src/ui/index.tsx` существует
2. Проверьте путь импорта
3. Перезапустите dev сервер

---

## ✅ Чек-лист перед развёртыванием

- [ ] Файл `src/ui/index.tsx` создан
- [ ] Файл `src/components/UIDemo.tsx` создан
- [ ] Файл `public/ui-demo.html` создан
- [ ] Проект собирается без ошибок
- [ ] Демо-страница открывается в приложении
- [ ] HTML демо-страница открывается напрямую
- [ ] Все компоненты отображаются корректно
- [ ] Документация создана

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте документацию:
   - `UI_LIBRARY_COMPLETE.md`
   - `PROJECT_RULES.md`
   - `UI_LIBRARY_GUIDE.md`

2. Проверьте консоль браузера (F12)

3. Проверьте логи ошибок PHP на сервере

---

**Дата развёртывания:** 2024  
**Версия:** 1.0  
**Статус:** ✅ Готово к развёртыванию

**Загрузите файлы на сервер и протестируйте!** 🚀
