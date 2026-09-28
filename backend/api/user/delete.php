<?php
/**
 * API: Удаление аккаунта пользователя
 * DELETE /api/user/delete.php
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
    
    // Проверяем, является ли пользователь главой семьи
    $stmt = $db->prepare("
        SELECT f.id, f.name
        FROM families f
        WHERE f.owner_id = ?
    ");
    $stmt->execute([$userId]);
    $family = $stmt->fetch();
    
    if ($family) {
        sendError("Нельзя удалить аккаунт, пока вы являетесь создателем семьи \"{$family['name']}\". Сначала удалите профиль семьи или передайте права другому участнику.", 403);
    }
    
    // Удаляем пользователя (каскадное удаление удалит все связанные данные)
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    sendSuccess([], 'Аккаунт удалён');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
