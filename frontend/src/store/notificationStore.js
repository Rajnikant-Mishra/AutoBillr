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

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  // 1. Fetch Notifications (Sirf GET karega, clean replace)
  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await getNotificationsAPI();
      const rawList =
        res.data?.notifications || res.data?.data?.notifications || res.data || [];

      const formatted = Array.isArray(rawList)
        ? rawList.map((n) => ({
            ...n,
            _id: String(n.id || n._id),
            id: String(n.id || n._id),
            isImportant: Boolean(n.isImportant),
            isRead: Boolean(n.isRead),
          }))
        : [];

      // Deduplication check
      const uniqueMap = new Map();
      formatted.forEach((n) => {
        if (n._id) uniqueMap.set(n._id, n);
      });
      const uniqueList = Array.from(uniqueMap.values());

      set({
        notifications: uniqueList,
        unreadCount: uniqueList.filter((n) => !n.isRead).length,
      });
    } catch (error) {
      console.error("Fetch Notifications Error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // 2. Add Notification (Crash-proof & logs caller to console)
  addNotification: async (data) => {
    if (!data) return;

    // Console me check karo kaun call kar raha hai reload par
    console.warn("⚠️ Notification trigger detected from:", data);

    const tempId = String(data.id || data._id || `notif-${Date.now()}`);
    const normalized = {
      ...data,
      id: tempId,
      _id: tempId,
      createdAt: data.createdAt || new Date().toISOString(),
      isRead: Boolean(data.isRead),
      isImportant: Boolean(data.isImportant),
    };

    const currentList = get().notifications;
    const exists = currentList.some(
      (n) =>
        n._id === normalized._id ||
        (n.title === normalized.title && n.description === normalized.description)
    );
    if (exists) return;

    // Instant local UI update
    const updatedList = [normalized, ...currentList];
    set({
      notifications: updatedList,
      unreadCount: updatedList.filter((n) => !n.isRead).length,
    });

    try {
      if (typeof createNotificationAPI === "function") {
        const res = await createNotificationAPI(data);
        const saved = res?.data?.notification || res?.data?.data;
        if (saved) {
          const savedId = String(saved.id || saved._id);
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n._id === tempId ? { ...n, ...saved, _id: savedId, id: savedId } : n
            ),
          }));
        }
      }
    } catch (error) {
      console.error("Add Notification API Error:", error);
    }
  },

  // 3. Mark Single Read (Instant UI)
  markAsRead: async (id) => {
    const targetId = String(id);
    const prev = get().notifications;

    const nextNotifications = prev.map((n) =>
      n.id === targetId || n._id === targetId ? { ...n, isRead: true } : n
    );

    set({
      notifications: nextNotifications,
      unreadCount: nextNotifications.filter((n) => !n.isRead).length,
    });

    try {
      if (typeof markNotificationReadAPI === "function") {
        await markNotificationReadAPI(targetId);
      }
    } catch (error) {
      console.error("Mark Read Error:", error);
    }
  },

  // 4. Toggle Read / Unread (Instant UI)
  toggleRead: async (id) => {
    const targetId = String(id);
    const prev = get().notifications;

    const nextNotifications = prev.map((n) =>
      n.id === targetId || n._id === targetId ? { ...n, isRead: !n.isRead } : n
    );

    set({
      notifications: nextNotifications,
      unreadCount: nextNotifications.filter((n) => !n.isRead).length,
    });

    try {
      const target = nextNotifications.find(
        (n) => n.id === targetId || n._id === targetId
      );
      if (target?.isRead && typeof markNotificationReadAPI === "function") {
        await markNotificationReadAPI(targetId);
      }
    } catch (error) {
      console.error("Toggle Read Error:", error);
    }
  },

  // 5. Mark All Read (Instant UI)
  markAllAsRead: async () => {
    const prev = get().notifications;

    set({
      notifications: prev.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    });

    try {
      if (typeof markAllReadAPI === "function") {
        await markAllReadAPI();
      }
    } catch (error) {
      console.error("Mark All Read Error:", error);
    }
  },

  // 6. Mark All Unread (Instant UI)
  markAllAsUnread: () => {
    const prev = get().notifications;
    set({
      notifications: prev.map((n) => ({ ...n, isRead: false })),
      unreadCount: prev.length,
    });
  },

  // 7. Toggle Important (Instant UI)
  toggleImportant: async (id) => {
    const targetId = String(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === targetId || n._id === targetId
          ? { ...n, isImportant: !n.isImportant }
          : n
      ),
    }));

    try {
      if (typeof toggleImportantAPI === "function") {
        await toggleImportantAPI(targetId);
      }
    } catch (error) {
      console.error("Toggle Important Error:", error);
    }
  },

  // 8. Remove Single Notification (Instant UI)
  removeNotification: async (id) => {
    const targetId = String(id);
    const prev = get().notifications;

    const nextNotifications = prev.filter(
      (n) => n.id !== targetId && n._id !== targetId
    );

    set({
      notifications: nextNotifications,
      unreadCount: nextNotifications.filter((n) => !n.isRead).length,
    });

    try {
      if (typeof deleteNotificationAPI === "function") {
        await deleteNotificationAPI(targetId);
      }
    } catch (error) {
      console.error("Remove Notification Error:", error);
    }
  },

  // 9. Clear All (Instant UI)
  clearAll: async () => {
    set({
      notifications: [],
      unreadCount: 0,
    });

    try {
      if (typeof clearNotificationsAPI === "function") {
        await clearNotificationsAPI();
      }
    } catch (error) {
      console.error("Clear All Error:", error);
    }
  },
}));