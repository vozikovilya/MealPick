<?php
/**
 * API: Ответ на запрос выбора блюд
 * POST /api/swipe/respond.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

$data = getJsonInput();

// Валидация
if (empty($data['request_id'])) {
    sendError('ID запроса обязателен');
}

if (!isset($data['selected_recipe_ids']) || !is_array($data['selected_recipe_ids'])) {
    sendError('Список выбранных блюд обязателен');
}

try {
    $db = getDB();
    
    // Получение запроса
    $stmt = $db->prepare("
        SELECT * FROM swipe_requests
        WHERE id = ?
    ");
    $stmt->execute([$data['request_id']]);
    $request = $stmt->fetch();
    
    if (!$request) {
        sendError('Запрос не найден', 404);
    }
    
    // Обновление запроса
    $responses = json_decode($request['responses'] ?? '{}', true);
    $responses[$userId] = $data['selected_recipe_ids'];
    
    $stmt = $db->prepare("
        UPDATE swipe_requests
        SET status = 'completed', responses = ?
        WHERE id = ?
    ");
    $stmt->execute([
        json_encode($responses, JSON_UNESCAPED_UNICODE),
        $data['request_id']
    ]);
    
    // Создание уведомления для отправителя
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, from_user_id, message, request_id)
        VALUES (?, 'swipe_response', ?, ?, ?)
    ");
    $stmt->execute([
        $request['from_user_id'],
        $userId,
        "Пользователь выбрал блюда",
        $data['request_id']
    ]);
    
    sendSuccess([], 'Ответ отправлен');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
