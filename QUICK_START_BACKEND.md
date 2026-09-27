# 🚀 БЫСТРЫЙ СТАРТ: Развертывание Backend

## ⚡ Что нужно сделать прямо сейчас (5 минут)

### 1️⃣ Загрузите файлы на сервер

**Через файловый менеджер Beget:**

1. Зайдите в панель управления Beget
2. Откройте "Файловый менеджер"
3. Перейдите в папку `public_html`
4. Создайте папку `backend`
5. Загрузите ВСЕ файлы из локальной папки `backend/`

**Или через FTP:**
- Хост: `ftp.ваш_логин.beget.ru`
- Загрузите в `public_html/backend/`

---

### 2️⃣ Импортируйте базу данных

1. Откройте **phpMyAdmin** в панели Beget
2. Выберите базу данных `q91929se_base_1`
3. Перейдите на вкладку **"Импорт"**
4. Загрузите файл: `backend/database/schema.sql`
5. Нажмите **"Выполнить"**

✅ Готово! База данных создана.

---

### 3️⃣ Обновите URL в frontend

Откройте файл `src/services/api.ts` и замените:

```typescript
const API_BASE_URL = 'http://ваш_логин.beget.tech/backend/api';
```

на ваш реальный домен (например):

```typescript
const API_BASE_URL = 'http://q91929se.beget.tech/backend/api';
```

---

### 4️⃣ Проверьте работу

Откройте в браузере:
```
http://ваш_логин.beget.tech/backend/check-php.php
```

Должно показать:
- ✅ Версия PHP: 8.3.33
- ✅ MySQLi установлено
- ✅ PDO MySQL установлено

---

### 5️⃣ Протестируйте API

**Регистрация пользователя:**

```bash
curl -X POST http://ваш_логин.beget.tech/backend/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "test123",
    "name": "Тест",
    "avatar": "👨‍🍳"
  }'
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "message": "Регистрация успешна",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": { "id": 1, "name": "Тест", ... }
  }
}
```

---

## 📋 Что создано

### Backend (PHP 8.3 + MySQL)

✅ **20 API endpoints** для всех функций:
- Аутентификация (регистрация, вход)
- Профиль пользователя
- Управление семьёй
- CRUD для блюд
- Уведомления
- Запросы на выбор блюд

✅ **JWT аутентификация** - безопасная система токенов

✅ **SQL-скрипт** для создания всех таблиц

✅ **Полная документация** (README.md, DEPLOYMENT.md)

### Frontend

✅ **API сервис** (`src/services/api.ts`) для работы с backend

✅ **Все типы данных** для TypeScript

---

## 🎯 Следующие шаги

### Вариант A: Полная интеграция (рекомендуется)

Замените localStorage на API вызовы в компонентах:

**Пример для AuthScreen.tsx:**

```typescript
import { register, login } from '../services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (mode === 'login') {
      const response = await login({ login: email, password });
      useStore.getState().setCurrentUser(response.data.user);
      onAuth();
    } else {
      const response = await register({
        email, username, password, name, avatar
      });
      useStore.getState().setCurrentUser(response.data.user);
      onAuth();
    }
  } catch (error) {
    setError(error.message);
  }
};
```

### Вариант B: Гибридный подход

Используйте localStorage для кэширования + синхронизация с backend.

---

## 🐛 Если что-то не работает

### Ошибка подключения к БД
→ Проверьте данные в `backend/config/database.php`

### CORS ошибка
→ Добавьте ваш домен в `ALLOWED_ORIGINS` в `config/database.php`

### 404 Not Found
→ Проверьте правильность путей к файлам

### 500 Internal Server Error
→ Включите отображение ошибок в `config/database.php`

---

## 📞 Нужна помощь?

Подробная документация:
- `backend/README.md` - полное описание API
- `backend/DEPLOYMENT.md` - детальная инструкция
- `BACKEND_READY.md` - интеграция с frontend

---

## ✅ Результат

После выполнения этих шагов:

✅ Данные будут храниться на сервере, а не в localStorage  
✅ Проблема с сохранением семьи будет решена  
✅ Синхронизация между устройствами  
✅ Неограниченный объём данных  
✅ Повышенная безопасность  

---

**Время на развертывание:** ~10-15 минут  
**Сложность:** Низкая (просто загрузить файлы и импортировать SQL)

**Готово!** 🎉 Ваш backend работает!
