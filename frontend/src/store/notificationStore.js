import { create } from "zustand";

import {
  getNotificationsAPI,
  createNotificationAPI,
  markNotificationReadAPI,
  markAllReadAPI,
  clearNotificationsAPI,
} from "../services/notificationService";

export const useNotificationStore = create((set) => ({
  notifications: [],

  // Fetch Notifications
  fetchNotifications: async () => {
    try {
      const res = await getNotificationsAPI();

      set({
        notifications: res.data.notifications.map((n) => ({
          ...n,
          isImportant: n.isImportant || false,
        })),
      });
    } catch (error) {
      console.error("Fetch Notifications Error:", error);
    }
  },

  // Add Notification
 addNotification: async (data) => {
  try {
    // Save into database
    const res = await createNotificationAPI(data);

    // Notification returned by backend
    const notification = res.data.notification || {
      ...data,
      _id: Date.now().toString(),
      createdAt: new Date(),
      isRead: false,
    };

    set((state) => ({
      notifications: [
        {
          ...notification,
          clientName: data.clientName,
          projectName: data.projectName,
          projectBudget: data.projectBudget,
          isImportant: notification.isImportant || false,
        },
        ...state.notifications,
      ],
    }));
  } catch (error) {
    console.error(error);
  }
},

  // Mark Single Read
  markAsRead: async (id) => {
    try {
      await markNotificationReadAPI(id);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id
            ? {
                ...n,
                isRead: true,
              }
            : n
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  },

  // Toggle Read / Unread
  toggleRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id
          ? {
              ...n,
              isRead: !n.isRead,
            }
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
      }));
    } catch (error) {
      console.error(error);
    }
  },

  // Mark All Unread
  markAllAsUnread: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: false,
      })),
    }));
  },

  // Toggle Important
  toggleImportant: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id
          ? {
              ...n,
              isImportant: !n.isImportant,
            }
          : n
      ),
    }));
  },

  // Remove Single Notification
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n._id !== id
      ),
    }));
  },

  // Clear All Notifications
  clearAll: async () => {
    try {
      await clearNotificationsAPI();

      set({
        notifications: [],
      });
    } catch (error) {
      console.error(error);
    }
  },
}));