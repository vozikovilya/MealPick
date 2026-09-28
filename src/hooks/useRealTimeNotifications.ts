import { useEffect, useRef } from 'react';
import * as api from '../services/api';

interface UseRealTimeNotificationsProps {
  onNewSwipeRequest?: (requestId: number, fromUserName: string) => void;
  onNewSwipeResponse?: (requestId: number, fromUserName: string) => void;
  interval?: number; // Интервал проверки в миллисекундах (по умолчанию 5000 = 5 секунд)
  enabled?: boolean; // Включено ли отслеживание
}

export function useRealTimeNotifications({
  onNewSwipeRequest,
  onNewSwipeResponse,
  interval = 5000,
  enabled = true,
}: UseRealTimeNotificationsProps) {
  const lastCheckRef = useRef<number>(Date.now());
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!enabled || !api.isAuthenticated()) {
      return;
    }

    const checkForNewNotifications = async () => {
      if (isRunningRef.current) {
        return; // Предотвращаем параллельные запросы
      }

      try {
        isRunningRef.current = true;
        const response = await api.getNotifications();
        const notifications = response.data.notifications;

        // Фильтруем только новые уведомления
        const newNotifications = notifications.filter(
          (n: any) => new Date(n.created_at).getTime() > lastCheckRef.current
        );

        if (newNotifications.length > 0) {
          // Обрабатываем каждое новое уведомление
          newNotifications.forEach((notification: any) => {
            if (notification.type === 'swipe_request' && onNewSwipeRequest) {
              onNewSwipeRequest(notification.request_id, notification.from_user_name);
            } else if (notification.type === 'swipe_response' && onNewSwipeResponse) {
              onNewSwipeResponse(notification.request_id, notification.from_user_name);
            }
          });
        }

        lastCheckRef.current = Date.now();
      } catch (error) {
        console.error('Ошибка проверки уведомлений:', error);
      } finally {
        isRunningRef.current = false;
      }
    };

    // Запускаем проверку сразу
    checkForNewNotifications();

    // Устанавливаем интервал проверки
    const intervalId = setInterval(checkForNewNotifications, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [onNewSwipeRequest, onNewSwipeResponse, interval, enabled]);
}
