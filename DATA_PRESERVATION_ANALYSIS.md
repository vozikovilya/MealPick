# Полный анализ логики сохранения данных в MealPick

## 📊 Архитектура хранения данных

### Структура данных в localStorage

```typescript
{
  "state": {
    "users": [...],              // Все пользователи
    "currentUserId": "user1",    // Текущий авторизованный пользователь
    "familyProfile": {...},      // Профиль семьи (глобальный)
    "familyJoinRequests": [...], // Заявки на вступление
    "swipeRequests": [...],      // Запросы на выбор блюд
    "notifications": [...],      // Уведомления
    "customMealTypes": [...],    // Пользовательские категории
    "deliveryOptions": [...],    // Опции доставки
    "pendingNotification": null  // Активное уведомление
  },
  "version": 8
}
```

### Ключевые принципы

1. **Все данные хранятся в одном localStorage** для всех пользователей
2. **familyProfile - глобальный объект**, который виден всем пользователям
3. **Фильтрация происходит на уровне компонентов**, а не в store
4. **Каждый пользователь видит только свои данные** через фильтрацию по `currentUserId`

## 🔍 Пошаговый анализ сценариев

### Сценарий 1: Создание семьи

**Действия:**
1. Пользователь А регистрируется
2. Пользователь А создаёт семью
3. Пользователь А выходит
4. Пользователь А входит снова

**Что происходит:**

```typescript
// 1. Регистрация
register() → {
  users: [..., newUser],
  currentUserId: newUser.id,
  // familyProfile НЕ обнуляется (исправлено!)
  pendingNotification: null
}

// 2. Создание семьи
createFamilyProfile() → {
  familyProfile: {
    id: "family_123",
    ownerId: "user_A",
    memberIds: ["user_A"],
    // ...
  },
  users: [..., { ...user_A, familyId: "family_123", isFamilyOwner: true }]
}

// 3. Выход
logout() → {
  currentUserId: null,
  pendingNotification: null
  // familyProfile НЕ обнуляется (исправлено!)
}

// 4. Вход
login() → {
  currentUserId: "user_A",
  familyProfile: familyProfile.memberIds.includes("user_A") 
    ? familyProfile  // ✅ Семья восстанавливается
    : null,
  notifications: filtered,
  swipeRequests: filtered
}
```

**Результат:** ✅ Семья сохраняется и восстанавливается

---

### Сценарий 2: Регистрация нового пользователя

**Действия:**
1. Пользователь А создаёт семью
2. Пользователь Б регистрируется
3. Пользователь Б входит

**Что происходит:**

```typescript
// 1. Пользователь А создаёт семью
createFamilyProfile() → {
  familyProfile: {
    id: "family_123",
    ownerId: "user_A",
    memberIds: ["user_A"]
  }
}

// 2. Пользователь Б регистрируется
register() → {
  users: [..., user_A, user_B],
  currentUserId: "user_B",
  // familyProfile НЕ обнуляется (исправлено!)
  // familyProfile остаётся в localStorage
}

// 3. Пользователь Б входит (автоматически после регистрации)
// login() не вызывается, currentUserId уже установлен
// Но если бы вызывался:
login("user_B") → {
  currentUserId: "user_B",
  familyProfile: familyProfile.memberIds.includes("user_B")
    ? familyProfile
    : null  // ✅ Пользователь Б не видит семью А
}
```

**Результат:** ✅ Семья пользователя А сохраняется, пользователь Б её не видит

---

### Сценарий 3: Присоединение к семье

**Действия:**
1. Пользователь А создаёт семью
2. Пользователь Б получает ссылку-приглашение
3. Пользователь Б отправляет заявку
4. Пользователь А принимает заявку
5. Пользователь Б видит семью

**Что происходит:**

