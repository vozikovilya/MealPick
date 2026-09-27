<?php
/**
 * API: Обработка заявки на вступление в семью
 * POST /api/family/respond-request.php
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
    sendError('ID заявки обязателен');
}

if (!isset($data['accept'])) {
    sendError('Параметр accept обязателен');
}

try {
    $db = getDB();
    
    // Получение заявки
    $stmt = $db->prepare("
        SELECT fjr.*, f.owner_id
        FROM family_join_requests fjr
        JOIN families f ON fjr.family_id = f.id
        WHERE fjr.id = ?
    ");
    $stmt->execute([$data['request_id']]);
    $request = $stmt->fetch();
    
    if (!$request) {
        sendError('Заявка не найдена', 404);
    }
    
    // Проверка, является ли пользователь владельцем семьи
    if ($request['owner_id'] != $userId) {
        sendError('Только владелец семьи может обрабатывать заявки', 403);
    }
    
    $status = $data['accept'] ? 'accepted' : 'rejected';
    
    // Обновление статуса заявки
    $stmt = $db->prepare("
        UPDATE family_join_requests
        SET status = ?, processed_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$status, $data['request_id']]);
    
    // Если заявка принята - добавляем пользователя в семью
    if ($status === 'accepted') {
        $stmt = $db->prepare("
            INSERT INTO family_members (family_id, user_id, role, status)
            VALUES (?, ?, 'member', 'accepted')
        ");
        $stmt->execute([$request['family_id'], $request['user_id']]);
    }
    
    // Создание уведомления для заявителя
    $message = $status === 'accepted' 
        ? 'Ваша заявка на вступление в семью принята'
        : 'Ваша заявка на вступление в семью отклонена';
    
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, from_user_id, message, family_join_request_id)
        VALUES (?, 'family_join_response', ?, ?, ?)
    ");
    $stmt->execute([
        $request['user_id'],
        $userId,
        $message,
        $data['request_id']
    ]);
    
    sendSuccess([], $status === 'accepted' ? 'Заявка принята' : 'Заявка отклонена');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
