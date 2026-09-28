<?php
/**
 * API: Получение профиля пользователя
 * GET /api/user/profile.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

try {
    $db = getDB();
    
    // Получение данных пользователя
    $stmt = $db->prepare("
        SELECT id, email, username, name, avatar, description, created_at
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('Пользователь не найден', 404);
    }
    
    // Получение информации о семье
    $stmt = $db->prepare("
        SELECT f.id, f.name, f.avatar, f.description, f.owner_id, f.invite_link, f.created_at, fm.role
        FROM families f
        JOIN family_members fm ON f.id = fm.family_id
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    $family = $stmt->fetch();
    
    // Получение статуса в семье
    $status = null;
    if ($family) {
        $stmt = $db->prepare("
            SELECT title, emoji
            FROM family_statuses
            WHERE user_id = ? AND family_id = ?
        ");
        $stmt->execute([$userId, $family['id']]);
        $status = $stmt->fetch();
    }
    
    sendSuccess([
        'user' => $user,
        'family' => $family,
        'status' => $status
    ]);
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