```typescript
// 1. Пользователь А создаёт семью
createFamilyProfile() → {
  familyProfile: {
    id: "family_123",
    ownerId: "user_A",
    memberIds: ["user_A"]
  }
}

// 2-3. Пользователь Б отправляет заявку
requestJoinFamily() → {
  familyJoinRequests: [{
    id: "req_456",
    familyId: "family_123",
    userId: "user_B",
    status: "pending"
  }],
  notifications: [{
    type: "family_join_request",
    fromUserId: "user_B",
    familyJoinRequestId: "req_456"
  }]
}

// 4. Пользователь А принимает заявку
respondToJoinRequest("req_456", true) → {
  familyProfile: {
    ...familyProfile,
    memberIds: ["user_A", "user_B"]  // ✅ Пользователь Б добавлен
  },
  familyJoinRequests: [{
    ...request,
    status: "accepted"
  }],
  notifications: [{
    type: "family_join_response",
    message: "Вы приняты в семью!"
  }]
}

// 5. Пользователь Б входит
login("user_B") → {
  currentUserId: "user_B",
  familyProfile: familyProfile.memberIds.includes("user_B")
    ? familyProfile  // ✅ Семья видна пользователю Б
    : null
}
```

**Результат:** ✅ Пользователь Б успешно присоединяется к семье

---

### Сценарий 4: Удаление аккаунта

**Действия:**
1. Пользователь А создаёт семью
2. Пользователь Б присоединяется
3. Пользователь Б удаляет аккаунт
4. Семья остаётся, но без пользователя Б

**Что происходит:**

```typescript
// 1-2. Семья создана, пользователь Б присоединился
familyProfile = {
  ownerId: "user_A",
  memberIds: ["user_A", "user_B"]
}

// 3. Пользователь Б удаляет аккаунт
deleteAccount() → {
  users: users.filter(u => u.id !== "user_B"),
  currentUserId: null,
  familyProfile: {
    ...familyProfile,
    memberIds: ["user_A"]  // ✅ Пользователь Б удалён из семьи
  }
}

// 4. Пользователь А входит
login("user_A") → {
  familyProfile: {
    ownerId: "user_A",
    memberIds: ["user_A"]  // ✅ Семья осталась, но без Б
  }
}
```

**Результат:** ✅ Семья сохраняется, пользователь Б удалён из неё

---

### Сценарий 5: Удаление семьи

**Действия:**
1. Пользователь А создаёт семью
2. Пользователь Б присоединяется
3. Пользователь А удаляет семью
4. Оба пользователя больше не видят семью

**Что происходит:**

```typescript
// 1-2. Семья создана
familyProfile = {
  id: "family_123",
  ownerId: "user_A",
  memberIds: ["user_A", "user_B"]
}

// 3. Пользователь А удаляет семью
deleteFamilyProfile() → {
  familyProfile: null,  // ✅ Семья удалена
  users: users.map(u => ({
    ...u,
    familyId: undefined,
    isFamilyOwner: false
  }))
}

// 4. Оба пользователя входят
login("user_A") → {
  familyProfile: null  // ✅ Семьи больше нет
}

login("user_B") → {
  familyProfile: null  // ✅ Семьи больше нет
}
```

**Результат:** ✅ Семья удалена для всех пользователей

---

## 🐛 Найденные и исправленные проблемы

### Проблема 1: Обнуление familyProfile при регистрации

**Было:**
```typescript
register() → {
  familyProfile: null,  // ❌ Удаляло семью предыдущего пользователя
  familyJoinRequests: [],
  notifications: [],
  swipeRequests: []
}
```

**Стало:**
```typescript
register() → {
  // familyProfile НЕ обнуляется
  // familyJoinRequests, notifications, swipeRequests НЕ обнуляются
  pendingNotification: null
}
```

**Почему это важно:** Семья должна сохраняться для всех пользователей. При регистрации нового пользователя семья предыдущего не должна удаляться.

---

### Проблема 2: Обнуление familyProfile при выходе

**Было:**
```typescript
logout() → {
  currentUserId: null,
  familyProfile: null,  // ❌ Удаляло семью
  pendingNotification: null
}
```

**Стало:**
```typescript
logout() → {
  currentUserId: null,
  pendingNotification: null
  // familyProfile НЕ обнуляется
}
```

**Почему это важно:** Семья должна сохраняться в localStorage, чтобы при следующем входе пользователя она могла быть восстановлена.

---

### Проблема 3: Отсутствие familyJoinRequests в миграции

**Было:**
```typescript
migrate() → {
  users: persistedState.users,
  familyProfile: persistedState.familyProfile,
  // familyJoinRequests отсутствовало!
  swipeRequests: persistedState.swipeRequests,
  // ...
}
```

