<?php
/**
 * API: Выход участника из семьи
 * POST /api/family/leave.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

try {
    $db = getDB();
    
    // Проверяем, состоит ли пользователь в семье
    $stmt = $db->prepare("
        SELECT fm.id, fm.family_id, fm.role, f.owner_id, f.name
        FROM family_members fm
        JOIN families f ON fm.family_id = f.id
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    $membership = $stmt->fetch();
    
    if (!$membership) {
        sendError('Вы не состоите в семье', 400);
    }
    
    // Глава семьи не может выйти из семьи
    if ($membership['role'] === 'owner') {
        sendError('Глава семьи не может выйти из семьи. Сначала удалите профиль семьи или передайте роль главы другому участнику.', 403);
    }
    
    // Удаляем участника из семьи
    $stmt = $db->prepare("DELETE FROM family_members WHERE id = ?");
    $stmt->execute([$membership['id']]);
    
    sendSuccess([
        'family_name' => $membership['name']
    ], 'Вы вышли из семьи');
    
} catch (Exception $e) {
    error_log('Ошибка выхода из семьи: ' . $e->getMessage());
    sendError('Ошибка сервера', 500);
}
