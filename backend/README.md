# MealPick Backend API

Backend API для приложения MealPick на PHP 8.3 + MySQL

## 📋 Требования

- PHP 8.3+
- MySQL 5.7+
- Веб-сервер Apache/Nginx

## 🚀 Установка

### 1. Загрузка файлов на сервер

Загрузите все файлы из папки `backend/` на ваш сервер через FTP или файловый менеджер Beget.

**Структура на сервере:**
```
public_html/
└── backend/
    ├── api/
    │   ├── auth/
    │   │   ├── register.php
    │   │   └── login.php
    │   ├── user/
    │   │   ├── profile.php
    │   │   └── update.php
    │   ├── family/
    │   │   ├── create.php
    │   │   ├── get.php
    │   │   ├── join.php
    │   │   ├── delete.php
    │   │   ├── respond-request.php
    │   │   └── add-status.php
    │   ├── recipes/
    │   │   ├── list.php
    │   │   ├── create.php
    │   │   └── delete.php
    │   ├── notifications/
    │   │   ├── list.php
    │   │   └── update.php
    │   └── swipe/
    │       ├── create.php
    │       └── respond.php
    ├── config/
    │   └── database.php
    ├── utils/
    │   └── jwt.php
    ├── database/
    │   └── schema.sql
    └── .htaccess
```

### 2. Создание базы данных

1. Зайдите в панель управления Beget
2. Перейдите в раздел "MySQL" или "Базы данных"
3. Создайте базу данных с параметрами:
   - Имя БД: `q91929se_base_1`
   - Пользователь: `q91929se_base_1`
   - Пароль: `Lanceres32rus`
   - Хост: `localhost`

### 3. Импорт структуры базы данных

**Через phpMyAdmin:**
1. Откройте phpMyAdmin в панели Beget
2. Выберите базу данных `q91929se_base_1`
3. Перейдите на вкладку "Импорт"
4. Загрузите файл `backend/database/schema.sql`
5. Нажмите "Выполнить"

**Или через командную строку (если есть SSH доступ):**
```bash
mysql -u q91929se_base_1 -p q91929se_base_1 < backend/database/schema.sql
```

### 4. Проверка конфигурации

Откройте файл `backend/config/database.php` и убедитесь, что данные подключения верны:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'q91929se_base_1');
define('DB_USER', 'q91929se_base_1');
define('DB_PASS', 'Lanceres32rus');
```

### 5. Тестирование API

Откройте в браузере:
```
http://ваш_домен.beget.tech/backend/check-php.php
```

Должна отобразиться информация о версии PHP и установленных расширениях.

## 📡 API Endpoints

### Аутентификация

#### Регистрация
```
POST /backend/api/auth/register.php
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "name": "Имя Пользователя",
  "avatar": "👨‍🍳",
  "description": "Описание"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Регистрация успешна",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "name": "Имя Пользователя",
      "avatar": "👨‍🍳",
      "description": "Описание"
    }
  }
}
```

#### Вход
```
POST /backend/api/auth/login.php
Content-Type: application/json

{
  "login": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Вход выполнен",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": { ... }
  }
}
```

### Профиль пользователя

#### Получение профиля
```
GET /backend/api/user/profile.php
Authorization: Bearer {token}
```

#### Обновление профиля
```
PUT /backend/api/user/update.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Новое имя",
  "avatar": "👩‍🍳",
  "description": "Новое описание",
  "email": "newemail@example.com",
  "username": "newusername",
  "password": "newpassword123"
}
```

### Семья

#### Создание семьи
```
POST /backend/api/family/create.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Семья Ивановых",
  "avatar": "👨‍👩‍👧‍👦",
  "description": "Наша семья"
}
```

#### Получение информации о семье
```
GET /backend/api/family/get.php
Authorization: Bearer {token}
```

#### Присоединение к семье
```
POST /backend/api/family/join.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "invite_link": "https://mealspick.app/join/abc123..."
}
```

#### Обработка заявки на вступление
```
POST /backend/api/family/respond-request.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "request_id": 1,
  "accept": true
}
```

#### Назначение статуса
```
POST /backend/api/family/add-status.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 2,
  "title": "Поварушка",
  "emoji": "👑"
}
```

#### Удаление семьи
```
DELETE /backend/api/family/delete.php
Authorization: Bearer {token}
```

### Блюда

#### Получение списка блюд
```
GET /backend/api/recipes/list.php
Authorization: Bearer {token}
```

#### Создание блюда
```
POST /backend/api/recipes/create.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Паста Карбонара",
  "description": "Классическая итальянская паста",
  "image_urls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "video_url": "https://example.com/video.mp4",
  "meal_type": "lunch",
  "ingredients": [
    {"name": "Спагетти", "amount": "400", "unit": "г"},
    {"name": "Бекон", "amount": "200", "unit": "г"}
  ],
  "cooking_steps": [
    {"title": "Подготовка", "text": "Отварите пасту"},
    {"title": "Жарка", "text": "Обжарьте бекон"}
  ],
  "paired_recipe_ids": [1, 2]
}
```

#### Удаление блюда
```
DELETE /backend/api/recipes/delete.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipe_id": 1
}
```

### Уведомления

#### Получение уведомлений
```
GET /backend/api/notifications/list.php
Authorization: Bearer {token}
```

#### Обновление уведомлений
```
PUT /backend/api/notifications/update.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "notification_id": 1,
  "notification_ids": [1, 2, 3],
  "mark_all_read": true,
  "delete_ids": [4, 5]
}
```

### Запросы на выбор блюд

#### Создание запроса
```
POST /backend/api/swipe/create.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipe_ids": [1, 2, 3],
  "to_user_id": 2,
  "to_family_id": 1,
  "mode": "category",
  "category": "breakfast",
  "message": "Что будем есть на завтрак?",
  "delivery_ids": [1, 2]
}
```

#### Ответ на запрос
```
POST /backend/api/swipe/respond.php
Authorization: Bearer {token}
Content-Type: application/json

{
  "request_id": 1,
  "selected_recipe_ids": [1, 3]
}
```

## 🔒 Безопасность

- Все пароли хэшируются с использованием `password_hash()` (bcrypt)
- JWT токены используются для аутентификации
- Все API endpoints защищены от несанкционированного доступа
- SQL-инъекции предотвращены использованием prepared statements
- XSS атаки предотвращены валидацией и санитизацией входных данных

## 🌐 CORS

CORS настроен для следующих доменов:
- `http://localhost:5173` (локальная разработка)
- `http://localhost:3000` (локальная разработка)
- `https://mealpick.vercel.app` (production)

Для добавления новых доменов отредактируйте файл `backend/config/database.php`:

```php
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mealpick.vercel.app',
    'http://ваш_домен.beget.tech'  // Добавьте ваш домен
]);
```

## 🐛 Отладка

Для включения отображения ошибок отредактируйте `backend/config/database.php`:

```php
ini_set('display_errors', 1);  // Включить для отладки
error_reporting(E_ALL);
```

**Важно:** Отключите отображение ошибок в production!

## 📝 Примечания

- Все даты и время хранятся в формате UTC
- JSON поля хранятся в формате JSON в MySQL
- JWT токены действительны 7 дней
- Максимальный размер изображения: 5 MB
- Поддерживаемые форматы изображений: JPEG, PNG, WebP, GIF

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи ошибок PHP
2. Проверьте подключение к базе данных
3. Убедитесь, что все таблицы созданы
4. Проверьте CORS настройки

---

**Версия:** 1.0  
**Дата создания:** 2024  
**Автор:** MealPick Team
