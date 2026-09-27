# 🎉 Backend полностью готов!

## ✅ Что создано

### Структура файлов Backend:

```
backend/
├── database/
│   └── schema.sql              # SQL-скрипт для создания таблиц
├── config/
│   └── database.php            # Конфигурация БД и CORS
├── utils/
│   └── jwt.php                 # JWT аутентификация
├── api/
│   ├── auth/
│   │   ├── register.php        # Регистрация
│   │   └── login.php           # Вход
│   ├── user/
│   │   ├── profile.php         # Получение профиля
│   │   └── update.php          # Обновление профиля
│   ├── family/
│   │   ├── create.php          # Создание семьи
│   │   ├── get.php             # Получение семьи
│   │   ├── join.php            # Присоединение к семье
│   │   ├── delete.php          # Удаление семьи
│   │   ├── respond-request.php # Обработка заявок
│   │   └── add-status.php      # Назначение статуса
│   ├── recipes/
│   │   ├── list.php            # Список блюд
│   │   ├── create.php          # Создание блюда
│   │   └── delete.php          # Удаление блюда
│   ├── notifications/
│   │   ├── list.php            # Список уведомлений
│   │   └── update.php          # Обновление уведомлений
│   └── swipe/
│       ├── create.php          # Создание запроса
│       └── respond.php         # Ответ на запрос
├── .htaccess                   # Настройки Apache
├── check-php.php               # Проверка PHP
├── README.md                   # Документация API
└── DEPLOYMENT.md               # Инструкция по развертыванию
```

### Структура файлов Frontend:

```
src/
└── services/
    └── api.ts                  # API сервис для работы с backend
```

---

## 📋 Пошаговая инструкция по развертыванию

### Шаг 1: Загрузка файлов на сервер

1. Откройте файловый менеджер Beget или FTP-клиент
2. Перейдите в папку `public_html`
3. Создайте папку `backend`
4. Загрузите **все файлы** из локальной папки `backend/` в созданную папку

### Шаг 2: Создание базы данных

База данных уже создана с параметрами:
- **Имя БД:** `q91929se_base_1`
- **Пользователь:** `q91929se_base_1`
- **Пароль:** `Lanceres32rus`
- **Хост:** `localhost`

### Шаг 3: Импорт структуры базы данных

1. Откройте **phpMyAdmin** в панели Beget
2. Выберите базу данных `q91929se_base_1`
3. Перейдите на вкладку **"Импорт"**
4. Загрузите файл `backend/database/schema.sql`
5. Нажмите **"Выполнить"**

### Шаг 4: Настройка URL в frontend

Откройте файл `src/services/api.ts` и замените:

```typescript
const API_BASE_URL = 'http://ваш_логин.beget.tech/backend/api';
```

на ваш реальный домен:

```typescript
const API_BASE_URL = 'http://q91929se.beget.tech/backend/api';
```

### Шаг 5: Настройка CORS

Откройте файл `backend/config/database.php` и добавьте ваш домен:

```php
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mealpick.vercel.app',
    'http://q91929se.beget.tech'  // Ваш временный домен
]);
```

### Шаг 6: Проверка работы

1. Откройте в браузере:
   ```
   http://q91929se.beget.tech/backend/check-php.php
   ```

2. Убедитесь, что:
   - ✅ Версия PHP: 8.3.33
   - ✅ MySQLi установлено
   - ✅ PDO MySQL установлено

3. Протестируйте API через Postman или curl:
   ```bash
   curl -X POST http://q91929se.beget.tech/backend/api/auth/register.php \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "username": "testuser",
       "password": "test123",
       "name": "Тест",
       "avatar": "👨‍🍳"
     }'
   ```

---

## 🔄 Интеграция с Frontend

### Вариант 1: Полная интеграция (рекомендуется)

Замените localStorage на API вызовы в компонентах:

**Пример для AuthScreen.tsx:**

