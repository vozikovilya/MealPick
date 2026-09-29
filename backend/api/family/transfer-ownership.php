<?php
/**
 * API: Передача роли главы семьи другому участнику
 * POST /api/family/transfer-ownership.php
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
$newOwnerId = $data['new_owner_id'] ?? null;

if (!$newOwnerId) {
    sendError('ID нового владельца обязателен');
}

if ($newOwnerId == $userId) {
    sendError('Вы уже являетесь владельцем семьи');
}

try {
    $db = getDB();
    
    // Начинаем транзакцию
    $db->beginTransaction();
    
    // Проверяем, является ли текущий пользователь владельцем семьи
    $stmt = $db->prepare("
        SELECT fm.id, fm.family_id, fm.role
        FROM family_members fm
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    $currentMembership = $stmt->fetch();
    
    if (!$currentMembership || $currentMembership['role'] !== 'owner') {
        $db->rollBack();
        sendError('Только владелец семьи может передать роль', 403);
    }
    
    // Проверяем, что новый владелец является участником семьи
    $stmt = $db->prepare("
        SELECT fm.id, fm.role
        FROM family_members fm
        WHERE fm.family_id = ? AND fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$currentMembership['family_id'], $newOwnerId]);
    $newMembership = $stmt->fetch();
    
    if (!$newMembership) {
        $db->rollBack();
        sendError('Указанный пользователь не является участником семьи');
    }
    
    // Понижаем текущего владельца до обычного участника
    $stmt = $db->prepare("UPDATE family_members SET role = 'member' WHERE id = ?");
    $stmt->execute([$currentMembership['id']]);
    
    // Повышаем нового участника до владельца
    $stmt = $db->prepare("UPDATE family_members SET role = 'owner' WHERE id = ?");
    $stmt->execute([$newMembership['id']]);
    
    // Обновляем owner_id в таблице families
    $stmt = $db->prepare("UPDATE families SET owner_id = ? WHERE id = ?");
    $stmt->execute([$newOwnerId, $currentMembership['family_id']]);
    
    // Коммитим транзакцию
    $db->commit();
    
    sendSuccess([], 'Роль владельца передана успешно');
    
} catch (Exception $e) {
    // Откатываем транзакцию в случае ошибки
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('Ошибка передачи роли владельца: ' . $e->getMessage());
    sendError('Ошибка сервера', 500);
}
