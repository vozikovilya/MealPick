import { useEffect, useRef } from 'react';

/**
 * Универсальный polling-хук.
 *
 * Заменяет разбросанные по компонентам `setInterval` + ручной cleanup.
 * - Колбэк никогда не «зависает» на устаревшем замыкании (latest-ref паттерн).
 * - Повторный вызов не запускается, пока предыдущий не завершился.
 * - Остановка при `enabled === false` и при размонтировании.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean = true,
  runImmediately: boolean = false,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let running = false;

    const tick = async () => {
      if (running || disposed) return;
      running = true;
      try {
        await callbackRef.current();
      } finally {
        running = false;
      }
    };

    if (runImmediately) {
      void tick();
    }

    const id = setInterval(tick, intervalMs);
    return () => {
      disposed = true;
      clearInterval(id);
    };
  }, [intervalMs, enabled, runImmediately]);
}
