<?php
/**
 * API: Удаление блюда
 * DELETE /api/recipes/delete.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/jwt.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
    
    // Получение блюда
    $stmt = $db->prepare("SELECT user_id FROM recipes WHERE id = ?");
    $stmt->execute([$data['recipe_id']]);
    $recipe = $stmt->fetch();
    
    if (!$recipe) {
        sendError('Блюдо не найдено', 404);
    }
    
    // Проверка прав на удаление
    $canDelete = false;
    
    // Владелец блюда может удалить
    if ($recipe['user_id'] == $userId) {
        $canDelete = true;
    } else {
        // Глава семьи или поварушка могут удалить
        $stmt = $db->prepare("
            SELECT f.owner_id
            FROM families f
            JOIN family_members fm ON f.id = fm.family_id
            WHERE fm.user_id = ? AND fm.status = 'accepted'
        ");
        $stmt->execute([$userId]);
        $family = $stmt->fetch();
        
        if ($family) {
            // Глава семьи
            if ($family['owner_id'] == $userId) {
                $canDelete = true;
            } else {
                // Поварушка
                $stmt = $db->prepare("
                    SELECT id FROM family_statuses
                    WHERE user_id = ? AND family_id = ? AND title = 'Поварушка'
                ");
                $stmt->execute([$userId, $family['id']]);
                if ($stmt->fetch()) {
                    $canDelete = true;
                }
            }
        }
    }
    
    if (!$canDelete) {
        sendError('У вас нет прав на удаление этого блюда', 403);
    }
    
    // Удаление блюда
    $stmt = $db->prepare("DELETE FROM recipes WHERE id = ?");
    $stmt->execute([$data['recipe_id']]);
    
    sendSuccess([], 'Блюдо удалено');
    
} catch (Exception $e) {
    sendError('Ошибка сервера: ' . $e->getMessage(), 500);
}
