<?php
/**
 * API: Получение уведомлений
 * GET /api/notifications/list.php
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
$limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 50;
$offset = ($page - 1) * $limit;

// Фильтры (опционально)
$onlyUnread = isset($_GET['unread']) && $_GET['unread'] === 'true';
$type = isset($_GET['type']) ? $_GET['type'] : null;

try {
    $db = getDB();
    
    // Построение условий запроса
    $where = ["n.user_id = ?"];
    $params = [$userId];
    
    if ($onlyUnread) {
        $where[] = "n.is_read = FALSE";
    }
    
    if ($type) {
        $where[] = "n.type = ?";
        $params[] = $type;
    }
    
    $whereClause = "WHERE " . implode(" AND ", $where);
    
    // Получение общего количества
    $countStmt = $db->prepare("
        SELECT COUNT(*) as total
        FROM notifications n
        $whereClause
    ");
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Получение уведомлений с пагинацией
    $stmt = $db->prepare("
        SELECT n.*, u.name as from_user_name, u.avatar as from_user_avatar
        FROM notifications n
        JOIN users u ON n.from_user_id = u.id
        $whereClause
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $queryParams = array_merge($params, [$limit, $offset]);
    $stmt->execute($queryParams);
    $notifications = $stmt->fetchAll();
    
    // Подсчёт непрочитанных (всех, не только текущей страницы)
    $stmt = $db->prepare("
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = ? AND is_read = FALSE
    ");
    $stmt->execute([$userId]);
    $unreadCount = $stmt->fetch()['count'];
    
    sendSuccess([
        'notifications' => $notifications,
        'unreadCount' => $unreadCount,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Ошибка получения уведомлений: ' . $e->getMessage());
    sendError('Ошибка сервера', 500);
}
