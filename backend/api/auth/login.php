<?php
/**
 * API: Вход пользователя
 * POST /api/auth/login.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Метод не разрешён', 405);
}

$data = getJsonInput();

// Валидация
if (empty($data['login']) || empty($data['password'])) {
    sendError('Email/логин и пароль обязательны');
}

try {
    $db = getDB();
    
    // Поиск пользователя по email или username
    $stmt = $db->prepare("
        SELECT id, email, username, password_hash, name, avatar, description
        FROM users
        WHERE email = ? OR username = ?
    ");
    $stmt->execute([$data['login'], $data['login']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('Пользователь не найден');
    }
    
    // Проверка пароля
    if (!verifyPassword($data['password'], $user['password_hash'])) {
        sendError('Неверный пароль');
    }
    
    // Генерация JWT токена
    $token = JWT::encode([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'username' => $user['username']
    ]);
    
    sendSuccess([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'name' => $user['name'],
            'avatar' => $user['avatar'],
            'description' => $user['description']
        ]
    ], 'Вход выполнен');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
