<?php
/**
 * API: Получение информации о семье
 * GET /api/family/get.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

try {
    $db = getDB();
    
    // Получение семьи пользователя
    $stmt = $db->prepare("
        SELECT f.id, f.name, f.avatar, f.description, f.owner_id, f.invite_link, f.created_at,
               fm.role
        FROM families f
        JOIN family_members fm ON f.id = fm.family_id
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    $family = $stmt->fetch();
    
    if (!$family) {
        sendSuccess(['family' => null], 'Пользователь не состоит в семье');
    }
    
    // Получение участников семьи
    $stmt = $db->prepare("
        SELECT u.id, u.name, u.avatar, u.email, fm.role, fm.joined_at
        FROM users u
        JOIN family_members fm ON u.id = fm.user_id
        WHERE fm.family_id = ? AND fm.status = 'accepted'
        ORDER BY fm.role DESC, fm.joined_at ASC
    ");
    $stmt->execute([$family['id']]);
    $members = $stmt->fetchAll();
    
    // Получение статусов участников
    $stmt = $db->prepare("
        SELECT fs.user_id, fs.title, fs.emoji
        FROM family_statuses fs
        WHERE fs.family_id = ?
    ");
    $stmt->execute([$family['id']]);
    $statuses = $stmt->fetchAll();
    
    // Добавление статусов к участникам
    foreach ($members as &$member) {
        $status = array_filter($statuses, fn($s) => $s['user_id'] == $member['id']);
        $member['status'] = !empty($status) ? reset($status) : null;
    }
    
    // Получение заявок на вступление (только для владельца)
    $pendingRequests = [];
    if ($family['owner_id'] == $userId) {
        $stmt = $db->prepare("
            SELECT fjr.id, fjr.user_id, fjr.created_at,
                   u.name, u.avatar, u.email
            FROM family_join_requests fjr
            JOIN users u ON fjr.user_id = u.id
            WHERE fjr.family_id = ? AND fjr.status = 'pending'
            ORDER BY fjr.created_at DESC
        ");
        $stmt->execute([$family['id']]);
        $pendingRequests = $stmt->fetchAll();
    }
    
    sendSuccess([
        'family' => $family,
        'members' => $members,
        'pendingRequests' => $pendingRequests
    ]);
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
