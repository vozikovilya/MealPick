# 🚀 Пошаговая инструкция по развертыванию Backend

## ✅ Шаг 1: Загрузка файлов на сервер

### Через файловый менеджер Beget:

1. Зайдите в панель управления Beget
2. Откройте "Файловый менеджер"
3. Перейдите в папку `public_html` (или `www`)
4. Создайте папку `backend`
5. Загрузите все файлы из локальной папки `backend/` в созданную папку

**Структура должна быть:**
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
    ├── .htaccess
    ├── check-php.php
    └── README.md
```

### Через FTP (FileZilla или другой клиент):

1. Подключитесь к серверу:
   - Хост: `ftp.ваш_логин.beget.ru`
   - Логин: ваш логин Beget
   - Пароль: ваш пароль Beget
   - Порт: 21

2. Перейдите в папку `public_html`
3. Создайте папку `backend`
4. Загрузите все файлы

---

## ✅ Шаг 2: Создание базы данных

### Через панель управления Beget:

1. Зайдите в панель управления Beget
2. Найдите раздел **"MySQL"** или **"Базы данных"**
3. Нажмите **"Создать базу данных"**
4. Заполните форму:
   - **Имя базы данных:** `q91929se_base_1` (уже создано)
   - **Имя пользователя:** `q91929se_base_1` (уже создано)
   - **Пароль:** `Lanceres32rus` (уже создано)
   - **Хост:** `localhost`

**ВАЖНО:** Если база данных уже создана, просто сохраните эти данные для следующего шага.

---

## ✅ Шаг 3: Импорт структуры базы данных

### Через phpMyAdmin:

1. В панели Beget найдите раздел **"phpMyAdmin"**
2. Откройте phpMyAdmin
3. Выберите базу данных `q91929se_base_1` в левом меню
4. Перейдите на вкладку **"Импорт"**
5. Нажмите **"Выберите файл"**
6. Загрузите файл `backend/database/schema.sql`
7. Нажмите **"Выполнить"** внизу страницы

**Должно появиться сообщение:**
```
Импорт успешно завершен
```

### Проверка создания таблиц:

1. В phpMyAdmin выберите базу данных `q91929se_base_1`
2. Вы должны увидеть следующие таблицы:
   - `users`
   - `families`
   - `family_members`
   - `family_statuses`
   - `recipes`
   - `swipe_requests`
   - `notifications`
   - `family_join_requests`
   - `custom_meal_types`

---

## ✅ Шаг 4: Проверка работы PHP

1. Откройте в браузере:
   ```
   http://ваш_логин.beget.tech/backend/check-php.php
   ```

2. Вы должны увидеть:
   ```
   Информация о сервере
   Версия PHP: 8.3.33
   Операционная система: Linux ...
   
   Расширения PHP
   - Core
   - date
   - libxml
   - openssl
   - pcre
   - zlib
   - filter
   - hash
   - json
   - random
   - Reflection
   - SPL
   - session
   - standard
   - sodium
   - cgi-fcgi
   - mysqlnd
   - PDO
   - pdo_mysql
   - mysqli
   ...
   
   Проверка MySQL
   ✅ MySQLi расширение установлено
   ✅ PDO MySQL расширение установлено
   
   Рекомендации
   ✅ PHP версия 8.3.33 - отлично!
   ```

**ВАЖНО:** Убедитесь, что:
- ✅ Версия PHP: 8.3.x
- ✅ MySQLi расширение установлено
- ✅ PDO MySQL расширение установлено

---

## ✅ Шаг 5: Тестирование API

### Тест 1: Регистрация пользователя

Откройте **Postman** или **curl** и выполните:

```bash
curl -X POST http://ваш_логин.beget.tech/backend/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "test123",
    "name": "Тестовый Пользователь",
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
    "user": {
      "id": 1,
      "email": "test@example.com",
      "username": "testuser",
      "name": "Тестовый Пользователь",
      "avatar": "👨‍🍳",
      "description": null
    }
  }
}
```

**Сохраните токен** - он понадобится для следующих запросов.

### Тест 2: Вход

```bash
curl -X POST http://ваш_логин.beget.tech/backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "login": "test@example.com",
    "password": "test123"
  }'
```

### Тест 3: Получение профиля

```bash
curl -X GET http://ваш_логин.beget.tech/backend/api/user/profile.php \
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

### Тест 4: Создание семьи

```bash
curl -X POST http://ваш_логин.beget.tech/backend/api/family/create.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -d '{
    "name": "Тестовая семья",
    "avatar": "👨‍👩‍👧‍👦",
    "description": "Наша тестовая семья"
  }'
```

### Тест 5: Создание блюда

```bash
curl -X POST http://ваш_логин.beget.tech/backend/api/recipes/create.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -d '{
    "name": "Тестовое блюдо",
    "description": "Описание блюда",
    "meal_type": "breakfast",
    "image_urls": ["https://example.com/image.jpg"],
    "ingredients": [
      {"name": "Ингредиент 1", "amount": "100", "unit": "г"}
    ]
  }'
```

---

## ✅ Шаг 6: Настройка CORS для Frontend

Откройте файл `backend/config/database.php` и добавьте ваш домен:

```php
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mealpick.vercel.app',
    'http://ваш_логин.beget.tech'  // Добавьте ваш временный домен
]);
```

---

## ✅ Шаг 7: Обновление Frontend

В файле `src/services/api.ts` (создадим отдельно) укажите URL вашего backend:

```typescript
const API_BASE_URL = 'http://ваш_логин.beget.tech/backend/api';
```

---

## 🐛 Решение проблем

### Проблема 1: "Ошибка подключения к базе данных"

**Решение:**
1. Проверьте данные в `backend/config/database.php`
2. Убедитесь, что база данных создана
3. Проверьте имя пользователя и пароль
4. Убедитесь, что пользователь имеет права на базу данных

### Проблема 2: "404 Not Found"

**Решение:**
1. Проверьте правильность пути к файлам
2. Убедитесь, что файлы загружены в правильную папку
3. Проверьте регистр букв в именах файлов (Linux чувствителен к регистру)

### Проблема 3: "CORS error"

**Решение:**
1. Добавьте ваш домен в `ALLOWED_ORIGINS` в `backend/config/database.php`
2. Убедитесь, что `.htaccess` загружен на сервер
3. Проверьте, что Apache модуль `mod_headers` включен

### Проблема 4: "500 Internal Server Error"

**Решение:**
1. Включите отображение ошибок в `backend/config/database.php`:
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```
2. Проверьте логи ошибок PHP
3. Убедитесь, что все расширения PHP установлены

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи ошибок PHP
2. Проверьте логи ошибок MySQL
3. Убедитесь, что все файлы загружены корректно
4. Проверьте права доступа к файлам (644 для файлов, 755 для папок)

---

## ✅ Чек-лист перед запуском

- [ ] Файлы загружены на сервер
- [ ] База данных создана
- [ ] Структура БД импортирована
- [ ] PHP версия 8.3.x
- [ ] Расширения MySQLi и PDO установлены
- [ ] Данные подключения в `config/database.php` верны
- [ ] CORS настроен для frontend
- [ ] API endpoints работают
- [ ] Тестовый пользователь зарегистрирован
- [ ] Frontend подключен к backend

---

**Готово!** 🎉 Ваш backend работает и готов к использованию!
