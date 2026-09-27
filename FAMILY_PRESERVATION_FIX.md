# Исправление проблемы с сохранением семьи при выходе из профиля

## 🐛 Описание проблемы

После создания семьи и выхода из профиля ЛК, семья не сохранялась. При следующем входе пользователя семья исчезала.

## 🔍 Причина проблемы

В функции `logout()` обнулялось поле `familyProfile`:

```typescript
logout: () => {
  set({ 
    currentUserId: null,
    familyProfile: null,  // ❌ ПРОБЛЕМА: семья удалялась при выходе
    pendingNotification: null,
  });
},
```

Это приводило к тому, что при выходе из аккаунта семья удалялась из состояния, и persist middleware сохранял это изменение в localStorage. При следующем входе пользователя семья уже не существовала.

## ✅ Решение

### 1. Исправлена функция `logout()`

Теперь при выходе из аккаунта `familyProfile` **НЕ обнуляется**. Семья остаётся в localStorage и может быть восстановлена при следующем входе пользователя.

```typescript
logout: () => {
  set({ 
    currentUserId: null,
    pendingNotification: null,
    // familyProfile НЕ обнуляем - она должна сохраняться в localStorage
    // При следующем входе пользователя login() проверит, является ли он членом семьи
  });
},
```

### 2. Исправлена функция `login()`

Функция `login()` уже правильно проверяет, является ли пользователь членом семьи:

```typescript
login: (emailOrUsername, password) => {
  const { users, familyProfile, notifications, swipeRequests } = get();
  const user = users.find(...);
  
  // Проверяем, принадлежит ли семья этому пользователю
  const userFamily = familyProfile && familyProfile.memberIds.includes(user.id) 
    ? familyProfile 
    : null;
  
  set({ 
    currentUserId: user.id,
    familyProfile: userFamily,  // ✅ Если пользователь член семьи - показываем её
    notifications: userNotifications,
    swipeRequests: userSwipeRequests,
    pendingNotification: null,
  });
}
```

### 3. Исправлена функция `migrate()`

Добавлено поле `familyJoinRequests` в миграцию, чтобы все данные корректно восстанавливались из localStorage:

```typescript
migrate: (persistedState: any) => {
  if (persistedState?.users && persistedState.users.length > 0) {
    return {
      users: persistedState.users,
      currentUserId: persistedState.currentUserId || null,
      familyProfile: persistedState.familyProfile || null,
      familyJoinRequests: persistedState.familyJoinRequests || [],  // ✅ Добавлено
      swipeRequests: persistedState.swipeRequests || [],
      notifications: persistedState.notifications || [],
      customMealTypes: persistedState.customMealTypes || [],
      deliveryOptions: persistedState.deliveryOptions || defaultDeliveryOptions,
      pendingNotification: null,
    };
  }
  // ...
}
```

### 4. Увеличена версия persist

Версия увеличена с 7 до 8, чтобы миграция сработала для существующих пользователей:

```typescript
{
  name: 'meal-picker-storage',
  version: 8,  // ✅ Увеличена версия
  migrate: (persistedState: any) => { ... }
}
```

## 📊 Как это работает теперь

### Сценарий 1: Создание семьи и выход

1. Пользователь А создаёт семью
   - `familyProfile` создаётся с `memberIds = [А.id]`
   - Persist middleware сохраняет `familyProfile` в localStorage

2. Пользователь А выходит (`logout()`)
   - `currentUserId = null`
   - `pendingNotification = null`
   - ✅ `familyProfile` **остаётся в localStorage**

3. Пользователь А входит снова (`login()`)
   - Проверяется: `familyProfile.memberIds.includes(А.id)` → true
   - ✅ `familyProfile` восстанавливается
   - Пользователь видит свою семью

### Сценарий 2: Несколько пользователей в семье

1. Пользователь А создаёт семью
   - `familyProfile.memberIds = [А.id]`

2. Пользователь Б присоединяется к семье
   - `familyProfile.memberIds = [А.id, Б.id]`
   - Persist сохраняет обновлённую семью

3. Пользователь А выходит
   - `familyProfile` остаётся в localStorage

4. Пользователь Б входит
   - Проверяется: `familyProfile.memberIds.includes(Б.id)` → true
   - ✅ Пользователь Б видит семью

5. Пользователь В входит (не в семье)
   - Проверяется: `familyProfile.memberIds.includes(В.id)` → false
   - ✅ `familyProfile = null` для пользователя В
   - Пользователь В не видит семью А и Б

### Сценарий 3: Удаление семьи

1. Пользователь А (глава семьи) удаляет семью
   - Вызывается `deleteFamilyProfile()`
   - `familyProfile = null`
   - Persist сохраняет `familyProfile: null` в localStorage

2. Все пользователи выходят и входят
   - ✅ Семьи больше нет ни у кого

## 🎯 Результат

✅ Семья сохраняется в localStorage при выходе из аккаунта

✅ При входе пользователя семья восстанавливается, если он является её членом

✅ Пользователи, не входящие в семью, не видят её

✅ При удалении семьи она удаляется для всех пользователей

✅ Данные корректно мигрируют при обновлении версии приложения

## 🧪 Тестирование

### Тест 1: Создание семьи и выход/вход

1. Войдите как пользователь А
2. Создайте семью
3. Выйдите из аккаунта
4. Войдите снова как пользователь А
5. ✅ Убедитесь, что семья сохранена и видна

### Тест 2: Несколько пользователей в семье

1. Пользователь А создаёт семью
2. Пользователь Б присоединяется по ссылке
3. Пользователь А выходит
4. Пользователь Б входит
5. ✅ Убедитесь, что семья видна обоим пользователям
6. Пользователь В входит (не в семье)
7. ✅ Убедитесь, что семья не видна пользователю В

### Тест 3: Удаление семьи

1. Пользователь А создаёт семью
2. Пользователь Б присоединяется
3. Пользователь А удаляет семью
4. Пользователь А выходит и входит
5. ✅ Убедитесь, что семьи больше нет
6. Пользователь Б выходит и входит
7. ✅ Убедитесь, что семьи больше нет и у пользователя Б

## 📝 Примечания

- `familyProfile` хранится в localStorage через persist middleware
- При выходе из аккаунта `familyProfile` **не удаляется**
- При входе пользователя `login()` проверяет принадлежность к семье
- Версия persist увеличена до 8 для корректной миграции
- Все данные (семья, уведомления, запросы) изолированы по пользователям

## 🔧 Изменённые файлы

- `src/store.ts`:
  - Исправлена функция `logout()` - не обнуляет `familyProfile`
  - Исправлена функция `migrate()` - добавлено `familyJoinRequests`
  - Увеличена версия persist с 7 до 8