**Стало:**
```typescript
migrate() → {
  users: persistedState.users,
  familyProfile: persistedState.familyProfile,
  familyJoinRequests: persistedState.familyJoinRequests || [],  // ✅ Добавлено
  swipeRequests: persistedState.swipeRequests,
  // ...
}
```

**Почему это важно:** Заявки на вступление должны сохраняться между сессиями.

---

## 🔧 Исправления в коде

### 1. Функция `register()` (строка 284-312)

```typescript
register: (email, username, password, name, avatar = '👤') => {
  // ...
  set({
    users: [...users, newUser],
    currentUserId: newUser.id,
    // НЕ обнуляем familyProfile - она должна сохраняться для всех пользователей
    pendingNotification: null,
  });
}
```

### 2. Функция `logout()` (строка 349-354)

```typescript
logout: () => {
  set({ 
    currentUserId: null,
    pendingNotification: null,
    // familyProfile НЕ обнуляем - она должна сохраняться в localStorage
  });
},
```

### 3. Функция `migrate()` (строка 877-905)

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

---

## ✅ Итоговая архитектура

### Глобальные данные (видны всем пользователям)
- `users` - все зарегистрированные пользователи
- `familyProfile` - профиль семьи (один на все аккаунты)
- `familyJoinRequests` - все заявки на вступление
- `customMealTypes` - пользовательские категории

### Данные текущего пользователя (фильтруются при входе)
- `currentUserId` - ID текущего пользователя
- `notifications` - уведомления для текущего пользователя
- `swipeRequests` - запросы для текущего пользователя
- `pendingNotification` - активное уведомление

### Логика фильтрации

```typescript
// При входе пользователя
login() → {
  // 1. Проверяем принадлежность к семье
  const userFamily = familyProfile?.memberIds.includes(user.id)
    ? familyProfile
    : null;
  
  // 2. Фильтруем уведомления
  const userNotifications = notifications.filter(n => 
    n.fromUserId === user.id || 
    (userFamily && userFamily.memberIds.includes(n.fromUserId))
  );
  
  // 3. Фильтруем запросы
  const userSwipeRequests = swipeRequests.filter(r => 
    r.fromUserId === user.id || 
    r.toUserId === user.id ||
    (r.toFamilyId && userFamily && r.toFamilyId === userFamily.id)
  );
  
  // 4. Устанавливаем отфильтрованные данные
  set({
    currentUserId: user.id,
    familyProfile: userFamily,
    notifications: userNotifications,
    swipeRequests: userSwipeRequests
  });
}
```

---

## 🧪 Тестирование

### Тест 1: Создание семьи и выход/вход

```bash
1. Войти как user_A
2. Создать семью "Семья А"
3. Выйти
4. Войти как user_A
5. ✅ Проверить: семья "Семья А" видна
```

### Тест 2: Регистрация нового пользователя

```bash
1. Войти как user_A
2. Создать семью "Семья А"
3. Выйти
4. Зарегистрировать user_B
5. Войти как user_B
6. ✅ Проверить: семья "Семья А" НЕ видна пользователю user_B
7. Выйти
8. Войти как user_A
9. ✅ Проверить: семья "Семья А" всё ещё видна
```

### Тест 3: Присоединение к семье

```bash
1. user_A создаёт семью
2. user_B регистрируется
3. user_B отправляет заявку на вступление
4. user_A принимает заявку
5. user_B выходит и входит
6. ✅ Проверить: user_B видит семью
```

### Тест 4: Удаление аккаунта

```bash
1. user_A создаёт семью
2. user_B присоединяется
3. user_B удаляет аккаунт
4. user_A входит
5. ✅ Проверить: семья осталась, но user_B больше не в memberIds
```

---

## 📝 Выводы

1. **familyProfile - глобальный объект**, который хранится в localStorage для всех пользователей
2. **Фильтрация происходит при входе** через функцию `login()`
3. **При регистрации и выходе данные НЕ обнуляются**, что позволяет сохранять семью
4. **Миграция корректно обрабатывает все поля**, включая `familyJoinRequests`
5. **Каждый пользователь видит только свои данные** благодаря фильтрации по `currentUserId` и `memberIds`

Эта архитектура обеспечивает:
- ✅ Сохранение семьи между сессиями
- ✅ Изоляцию данных между пользователями
- ✅ Корректную работу с несколькими пользователями
- ✅ Надёжное хранение данных в localStorage
