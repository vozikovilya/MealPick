<?php
/**
 * API: Создание семьи
 * POST /api/family/create.php
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
if (empty($data['name'])) {
    sendError('Название семьи обязательно');
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
    
    // Генерация уникальной ссылки-приглашения
    $inviteLink = 'https://mealspick.app/join/' . bin2hex(random_bytes(16));
    
    // Создание семьи
    $avatar = $data['avatar'] ?? '👨‍👩‍👧‍👦';
    
    $stmt = $db->prepare("
        INSERT INTO families (name, avatar, description, owner_id, invite_link)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $data['name'],
        $avatar,
        $data['description'] ?? null,
        $userId,
        $inviteLink
    ]);
    
    $familyId = $db->lastInsertId();
    
    // Добавление создателя как владельца
    $stmt = $db->prepare("
        INSERT INTO family_members (family_id, user_id, role, status)
        VALUES (?, ?, 'owner', 'accepted')
    ");
    $stmt->execute([$familyId, $userId]);
    
    // Получение данных семьи
    $stmt = $db->prepare("
        SELECT id, name, avatar, description, owner_id, invite_link, created_at
        FROM families
        WHERE id = ?
    ");
    $stmt->execute([$familyId]);
    $family = $stmt->fetch();
    
    sendSuccess(['family' => $family], 'Семья создана');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
