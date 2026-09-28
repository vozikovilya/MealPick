<?php
/**
 * API: Удаление статуса пользователя в семье
 * DELETE /api/family/remove-status.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

$data = getJsonInput();
$targetUserId = $data['user_id'] ?? null;

if (!$targetUserId) {
    sendError('ID пользователя обязателен');
}

try {
    $db = getDB();
    
    // Проверяем, является ли текущий пользователь главой семьи
    $stmt = $db->prepare("
        SELECT f.id, f.owner_id
        FROM families f
        JOIN family_members fm ON f.id = fm.family_id
        WHERE fm.user_id = ? AND fm.role = 'owner'
    ");
    $stmt->execute([$userId]);
    $family = $stmt->fetch();
    
    if (!$family) {
        sendError('Вы не являетесь главой семьи', 403);
    }
    
    // Проверяем, что целевой пользователь является членом семьи
    $stmt = $db->prepare("
        SELECT id FROM family_members
        WHERE family_id = ? AND user_id = ?
    ");
    $stmt->execute([$family['id'], $targetUserId]);
    $member = $stmt->fetch();
    
    if (!$member) {
        sendError('Пользователь не является членом этой семьи');
    }
    
    // Удаляем статус
    $stmt = $db->prepare("DELETE FROM family_statuses WHERE family_id = ? AND user_id = ?");
    $stmt->execute([$family['id'], $targetUserId]);
    
    sendSuccess([], 'Статус удалён');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
