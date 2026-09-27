<?php
/**
 * API: Создание блюда
 * POST /api/recipes/create.php
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
    sendError('Название блюда обязательно');
}

if (empty($data['meal_type'])) {
    sendError('Тип приёма пищи обязателен');
}

try {
    $db = getDB();
    
    // Создание блюда
    $stmt = $db->prepare("
        INSERT INTO recipes (
            user_id, name, description, image_urls, video_url,
            meal_type, ingredients, cooking_steps, paired_recipe_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $userId,
        $data['name'],
        $data['description'] ?? null,
        json_encode($data['image_urls'] ?? [], JSON_UNESCAPED_UNICODE),
        $data['video_url'] ?? null,
        $data['meal_type'],
        json_encode($data['ingredients'] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($data['cooking_steps'] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($data['paired_recipe_ids'] ?? [], JSON_UNESCAPED_UNICODE)
    ]);
    
    $recipeId = $db->lastInsertId();
    
    // Получение созданного блюда
    $stmt = $db->prepare("
        SELECT r.*, u.name as author_name, u.avatar as author_avatar
        FROM recipes r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
    ");
    $stmt->execute([$recipeId]);
    $recipe = $stmt->fetch();
    
    // Декодирование JSON полей
    $recipe['image_urls'] = json_decode($recipe['image_urls'], true);
    $recipe['ingredients'] = json_decode($recipe['ingredients'], true);
    $recipe['cooking_steps'] = json_decode($recipe['cooking_steps'], true);
    $recipe['paired_recipe_ids'] = json_decode($recipe['paired_recipe_ids'], true);
    
    sendSuccess(['recipe' => $recipe], 'Блюдо создано');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
