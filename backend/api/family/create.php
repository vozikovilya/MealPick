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

// Валидация длины названия
if (mb_strlen($data['name']) > 100) {
    sendError('Название семьи не должно превышать 100 символов');
}

try {
    $db = getDB();
    
    // Начинаем транзакцию для атомарности операций
    $db->beginTransaction();
    
    // Проверка, не состоит ли пользователь уже в семье
    $stmt = $db->prepare("
        SELECT f.id FROM families f
        JOIN family_members fm ON f.id = fm.family_id
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    if ($stmt->fetch()) {
        $db->rollBack();
        sendError('Вы уже состоите в семье');
    }
    
    // Генерация уникальной ссылки-приглашения
    $inviteLink = 'https://mealspick.app/join/' . bin2hex(random_bytes(16));
    
    // Создание семьи
    $avatar = mb_substr($data['avatar'] ?? '👨‍👩‍👧‍👦', 0, 10); // Ограничиваем длину аватара
    
    $stmt = $db->prepare("
        INSERT INTO families (name, avatar, description, owner_id, invite_link)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        mb_substr($data['name'], 0, 100), // Ограничиваем длину названия
        $avatar,
        isset($data['description']) ? mb_substr($data['description'], 0, 500) : null,
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
    
    // Коммитим транзакцию
    $db->commit();
    
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
    // Откатываем транзакцию в случае ошибки
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log('Ошибка создания семьи: ' . $e->getMessage());
    sendError('Ошибка сервера', 500);
}
