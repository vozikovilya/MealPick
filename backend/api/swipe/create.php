<?php
/**
 * API: Создание запроса на выбор блюд
 * POST /api/swipe/create.php
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
if (empty($data['recipe_ids']) || !is_array($data['recipe_ids'])) {
    sendError('Список блюд обязателен');
}

if (empty($data['to_user_id']) && empty($data['to_family_id'])) {
    sendError('Укажите получателя (пользователь или семья)');
}

try {
    $db = getDB();
    
    // Создание запроса
    $stmt = $db->prepare("
        INSERT INTO swipe_requests (
            from_user_id, to_user_id, to_family_id, recipe_ids,
            mode, category, message, delivery_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $userId,
        $data['to_user_id'] ?? null,
        $data['to_family_id'] ?? null,
        json_encode($data['recipe_ids'], JSON_UNESCAPED_UNICODE),
        $data['mode'] ?? 'select',
        $data['category'] ?? null,
        $data['message'] ?? null,
        isset($data['delivery_ids']) ? json_encode($data['delivery_ids'], JSON_UNESCAPED_UNICODE) : null
    ]);
    
    $requestId = $db->lastInsertId();
    
    // Создание уведомлений
    if (!empty($data['to_user_id'])) {
        // Уведомление конкретному пользователю
        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, from_user_id, message, sender_message, request_id)
            VALUES (?, 'swipe_request', ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['to_user_id'],
            $userId,
            "Пользователь хочет, чтобы вы выбрали блюда",
            $data['message'] ?? null,
            $requestId
        ]);
    } elseif (!empty($data['to_family_id'])) {
        // Уведомления всем членам семьи
        $stmt = $db->prepare("
            SELECT user_id FROM family_members
            WHERE family_id = ? AND status = 'accepted' AND user_id != ?
        ");
        $stmt->execute([$data['to_family_id'], $userId]);
        $members = $stmt->fetchAll();
        
        foreach ($members as $member) {
            $stmt = $db->prepare("
                INSERT INTO notifications (user_id, type, from_user_id, message, sender_message, request_id)
                VALUES (?, 'swipe_request', ?, ?, ?, ?)
            ");
            $stmt->execute([
                $member['user_id'],
                $userId,
                "Пользователь хочет, чтобы вы выбрали блюда",
                $data['message'] ?? null,
                $requestId
            ]);
        }
    }
    
    sendSuccess(['requestId' => $requestId], 'Запрос отправлен');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
