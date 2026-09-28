<?php
/**
 * API: Обновление информации о семье
 * PUT /api/family/update.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

$data = getJsonInput();

// Валидация
if (empty($data['name']) && empty($data['avatar'])) {
    sendError('Необходимо указать название или аватар');
}

try {
    $db = getDB();
    
    // Проверяем, является ли пользователь владельцем семьи
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
    
    // Формируем запрос на обновление
    $updates = [];
    $params = [];
    
    if (!empty($data['name'])) {
        if (mb_strlen($data['name']) > 100) {
            sendError('Название семьи не должно превышать 100 символов');
        }
        $updates[] = "name = ?";
        $params[] = mb_substr($data['name'], 0, 100);
    }
    
    if (!empty($data['avatar'])) {
        $updates[] = "avatar = ?";
        $params[] = mb_substr($data['avatar'], 0, 10);
    }
    
    if (empty($updates)) {
        sendError('Нет данных для обновления');
    }
    
    $params[] = $family['id'];
    
    $stmt = $db->prepare("UPDATE families SET " . implode(', ', $updates) . " WHERE id = ?");
    $stmt->execute($params);
    
    // Получаем обновлённую информацию о семье
    $stmt = $db->prepare("
        SELECT id, name, avatar, description, owner_id, invite_link, created_at
        FROM families
        WHERE id = ?
    ");
    $stmt->execute([$family['id']]);
    $updatedFamily = $stmt->fetch();
    
    sendSuccess(['family' => $updatedFamily], 'Семья обновлена');
    
} catch (Exception $e) {
    error_log('Ошибка обновления семьи: ' . $e->getMessage());
    sendError('Ошибка сервера', 500);
}
