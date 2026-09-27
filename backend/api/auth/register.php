<?php
/**
 * API: Регистрация пользователя
 * POST /api/auth/register.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Метод не разрешён', 405);
}

$data = getJsonInput();

// Валидация
if (empty($data['email']) || empty($data['username']) || empty($data['password']) || empty($data['name'])) {
    sendError('Все поля обязательны');
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    sendError('Неверный формат email');
}

if (strlen($data['password']) < 6) {
    sendError('Пароль должен содержать минимум 6 символов');
}

if (strlen($data['username']) < 3) {
    sendError('Логин должен содержать минимум 3 символа');
}

try {
    $db = getDB();
    
    // Проверка уникальности email
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        sendError('Пользователь с таким email уже существует');
    }
    
    // Проверка уникальности username
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$data['username']]);
    if ($stmt->fetch()) {
        sendError('Пользователь с таким логином уже существует');
    }
    
    // Создание пользователя
    $passwordHash = hashPassword($data['password']);
    $avatar = $data['avatar'] ?? '👤';
    
    $stmt = $db->prepare("
        INSERT INTO users (email, username, password_hash, name, avatar, description)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['email'],
        $data['username'],
        $passwordHash,
        $data['name'],
        $avatar,
        $data['description'] ?? null
    ]);
    
    $userId = $db->lastInsertId();
    
    // Генерация JWT токена
    $token = JWT::encode([
        'user_id' => $userId,
        'email' => $data['email'],
        'username' => $data['username']
    ]);
    
    sendSuccess([
        'token' => $token,
        'user' => [
            'id' => $userId,
            'email' => $data['email'],
            'username' => $data['username'],
            'name' => $data['name'],
            'avatar' => $avatar,
            'description' => $data['description'] ?? null
        ]
    ], 'Регистрация успешна');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
