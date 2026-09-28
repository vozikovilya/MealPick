<?php
/**
 * API: Получение запроса на выбор блюд
 * GET /api/swipe/get.php?id={requestId}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Метод не разрешён', 405);
}

// Аутентификация
$userId = authenticate();

$requestId = $_GET['id'] ?? null;
if (!$requestId) {
    sendError('ID запроса обязателен');
}

try {
    $db = getDB();
    
    // Получение запроса
    $stmt = $db->prepare("
        SELECT sr.*, 
               u_from.name as from_user_name,
               u_from.avatar as from_user_avatar
        FROM swipe_requests sr
        JOIN users u_from ON sr.from_user_id = u_from.id
        WHERE sr.id = ?
    ");
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();
    
    if (!$request) {
        sendError('Запрос не найден', 404);
    }
    
    // Проверка, что пользователь имеет доступ к этому запросу
    $hasAccess = false;
    if ($request['from_user_id'] == $userId) {
        $hasAccess = true;
    } elseif ($request['to_user_id'] == $userId) {
        $hasAccess = true;
    } elseif ($request['to_family_id']) {
        // Проверяем, является ли пользователь членом семьи
        $stmt = $db->prepare("
            SELECT id FROM family_members
            WHERE family_id = ? AND user_id = ? AND status = 'accepted'
        ");
        $stmt->execute([$request['to_family_id'], $userId]);
        if ($stmt->fetch()) {
            $hasAccess = true;
        }
    }
    
    if (!$hasAccess) {
        sendError('У вас нет доступа к этому запросу', 403);
    }
    
    // Декодирование JSON полей
    $request['recipe_ids'] = json_decode($request['recipe_ids'] ?? '[]', true);
    $request['delivery_ids'] = json_decode($request['delivery_ids'] ?? '[]', true);
    $request['responses'] = json_decode($request['responses'] ?? '{}', true);
    
    // Получение рецептов
    $recipes = [];
    if (!empty($request['recipe_ids'])) {
        $placeholders = implode(',', array_fill(0, count($request['recipe_ids']), '?'));
        $stmt = $db->prepare("
            SELECT r.*, u.name as author_name, u.avatar as author_avatar
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            WHERE r.id IN ($placeholders)
        ");
        $stmt->execute($request['recipe_ids']);
        $recipes = $stmt->fetchAll();
        
        // Декодирование JSON полей рецептов
        foreach ($recipes as &$recipe) {
            $recipe['image_urls'] = json_decode($recipe['image_urls'] ?? '[]', true);
            $recipe['ingredients'] = json_decode($recipe['ingredients'] ?? '[]', true);
            $recipe['cooking_steps'] = json_decode($recipe['cooking_steps'] ?? '[]', true);
            $recipe['paired_recipe_ids'] = json_decode($recipe['paired_recipe_ids'] ?? '[]', true);
        }
    }
    
    // Получение информации о доставках (если есть)
    $deliveries = [];
    if (!empty($request['delivery_ids'])) {
        // Здесь можно добавить логику для получения информации о доставках
        // Пока возвращаем пустой массив
    }
    
    // Получение информации о членах семьи (если запрос отправлен всей семье)
    $familyMembers = [];
    if (!empty($request['to_family_id'])) {
        $stmt = $db->prepare("
            SELECT u.id, u.name, u.avatar
            FROM users u
            JOIN family_members fm ON u.id = fm.user_id
            WHERE fm.family_id = ? AND fm.status = 'accepted'
        ");
        $stmt->execute([$request['to_family_id']]);
        $familyMembers = $stmt->fetchAll();
    }
    
    // Получение информации о получателе (если запрос отправлен конкретному пользователю)
    $toUser = null;
    if (!empty($request['to_user_id'])) {
        $stmt = $db->prepare("
            SELECT id, name, avatar
            FROM users
            WHERE id = ?
        ");
        $stmt->execute([$request['to_user_id']]);
        $toUser = $stmt->fetch();
    }
    
    sendSuccess([
        'request' => $request,
        'recipes' => $recipes,
        'deliveries' => $deliveries,
        'family_members' => $familyMembers,
        'to_user' => $toUser,
    ]);
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
