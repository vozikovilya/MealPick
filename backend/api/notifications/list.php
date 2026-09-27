<?php
/**
 * API: Получение уведомлений
 * GET /api/notifications/list.php
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
    
    // Получение уведомлений пользователя
    $stmt = $db->prepare("
        SELECT n.*, u.name as from_user_name, u.avatar as from_user_avatar
        FROM notifications n
        JOIN users u ON n.from_user_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT 100
    ");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();
    
    // Подсчёт непрочитанных
    $stmt = $db->prepare("
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = ? AND is_read = FALSE
    ");
    $stmt->execute([$userId]);
    $unreadCount = $stmt->fetch()['count'];
    
    sendSuccess([
        'notifications' => $notifications,
        'unreadCount' => $unreadCount
    ]);
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
