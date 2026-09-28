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

// Параметры пагинации
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50; // Максимум 100 записей
$offset = ($page - 1) * $limit;

// Фильтр по типу блюда (опционально)
$mealType = isset($_GET['meal_type']) ? $_GET['meal_type'] : null;

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
    
    // Построение базового запроса
    $where = [];
    $params = [];
    
    if ($family) {
        // Если пользователь в семье - получаем блюда всех участников
        $where[] = "fm.family_id = ?";
        $params[] = $family['id'];
        $where[] = "fm.status = 'accepted'";
        
        $baseQuery = "
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            JOIN family_members fm ON u.id = fm.user_id
        ";
    } else {
        // Если не в семье - только свои блюда
        $where[] = "r.user_id = ?";
        $params[] = $userId;
        
        $baseQuery = "
            FROM recipes r
            JOIN users u ON r.user_id = u.id
        ";
    }
    
    // Добавление фильтра по типу блюда
    if ($mealType) {
        $where[] = "r.meal_type = ?";
        $params[] = $mealType;
    }
    
    $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    
    // Получение общего количества записей
    $countStmt = $db->prepare("SELECT COUNT(*) as total $baseQuery $whereClause");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Получение блюд с пагинацией
    $stmt = $db->prepare("
        SELECT r.*, u.name as author_name, u.avatar as author_avatar
        $baseQuery
        $whereClause
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $queryParams = array_merge($params, [$limit, $offset]);
    $stmt->execute($queryParams);
    $recipes = $stmt->fetchAll();
    
    // Декодирование JSON полей
    foreach ($recipes as &$recipe) {
        $recipe['image_urls'] = json_decode($recipe['image_urls'] ?? '[]', true);
        $recipe['ingredients'] = json_decode($recipe['ingredients'] ?? '[]', true);
        $recipe['cooking_steps'] = json_decode($recipe['cooking_steps'] ?? '[]', true);
        $recipe['paired_recipe_ids'] = json_decode($recipe['paired_recipe_ids'] ?? '[]', true);
    }
    
    sendSuccess([
        'recipes' => $recipes,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Ошибка получения списка блюд: ' . $e->getMessage());
    sendError('Ошибка сервера', 500);
}
