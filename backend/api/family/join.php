<?php
/**
 * API: Присоединение к семье по ссылке-приглашению
 * POST /api/family/join.php
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
if (empty($data['invite_link'])) {
    sendError('Ссылка-приглашение обязательна');
}

try {
    $db = getDB();
    
    // Проверка, не состоит ли пользователь уже в семье
    $stmt = $db->prepare("
        SELECT f.id FROM families f
        JOIN family_members fm ON f.id = fm.family_id
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    if ($stmt->fetch()) {
        sendError('Вы уже состоите в семье');
    }
    
    // Поиск семьи по ссылке-приглашению
    $stmt = $db->prepare("
        SELECT id, owner_id, name
        FROM families
        WHERE invite_link = ?
    ");
    $stmt->execute([$data['invite_link']]);
    $family = $stmt->fetch();
    
    if (!$family) {
        sendError('Неверная ссылка-приглашение');
    }
    
    // Проверка, не отправлял ли пользователь уже заявку
    $stmt = $db->prepare("
        SELECT id FROM family_join_requests
        WHERE family_id = ? AND user_id = ? AND status = 'pending'
    ");
    $stmt->execute([$family['id'], $userId]);
    if ($stmt->fetch()) {
        sendError('Заявка уже отправлена');
    }
    
    // Создание заявки на вступление
    $stmt = $db->prepare("
        INSERT INTO family_join_requests (family_id, user_id, status)
        VALUES (?, ?, 'pending')
    ");
    $stmt->execute([$family['id'], $userId]);
    
    $requestId = $db->lastInsertId();
    
    // Создание уведомления для владельца семьи
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, type, from_user_id, message, family_join_request_id)
        VALUES (?, 'family_join_request', ?, ?, ?)
    ");
    $stmt->execute([
        $family['owner_id'],
        $userId,
        "Пользователь хочет присоединиться к вашей семье",
        $requestId
    ]);
    
    sendSuccess([
        'requestId' => $requestId,
        'familyName' => $family['name']
    ], 'Заявка отправлена');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
