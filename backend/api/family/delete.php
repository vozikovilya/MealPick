<?php
/**
 * API: Удаление семьи
 * DELETE /api/family/delete.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

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
        sendError('Только владелец может удалить семью', 403);
    }
    
    // Удаление семьи (каскадное удаление связанных записей)
    $stmt = $db->prepare("DELETE FROM families WHERE id = ?");
    $stmt->execute([$family['id']]);
    
    sendSuccess([], 'Семья удалена');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
