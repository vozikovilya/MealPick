/**
 * Единый типизированный доступ к localStorage.
 * Все ключи хранилища объявлены здесь — компоненты не обращаются
 * к localStorage напрямую.
 */

export const STORAGE_KEYS = {
  authToken: 'auth_token',
  currentScreen: 'currentScreen',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function readStorage(key: StorageKey): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: StorageKey, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage недоступен (приватный режим и т.п.) */
  }
}

export function removeStorage(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}
