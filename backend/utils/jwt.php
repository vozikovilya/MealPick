<?php
/**
 * JWT (JSON Web Token) аутентификация
 */

require_once __DIR__ . '/../config/database.php';

class JWT {
    /**
     * Кодирование base64url
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Декодирование base64url
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * Создание JWT токена
     */
    public static function encode($payload) {
        $header = [
            'alg' => JWT_ALGORITHM,
            'typ' => 'JWT'
        ];
        
        // Добавляем время создания и истечения
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRATION;
        
        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return "$headerEncoded.$payloadEncoded.$signatureEncoded";
    }
    
    /**
     * Проверка и декодирование JWT токена
     */
    public static function decode($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
        
        // Проверка подписи
        $signature = self::base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }
        
        // Декодирование payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        
        if (!$payload) {
            return false;
        }
        
        // Проверка истечения срока действия
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
}

/**
 * Аутентификация пользователя
 */
function authenticate() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (empty($authHeader)) {
        sendError('Требуется авторизация', 401);
    }
    
    // Извлекаем токен из заголовка
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        sendError('Неверный формат токена', 401);
    }
    
    // Декодируем токен
    $payload = JWT::decode($token);
    
    if (!$payload || !isset($payload['user_id'])) {
        sendError('Недействительный токен', 401);
    }
    
    return $payload['user_id'];
}

/**
 * Генерация хэша пароля
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
}

/**
 * Проверка пароля
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
