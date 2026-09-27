// Утилиты безопасности

/**
 * Простое хэширование пароля (для демо-версии)
 * В production используйте bcrypt или argon2
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Простое хэширование для демо (НЕ использовать в production!)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Проверка хэша пароля
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

/**
 * Санитизация пользовательского ввода
 * Удаляет потенциально опасные символы и скрипты
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Удалить HTML теги
    .replace(/javascript:/gi, '') // Удалить javascript: протокол
    .replace(/on\w+\s*=/gi, '') // Удалить event handlers (onclick, onload, etc.)
    .replace(/data:/gi, '') // Удалить data: протокол
    .replace(/vbscript:/gi, '') // Удалить vbscript: протокол
    .trim();
};

/**
 * Валидация email адреса
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Валидация пароля
 * Минимум 6 символов, хотя бы одна буква и одна цифра
 */
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Пароль должен содержать минимум 6 символов' };
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы одну букву' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Пароль должен содержать хотя бы одну цифру' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Валидация имени пользователя
 */
export const validateUsername = (username: string): { valid: boolean; message: string } => {
  if (username.length < 3) {
    return { valid: false, message: 'Логин должен содержать минимум 3 символа' };
  }
  
  if (username.length > 20) {
    return { valid: false, message: 'Логин не должен превышать 20 символов' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: 'Логин может содержать только буквы, цифры, _ и -' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Валидация загружаемого файла
 */
export const validateFile = (file: File): { valid: boolean; message: string } => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  
  // Проверка размера
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      message: `Файл "${file.name}" слишком большой (${sizeMB} MB). Максимум: 5 MB` 
    };
  }
  
  // Проверка типа
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      message: `Недопустимый тип файла "${file.name}". Разрешены: JPEG, PNG, WebP, GIF, MP4, WebM` 
    };
  }
  
  // Дополнительная проверка расширения
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'];
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { 
      valid: false, 
      message: `Недопустимое расширение файла "${file.name}"` 
    };
  }
  
  return { valid: true, message: '' };
};

/**
 * Rate limiter для защиты от brute force атак
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private lockoutDuration: number; // в миллисекундах
  
  constructor(maxAttempts: number = 5, lockoutDuration: number = 30000) {
    this.maxAttempts = maxAttempts;
    this.lockoutDuration = lockoutDuration;
  }
  
  /**
   * Проверить, разрешена ли попытка
   */
  canAttempt(key: string): { allowed: boolean; message: string; remainingTime?: number } {
    const record = this.attempts.get(key);
    
    if (!record) {
      return { allowed: true, message: '' };
    }
    
    const now = Date.now();
    const timeSinceLastAttempt = now - record.lastAttempt;
    
    // Если прошло достаточно времени, сбросить счетчик
    if (timeSinceLastAttempt > this.lockoutDuration) {
      this.attempts.delete(key);
      return { allowed: true, message: '' };
    }
    
    // Если превышен лимит попыток
    if (record.count >= this.maxAttempts) {
      const remainingTime = Math.ceil((this.lockoutDuration - timeSinceLastAttempt) / 1000);
      return { 
        allowed: false, 
        message: `Слишком много попыток. Подождите ${remainingTime} сек.`,
        remainingTime
      };
    }
    
    return { allowed: true, message: '' };
  }
  
  /**
   * Зарегистрировать попытку
   */
  recordAttempt(key: string): void {
    const record = this.attempts.get(key);
    const now = Date.now();
    
    if (!record) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
    } else {
      record.count += 1;
      record.lastAttempt = now;
    }
  }
  
  /**
   * Сбросить счетчик для ключа
   */
  resetAttempts(key: string): void {
    this.attempts.delete(key);
  }
  
  /**
   * Очистить все записи
   */
  clearAll(): void {
    this.attempts.clear();
  }
}

// Глобальный rate limiter для авторизации
export const authRateLimiter = new RateLimiter(5, 30000); // 5 попыток, 30 секунд блокировки

/**
 * Генерация безопасного токена
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Проверка безопасности URL
 */
export const isUrlSafe = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    
    // Разрешенные протоколы
    const allowedProtocols = ['http:', 'https:', 'data:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Запрещенные домены (пример)
    const blockedDomains = ['evil.com', 'malware.com'];
    if (blockedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Экранирование HTML символов
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};
