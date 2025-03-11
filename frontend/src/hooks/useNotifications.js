import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotifications = (eventType) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(eventType, (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => unsubscribe();
  }, [eventType]);

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, clearNotification };
}; 