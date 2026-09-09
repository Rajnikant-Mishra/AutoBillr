import { create } from "zustand";
import {
  getNotificationsAPI,
  createNotificationAPI,
  markNotificationReadAPI,
  markAllReadAPI,
  clearNotificationsAPI,
  deleteNotificationAPI,
  toggleImportantAPI,
} from "../services/notificationService";

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  // Fetch Notifications
  fetchNotifications: async () => {
    try {
      const res = await getNotificationsAPI();
      const rawList = res.data?.notifications || res.data?.data?.notifications || [];

      const formatted = rawList.map((n) => ({
        ...n,
        _id: n.id || n._id,
        id: n.id || n._id,
        isImportant: Boolean(n.isImportant),
      }));

      set({
        notifications: formatted,
        unreadCount: res.data?.unreadCount || formatted.filter((n) => !n.isRead).length,
      });
    } catch (error) {
      console.error("Fetch Notifications Error:", error);
    }
  },

  // Add Notification
  addNotification: async (data) => {
    try {
      const res = await createNotificationAPI(data);
      const notification = res.data?.notification || res.data?.data || {
        ...data,
        id: Date.now().toString(),
        _id: Date.now().toString(),
        createdAt: new Date(),
        isRead: false,
      };

      const normalized = {
        ...notification,
        id: notification.id || notification._id,
        _id: notification._id || notification.id,
        clientName: data.clientName,
        projectName: data.projectName,
        projectBudget: data.projectBudget,
        isImportant: Boolean(notification.isImportant),
      };

      set((state) => ({
        notifications: [normalized, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    } catch (error) {
      console.error("Add Notification Error:", error);
    }
  },

  // Mark Single Read
  markAsRead: async (id) => {
    try {
      const targetId = String(id);
      await markNotificationReadAPI(targetId);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          (n.id === targetId || n._id === targetId)
            ? { ...n, isRead: true }
            : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Mark Read Error:", error);
    }
  },

  // Toggle Read / Unread
  toggleRead: (id) => {
    const targetId = String(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        (n.id === targetId || n._id === targetId)
          ? { ...n, isRead: !n.isRead }
          : n
      ),
    }));
  },

  // Mark All Read
  markAllAsRead: async () => {
    try {
      await markAllReadAPI();

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Mark All Read Error:", error);
    }
  },

  // Mark All Unread
  markAllAsUnread: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: false,
      })),
      unreadCount: state.notifications.length,
    }));
  },

  // Toggle Important (Database + UI sync)
  toggleImportant: async (id) => {
    const targetId = String(id);
    try {
      if (typeof toggleImportantAPI === "function") {
        await toggleImportantAPI(targetId);
      }
    } catch (error) {
      console.error("Toggle Important API Error:", error);
    }

    set((state) => ({
      notifications: state.notifications.map((n) =>
        (n.id === targetId || n._id === targetId)
          ? { ...n, isImportant: !n.isImportant }
          : n
      ),
    }));
  },

  // Remove Single Notification (Database + UI sync)
  removeNotification: async (id) => {
    const targetId = String(id);

    try {
      if (typeof deleteNotificationAPI === "function") {
        await deleteNotificationAPI(targetId);
      }

      set((state) => {
        const itemToRemove = state.notifications.find(
          (n) => n.id === targetId || n._id === targetId
        );
        const wasUnread = itemToRemove && !itemToRemove.isRead;

        return {
          notifications: state.notifications.filter(
            (n) => n.id !== targetId && n._id !== targetId
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      console.error("Remove Notification Error:", error);
    }
  },

  // Clear All Notifications
  clearAll: async () => {
    try {
      await clearNotificationsAPI();

      set({
        notifications: [],
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Clear All Notifications Error:", error);
    }
  },
}));