```typescript
import { register, login } from '../services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (mode === 'login') {
      const response = await login({ login: email, password });
      // Сохраняем пользователя в Zustand store
      useStore.getState().setCurrentUser(response.data.user);
      onAuth();
    } else {
      const response = await register({
        email,
        username,
        password,
        name,
        avatar
      });
      useStore.getState().setCurrentUser(response.data.user);
      onAuth();
    }
  } catch (error) {
    setError(error.message);
  }
};
```

### Вариант 2: Гибридный подход

Используйте localStorage для кэширования, но синхронизируйте с backend:

```typescript
// При загрузке приложения
useEffect(() => {
  const loadUserData = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await getProfile();
        useStore.getState().setCurrentUser(response.data.user);
      } catch (error) {
        // Токен недействителен
        localStorage.removeItem('auth_token');
      }
    }
  };
  loadUserData();
}, []);
```

---

## 📊 API Endpoints

### Аутентификация
- `POST /api/auth/register.php` - Регистрация
- `POST /api/auth/login.php` - Вход

### Профиль
- `GET /api/user/profile.php` - Получение профиля
- `PUT /api/user/update.php` - Обновление профиля

### Семья
- `POST /api/family/create.php` - Создание семьи
- `GET /api/family/get.php` - Получение семьи
- `POST /api/family/join.php` - Присоединение к семье
- `DELETE /api/family/delete.php` - Удаление семьи
- `POST /api/family/respond-request.php` - Обработка заявок
- `POST /api/family/add-status.php` - Назначение статуса

### Блюда
- `GET /api/recipes/list.php` - Список блюд
- `POST /api/recipes/create.php` - Создание блюда
- `DELETE /api/recipes/delete.php` - Удаление блюда

### Уведомления
- `GET /api/notifications/list.php` - Список уведомлений
- `PUT /api/notifications/update.php` - Обновление уведомлений

### Запросы на выбор
- `POST /api/swipe/create.php` - Создание запроса
- `POST /api/swipe/respond.php` - Ответ на запрос

---

## 🎯 Что дальше?

### 1. Загрузите backend на сервер
- Загрузите все файлы из папки `backend/` на сервер
- Импортируйте `schema.sql` в базу данных

### 2. Настройте frontend
- Обновите `API_BASE_URL` в `src/services/api.ts`
- Замените localStorage на API вызовы в компонентах

### 3. Протестируйте
- Зарегистрируйте тестового пользователя
- Создайте семью
- Добавьте блюда
- Проверьте все функции

### 4. Деплой frontend
- Задеплойте frontend на Vercel
- Обновите CORS настройки в backend

---

## 🐛 Решение проблем

### Ошибка подключения к БД
- Проверьте данные в `backend/config/database.php`
- Убедитесь, что база данных создана
- Проверьте права пользователя

### CORS ошибка
- Добавьте ваш домен в `ALLOWED_ORIGINS`
- Убедитесь, что `.htaccess` загружен

### 404 Not Found
- Проверьте правильность путей к файлам
- Убедитесь, что файлы загружены в правильную папку

### 500 Internal Server Error
- Включите отображение ошибок в `config/database.php`
- Проверьте логи ошибок PHP

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи ошибок PHP
2. Проверьте логи ошибок MySQL
3. Убедитесь, что все файлы загружены корректно
4. Проверьте права доступа к файлам (644 для файлов, 755 для папок)

---

## ✅ Чек-лист перед запуском

- [ ] Файлы backend загружены на сервер
- [ ] База данных создана
- [ ] Структура БД импортирована (schema.sql)
- [ ] PHP версия 8.3.x
- [ ] Расширения MySQLi и PDO установлены
- [ ] Данные подключения в `config/database.php` верны
- [ ] `API_BASE_URL` обновлен в `src/services/api.ts`
- [ ] CORS настроен для frontend
- [ ] API endpoints работают
- [ ] Тестовый пользователь зарегистрирован
- [ ] Frontend подключен к backend

---

**Готово!** 🎉

Backend полностью готов к использованию. Следуйте инструкции по развертыванию, и ваше приложение будет работать с серверной базой данных!

**Время на развертывание:** ~30 минут

**Результат:** Полноценное приложение с серверным backend, которое решает проблему с сохранением данных! 🚀
