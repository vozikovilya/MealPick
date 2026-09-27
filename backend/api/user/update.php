<?php
/**
 * API: Обновление профиля пользователя
 * PUT /api/user/update.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

$data = getJsonInput();

try {
    $db = getDB();
    
    // Проверка уникальности email (если меняется)
    if (isset($data['email'])) {
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            sendError('Неверный формат email');
        }
        
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$data['email'], $userId]);
        if ($stmt->fetch()) {
            sendError('Email уже используется');
        }
    }
    
    // Проверка уникальности username (если меняется)
    if (isset($data['username'])) {
        if (strlen($data['username']) < 3) {
            sendError('Логин должен содержать минимум 3 символа');
        }
        
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$data['username'], $userId]);
        if ($stmt->fetch()) {
            sendError('Логин уже используется');
        }
    }
    
    // Формирование запроса на обновление
    $updates = [];
    $params = [];
    
    $allowedFields = ['name', 'avatar', 'description', 'email', 'username'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    // Обновление пароля (если указан)
    if (isset($data['password']) && !empty($data['password'])) {
        if (strlen($data['password']) < 6) {
            sendError('Пароль должен содержать минимум 6 символов');
        }
        $updates[] = "password_hash = ?";
        $params[] = hashPassword($data['password']);
    }
    
    if (empty($updates)) {
        sendError('Нет данных для обновления');
    }
    
    $params[] = $userId;
    
    $stmt = $db->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?");
    $stmt->execute($params);
    
    // Получение обновлённых данных
    $stmt = $db->prepare("
        SELECT id, email, username, name, avatar, description
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    sendSuccess(['user' => $user], 'Профиль обновлён');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
