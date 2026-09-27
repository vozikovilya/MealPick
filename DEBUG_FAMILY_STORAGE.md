# 🔧 Отладка сохранения семьи

## 📋 Пошаговая инструкция по диагностике

### Шаг 1: Откройте консоль браузера

1. Откройте ваше приложение в браузере
2. Нажмите `F12` или `Ctrl+Shift+I` (Windows/Linux) или `Cmd+Option+I` (Mac)
3. Перейдите на вкладку **Console**

### Шаг 2: Проверьте начальное состояние

В консоли выполните:
```javascript
window.diagnoseFamilyStorage();
```

Вы увидите:
- ✅ или ❌ - найдены ли данные в localStorage
- Версию хранилища
- Текущего пользователя
- Профиль семьи (если есть)
- Список пользователей

### Шаг 3: Создайте семью

1. Войдите в аккаунт
2. Перейдите в "Профиль" → "Профиль семьи"
3. Создайте семью

В консоли должны появиться сообщения:
```
🏠 Создание семьи: { currentUserId: "user_...", existingFamily: null }
✅ Семья создана: { id: "family_...", name: "...", ... }
🔍 Проверка после создания: { familyProfile: {...}, localStorage: "..." }
```

### Шаг 4: Проверьте сохранение сразу после создания

Сразу после создания семьи выполните в консоли:
```javascript
window.diagnoseFamilyStorage();
```

Должно показать:
```
✅ localStorage найден
✅ state найден
✅ familyProfile найден
  - ID: family_...
  - Название: ...
  - Владелец: user_...
  - Участники: ["user_..."]
```

### Шаг 5: Перезагрузите страницу

Нажмите `F5` или `Ctrl+R` для перезагрузки страницы.

Сразу после перезагрузки выполните:
```javascript
window.diagnoseFamilyStorage();
```

**Если семья НЕ сохраняется**, вы увидите:
```
⚠️ familyProfile отсутствует или null
```

**Если семья сохраняется**, вы увидите:
```
✅ familyProfile найден
```

### Шаг 6: Проверьте логи миграции

При загрузке страницы в консоли должны появиться сообщения:
```
🔄 Миграция вызвана, версия: 9
📦 Persisted state: {...}
✅ Используем сохранённые данные
  - Семья: {...}
```

Или:
```
🔄 Миграция вызвана, версия: 9
📦 Persisted state: {...}
⚠️ Нет сохранённых данных, используем дефолтные
```

---

## 🐛 Возможные проблемы и решения

### Проблема 1: Семья не сохраняется после перезагрузки

**Симптомы:**
- Создаёте семью
- Перезагружаете страницу
- Семья исчезает

**Диагностика:**
```javascript
// 1. Создайте семью
// 2. Сразу проверьте localStorage
window.diagnoseFamilyStorage();
// Должно показать: ✅ familyProfile найден

// 3. Перезагрузите страницу
// 4. Проверьте снова
window.diagnoseFamilyStorage();
// Если показывает: ⚠️ familyProfile отсутствует
```

**Возможные причины:**
1. **Persist middleware не сохраняет данные**
   - Проверьте, что версия увеличена до 9
   - Проверьте, что migrate() вызывается
   
2. **localStorage очищается браузером**
   - Проверьте настройки приватности браузера
   - Убедитесь, что не включён режим инкогнито
   
3. **Компонент не читает данные из store**
   - Проверьте, что ProfileScreen получает familyProfile из useStore()

**Решение:**
```javascript
// Принудительно сохраните семью
const familyData = {
  id: "family_test",
  name: "Тестовая семья",
  avatar: "👨‍👩‍👧‍👦",
  ownerId: "user_1",
  memberIds: ["user_1"],
  inviteLink: "https://test.com",
  createdAt: Date.now()
};
window.forceSaveFamily(familyData);
```

---

### Проблема 2: Миграция не вызывается

**Симптомы:**
- В консоли нет сообщений "🔄 Миграция вызвана"
- Семья не сохраняется

**Диагностика:**
```javascript
// Проверьте версию в localStorage
const data = JSON.parse(localStorage.getItem('meal-picker-storage'));
console.log('Версия:', data.version);
// Должно быть: 9
```

**Решение:**
Если версия меньше 9, увеличьте её в store.ts:
```typescript
{
  name: 'meal-picker-storage',
  version: 9,  // ✅ Убедитесь, что версия 9
  migrate: ...
}
```

---

### Проблема 3: Семья создаётся, но не отображается

