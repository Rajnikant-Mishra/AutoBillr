import { create } from "zustand";

import {
  getNotificationsAPI,
  createNotificationAPI,
  markNotificationReadAPI,
  markAllReadAPI,
  clearNotificationsAPI,
} from "../services/notificationService";

export const useNotificationStore =
  create((set, get) => ({
    notifications: [],

    fetchNotifications: async () => {
      const res =
        await getNotificationsAPI();

      set({
        notifications:
          res.data.notifications,
      });
    },

    addNotification: async (data) => {
      const res =
        await createNotificationAPI(
          data
        );

      set((state) => ({
        notifications: [
          res.data.notification,
          ...state.notifications,
        ],
      }));
    },

    markAsRead: async (id) => {
      await markNotificationReadAPI(id);

      set((state) => ({
        notifications:
          state.notifications.map((n) =>
            n._id === id
              ? {
                  ...n,
                  isRead: true,
                }
              : n
          ),
      }));
    },

    markAllAsRead: async () => {
      await markAllReadAPI();

      set((state) => ({
        notifications:
          state.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
      }));
    },

    clearAll: async () => {
      await clearNotificationsAPI();

      set({
        notifications: [],
      });
    },
  }));