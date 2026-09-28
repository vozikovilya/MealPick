<?php
/**
 * API: Назначение роли участнику семьи
 * POST /api/family/assign-role.php
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
$targetUserId = $data['user_id'] ?? null;
$role = $data['role'] ?? null;

if (!$targetUserId || !$role) {
    sendError('ID пользователя и роль обязательны');
}

// Валидация роли
$validRoles = ['owner', 'chef', 'member'];
if (!in_array($role, $validRoles)) {
    sendError('Недопустимая роль');
}

try {
    $db = getDB();
    
    // Проверяем, является ли текущий пользователь владельцем семьи
    $stmt = $db->prepare("
        SELECT f.id, f.owner_id
        FROM families f
        JOIN family_members fm ON f.id = fm.family_id
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    $family = $stmt->fetch();
    
    if (!$family) {
        sendError('Вы не состоите в семье', 403);
    }
    
    if ($family['owner_id'] != $userId) {
        sendError('Только владелец семьи может назначать роли', 403);
    }
    
    // Нельзя изменить роль владельца
    if ($targetUserId == $family['owner_id']) {
        sendError('Нельзя изменить роль владельца семьи');
    }
    
    // Проверяем, что целевой пользователь является членом семьи
    $stmt = $db->prepare("
        SELECT id FROM family_members
        WHERE family_id = ? AND user_id = ? AND status = 'accepted'
    ");
    $stmt->execute([$family['id'], $targetUserId]);
    $member = $stmt->fetch();
    
    if (!$member) {
        sendError('Пользователь не является членом семьи');
    }
    
    // Обновляем роль
    $stmt = $db->prepare("UPDATE family_members SET role = ? WHERE id = ?");
    $stmt->execute([$role, $member['id']]);
    
    sendSuccess([], 'Роль назначена');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