**Симптомы:**
- Создаёте семью
- В консоли видно: ✅ Семья создана
- Но в UI семья не отображается

**Диагностика:**
```javascript
// Проверьте store
const store = window.__ZUSTAND_STORE__;
console.log('Store:', store.getState());
// Должно показать familyProfile
```

**Решение:**
Проверьте, что ProfileScreen читает familyProfile из store:
```typescript
const { familyProfile } = useStore();
console.log('Family in component:', familyProfile);
```

---

## 📊 Чек-лист отладки

Пройдитесь по этому чек-листу:

- [ ] **localStorage не пуст**
  ```javascript
  localStorage.getItem('meal-picker-storage') !== null
  ```

- [ ] **Версия хранилища = 9**
  ```javascript
  JSON.parse(localStorage.getItem('meal-picker-storage')).version === 9
  ```

- [ ] **familyProfile существует в localStorage**
  ```javascript
  JSON.parse(localStorage.getItem('meal-picker-storage')).state.familyProfile !== null
  ```

- [ ] **Миграция вызывается при загрузке**
  - В консоли есть: "🔄 Миграция вызвана, версия: 9"

- [ ] **Семья создаётся в store**
  - В консоли есть: "✅ Семья создана"

- [ ] **Семья сохраняется после set()**
  - В консоли есть: "🔍 Проверка после создания"
  - familyProfile не null

- [ ] **Семья загружается после перезагрузки**
  - После F5 семья всё ещё в localStorage

- [ ] **Компонент читает familyProfile**
  - В ProfileScreen: `const { familyProfile } = useStore();`
  - familyProfile не null

---

## 🔍 Глубокая диагностика

### Проверка persist middleware

```javascript
// 1. Создайте семью
// 2. Проверьте localStorage сразу
const data1 = JSON.parse(localStorage.getItem('meal-picker-storage'));
console.log('Сразу после создания:', data1.state.familyProfile);

// 3. Подождите 1 секунду
setTimeout(() => {
  const data2 = JSON.parse(localStorage.getItem('meal-picker-storage'));
  console.log('Через 1 секунду:', data2.state.familyProfile);
}, 1000);

// 4. Перезагрузите страницу
// 5. Проверьте снова
const data3 = JSON.parse(localStorage.getItem('meal-picker-storage'));
console.log('После перезагрузки:', data3.state.familyProfile);
```

### Проверка состояния store

```javascript
// Подпишитесь на изменения store
const unsubscribe = useStore.subscribe((state) => {
  console.log('📊 Store изменился:', {
    familyProfile: state.familyProfile,
    currentUserId: state.currentUserId
  });
});

// Создайте семью
// В консоли должно появиться: "📊 Store изменился"

// Отпишитесь
unsubscribe();
```

---

## 🛠️ Экстренные меры

### Если ничего не помогает

1. **Очистите localStorage полностью:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Сбросьте версию хранилища:**
   ```javascript
   const data = JSON.parse(localStorage.getItem('meal-picker-storage'));
   data.version = 1;
   localStorage.setItem('meal-picker-storage', JSON.stringify(data));
   location.reload();
   ```

3. **Создайте семью вручную:**
   ```javascript
   const family = {
     id: `family_${Date.now()}`,
     name: "Тестовая семья",
     avatar: "👨‍👩‍👧‍👦",
     ownerId: "user1",
     memberIds: ["user1"],
     inviteLink: `https://test.com/join/${Date.now()}`,
     createdAt: Date.now()
   };
   window.forceSaveFamily(family);
   ```

---

## 📞 Если проблема не решена

Соберите следующую информацию:

1. **Скриншот консоли** после создания семьи
2. **Вывод `window.diagnoseFamilyStorage()`** до и после перезагрузки
3. **Версия хранилища**: `JSON.parse(localStorage.getItem('meal-picker-storage')).version`
4. **Содержимое localStorage**: `localStorage.getItem('meal-picker-storage')`

Отправьте эту информацию для дальнейшего анализа.

---

## ✅ Успешная отладка

Если все проверки пройдены и семья сохраняется, вы увидите:

```
🔍 Диагностика сохранения семьи
✅ localStorage найден
✅ state найден
✅ familyProfile найден
  - ID: family_1234567890
  - Название: Моя семья
  - Владелец: user_1234567890
  - Участники: ["user_1234567890"]
✅ Пользователи найдены: 1
  - Илья (vozikov-ilya@mail.ru): familyId=family_1234567890, isFamilyOwner=true
```

Поздравляем! Проблема решена! 🎉
