<?php
/**
 * API: Получение текущего запроса на вступление пользователя
 * GET /api/family/my-request.php
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
    
    // Получение текущего запроса на вступление пользователя
    $stmt = $db->prepare("
        SELECT fjr.id, fjr.family_id, fjr.user_id, fjr.status, fjr.created_at,
               f.name as family_name, f.avatar as family_avatar
        FROM family_join_requests fjr
        JOIN families f ON fjr.family_id = f.id
        WHERE fjr.user_id = ? AND fjr.status = 'pending'
        ORDER BY fjr.created_at DESC
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $request = $stmt->fetch();
    
    if (!$request) {
        sendSuccess(['request' => null], 'Нет активных запросов');
    }
    
    sendSuccess(['request' => $request]);
    
} catch (Exception $e) {
    error_log('Ошибка получения запроса на вступление: ' . $e->getMessage());
    sendError('Ошибка сервера', 500);
}
