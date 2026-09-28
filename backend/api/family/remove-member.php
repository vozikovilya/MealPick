<?php
/**
 * API: Удаление участника из семьи
 * DELETE /api/family/remove-member.php
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
$memberId = $data['member_id'] ?? null;

if (!$memberId) {
    sendError('ID участника обязателен');
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
    
    // Нельзя удалить самого себя
    if ($memberId == $userId) {
        sendError('Нельзя удалить самого себя из семьи');
    }
    
    // Проверяем, что удаляемый пользователь является членом семьи
    $stmt = $db->prepare("
        SELECT id FROM family_members
        WHERE family_id = ? AND user_id = ?
    ");
    $stmt->execute([$family['id'], $memberId]);
    $member = $stmt->fetch();
    
    if (!$member) {
        sendError('Пользователь не является членом этой семьи');
    }
    
    // Удаляем участника из семьи
    $stmt = $db->prepare("DELETE FROM family_members WHERE id = ?");
    $stmt->execute([$member['id']]);
    
    sendSuccess([], 'Участник удалён из семьи');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
