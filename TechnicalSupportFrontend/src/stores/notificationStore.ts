import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Notification {
  id: string;
  message: string;
  link: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const MAX_NOTIFICATIONS = 50;

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const newNotification: Notification = { ...notification, isRead: false };
        const currentNotifications = get().notifications;
        const updatedNotifications = [newNotification, ...currentNotifications].slice(0, MAX_NOTIFICATIONS);
        
        set({
          notifications: updatedNotifications,
          unreadCount: get().unreadCount + 1,
        });
      },
      markAsRead: (id) => {
        const { notifications, unreadCount } = get();
        const notificationExistsAndIsUnread = notifications.some(n => n.id === id && !n.isRead);

        set({
          notifications: notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: notificationExistsAndIsUnread ? unreadCount - 1 : unreadCount,
        });
      },
      markAllAsRead: () => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
      },
    }),
    {
      name: 'notification-storage', // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage), // Chỉ định localStorage
      // Partialize để chỉ lưu 'notifications', 'unreadCount' sẽ được tính toán lại khi load
      partialize: (state) => ({ notifications: state.notifications }),
      // Rehydrate unreadCount sau khi load từ storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.unreadCount = state.notifications.filter(n => !n.isRead).length;
        }
      }
    }
  )
); 