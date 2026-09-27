<?php
/**
 * API: Назначение статуса пользователю в семье
 * POST /api/family/add-status.php
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
if (empty($data['user_id'])) {
    sendError('ID пользователя обязателен');
}

if (empty($data['title']) || empty($data['emoji'])) {
    sendError('Название и эмодзи статуса обязательны');
}

try {
    $db = getDB();
    
    // Получение семьи пользователя
    $stmt = $db->prepare("
        SELECT f.id, f.owner_id
        FROM families f
        JOIN family_members fm ON f.id = fm.family_id
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    $family = $stmt->fetch();
    
    if (!$family) {
        sendError('Вы не состоите в семье', 404);
    }
    
    // Проверка, является ли пользователь владельцем
    if ($family['owner_id'] != $userId) {
        sendError('Только владелец семьи может назначать статусы', 403);
    }
    
    // Нельзя назначить статус самому себе
    if ($data['user_id'] == $userId) {
        sendError('Нельзя назначить статус самому себе');
    }
    
    // Проверка, что пользователь состоит в семье
    $stmt = $db->prepare("
        SELECT id FROM family_members
        WHERE family_id = ? AND user_id = ? AND status = 'accepted'
    ");
    $stmt->execute([$family['id'], $data['user_id']]);
    if (!$stmt->fetch()) {
        sendError('Пользователь не состоит в этой семье');
    }
    
    // Удаление предыдущего статуса (если есть)
    $stmt = $db->prepare("
        DELETE FROM family_statuses
        WHERE user_id = ? AND family_id = ?
    ");
    $stmt->execute([$data['user_id'], $family['id']]);
    
    // Создание нового статуса
    $stmt = $db->prepare("
        INSERT INTO family_statuses (user_id, family_id, title, emoji, created_by)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $data['user_id'],
        $family['id'],
        $data['title'],
        $data['emoji'],
        $userId
    ]);
    
    sendSuccess([], 'Статус назначен');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
