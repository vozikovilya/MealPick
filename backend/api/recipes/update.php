<?php
/**
 * API: Обновление блюда
 * PUT /api/recipes/update.php
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

if (empty($data['recipe_id'])) {
    sendError('ID блюда обязателен');
}

try {
    $db = getDB();
    
    // Проверка, что блюдо существует и принадлежит пользователю
    $stmt = $db->prepare("SELECT user_id FROM recipes WHERE id = ?");
    $stmt->execute([$data['recipe_id']]);
    $recipe = $stmt->fetch();
    
    if (!$recipe) {
        sendError('Блюдо не найдено', 404);
    }
    
    if ($recipe['user_id'] != $userId) {
        sendError('У вас нет прав на редактирование этого блюда', 403);
    }
    
    // Формирование запроса на обновление
    $updates = [];
    $params = [];
    
    $allowedFields = ['name', 'description', 'video_url', 'meal_type'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    // JSON поля
    if (isset($data['image_urls'])) {
        $updates[] = "image_urls = ?";
        $params[] = json_encode($data['image_urls'], JSON_UNESCAPED_UNICODE);
    }
    
    if (isset($data['ingredients'])) {
        $updates[] = "ingredients = ?";
        $params[] = json_encode($data['ingredients'], JSON_UNESCAPED_UNICODE);
    }
    
    if (isset($data['cooking_steps'])) {
        $updates[] = "cooking_steps = ?";
        $params[] = json_encode($data['cooking_steps'], JSON_UNESCAPED_UNICODE);
    }
    
    if (isset($data['paired_recipe_ids'])) {
        $updates[] = "paired_recipe_ids = ?";
        $params[] = json_encode($data['paired_recipe_ids'], JSON_UNESCAPED_UNICODE);
    }
    
    if (empty($updates)) {
        sendError('Нет данных для обновления');
    }
    
    $params[] = $data['recipe_id'];
    
    $stmt = $db->prepare("UPDATE recipes SET " . implode(', ', $updates) . " WHERE id = ?");
    $stmt->execute($params);
    
    // Получение обновлённого блюда
    $stmt = $db->prepare("
        SELECT r.*, u.name as author_name, u.avatar as author_avatar
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    ");
    $stmt->execute([$data['recipe_id']]);
    $recipe = $stmt->fetch();
    
    // Декодирование JSON полей
    $recipe['image_urls'] = json_decode($recipe['image_urls'], true);
    $recipe['ingredients'] = json_decode($recipe['ingredients'], true);
    $recipe['cooking_steps'] = json_decode($recipe['cooking_steps'], true);
    $recipe['paired_recipe_ids'] = json_decode($recipe['paired_recipe_ids'], true);
    
    sendSuccess(['recipe' => $recipe], 'Блюдо обновлено');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
