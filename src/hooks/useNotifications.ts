'use client';

import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch {
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== 'granted') return;

      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    },
    [isSupported, permission]
  );

  const scheduleReminder = useCallback(
    (habitName: string, timeString: string) => {
      if (!isSupported || permission !== 'granted') return null;

      const [hours, minutes] = timeString.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        sendNotification(`Time for: ${habitName}`, {
          body: "Don't break your streak! Complete this habit now.",
          tag: habitName,
        });
      }, delay);

      return timeoutId;
    },
    [isSupported, permission, sendNotification]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    scheduleReminder,
  };
}
