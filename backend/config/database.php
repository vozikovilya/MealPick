<?php
/**
 * Конфигурация базы данных
 */

// Данные для подключения к MySQL
define('DB_HOST', 'localhost');
define('DB_NAME', 'q91929se_base_1');
define('DB_USER', 'q91929se_base_1');
define('DB_PASS', 'Lanceres32rus');
define('DB_CHARSET', 'utf8mb4');

// JWT настройки - ВАЖНО: ключ должен быть ПОСТОЯННЫМ!
define('JWT_SECRET', 'mealpick_secret_key_2024_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400 * 7); // 7 дней в секундах

// CORS настройки
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://q91929se.beget.tech',
    'https://mealpick.vercel.app'
]);

// Отключаем отображение ошибок в production
ini_set('display_errors', 0);
error_reporting(0);

// Логирование ошибок в файл
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Устанавливаем кодировку
header('Content-Type: application/json; charset=utf-8');

/**
 * Подключение к базе данных
 */
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Ошибка подключения к базе данных: ' . $e->getMessage()
            ]);
            exit;
        }
    }
    
    return $pdo;
}

/**
 * CORS middleware
 */
function handleCors() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, ALLOWED_ORIGINS) || $origin === '') {
        header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    
    // Обработка preflight запросов
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Получить JSON данные из запроса
 */
function getJsonInput() {
    $json = file_get_contents('php://input');
    return json_decode($json, true) ?? [];
}

/**
 * Отправить JSON ответ
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Отправить ошибку
 */
function sendError($message, $statusCode = 400) {
    sendResponse([
        'success' => false,
        'message' => $message
    ], $statusCode);
}

/**
 * Отправить успех
 */
function sendSuccess($data = [], $message = 'Успешно') {
    sendResponse([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
}
