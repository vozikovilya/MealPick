<?php
/**
 * API: Обновление статуса уведомлений
 * PUT /api/notifications/update.php
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
    
    // Обновление одного уведомления
    if (isset($data['notification_id'])) {
        $stmt = $db->prepare("
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$data['notification_id'], $userId]);
    }
    
    // Обновление нескольких уведомлений
    if (isset($data['notification_ids']) && is_array($data['notification_ids'])) {
        $placeholders = implode(',', array_fill(0, count($data['notification_ids']), '?'));
        $params = array_merge($data['notification_ids'], [$userId]);
        
        $stmt = $db->prepare("
            UPDATE notifications
            SET is_read = TRUE
            WHERE id IN ($placeholders) AND user_id = ?
        ");
        $stmt->execute($params);
    }
    
    // Обновление всех уведомлений
    if (isset($data['mark_all_read']) && $data['mark_all_read']) {
        $stmt = $db->prepare("
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
    }
    
    // Удаление уведомлений
    if (isset($data['delete_ids']) && is_array($data['delete_ids'])) {
        $placeholders = implode(',', array_fill(0, count($data['delete_ids']), '?'));
        $params = array_merge($data['delete_ids'], [$userId]);
        
        $stmt = $db->prepare("
            DELETE FROM notifications
            WHERE id IN ($placeholders) AND user_id = ?
        ");
        $stmt->execute($params);
    }
    
    sendSuccess([], 'Уведомления обновлены');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
