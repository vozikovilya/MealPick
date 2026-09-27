<?php
/**
 * API: Получение списка блюд
 * GET /api/recipes/list.php
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
        SELECT f.id
        FROM families f
        JOIN family_members fm ON f.id = fm.family_id
        WHERE fm.user_id = ? AND fm.status = 'accepted'
    ");
    $stmt->execute([$userId]);
    $family = $stmt->fetch();
    
    // Получение блюд
    if ($family) {
        // Если пользователь в семье - получаем блюда всех участников
        $stmt = $db->prepare("
            SELECT r.*, u.name as author_name, u.avatar as author_avatar
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            JOIN family_members fm ON u.id = fm.user_id
            WHERE fm.family_id = ? AND fm.status = 'accepted'
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$family['id']]);
    } else {
        // Если не в семье - только свои блюда
        $stmt = $db->prepare("
            SELECT r.*, u.name as author_name, u.avatar as author_avatar
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$userId]);
    }
    
    $recipes = $stmt->fetchAll();
    
    // Декодирование JSON полей
    foreach ($recipes as &$recipe) {
        $recipe['image_urls'] = json_decode($recipe['image_urls'] ?? '[]', true);
        $recipe['ingredients'] = json_decode($recipe['ingredients'] ?? '[]', true);
        $recipe['cooking_steps'] = json_decode($recipe['cooking_steps'] ?? '[]', true);
        $recipe['paired_recipe_ids'] = json_decode($recipe['paired_recipe_ids'] ?? '[]', true);
    }
    
    sendSuccess(['recipes' => $recipes]);
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
