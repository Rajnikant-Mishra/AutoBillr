// src/components/notifications/NotificationDrawer.jsx

import { useMemo, useState } from "react";
import RightDrawer from "../layout/RightDrawer";
import NotificationTabs from "./NotificationTabs";
import NotificationCard from "./NotificationCard";
import NotificationEmpty from "./NotificationEmpty";
import Button from "../ui/Button";
import { useNotificationStore } from "../../store/notificationStore.js";

export default function NotificationDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("all");

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    markAllAsUnread,
    toggleImportant,
    toggleRead,
    removeNotification,
    clearAll,
  } = useNotificationStore();

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "important":
        return notifications.filter((n) => n.isImportant);
      case "read":
        return notifications.filter((n) => n.isRead);
      case "mentions":
        return notifications.filter((n) =>
          ["warning", "automation", "overdue"].includes(n.type)
        );
      default:
        return notifications;
    }
  }, [activeTab, notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasNotifications = notifications.length > 0;
  const allRead = unreadCount === 0;
  const allUnread = unreadCount === notifications.length;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      icon="notifications"
      width="max-w-xl"
    >
      <div className="flex flex-col h-full min-h-0">
        {/* Tabs */}
        <NotificationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
        />

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-4 py-1 -mx-1 px-1">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                markAsRead={markAsRead}
                toggleRead={toggleRead}
                toggleImportant={toggleImportant}
                removeNotification={removeNotification}
              />
            ))
          ) : (
            <NotificationEmpty />
          )}
        </div>

        {/* Footer */}
        <div className="pt-5 mt-5 border-t border-border-light shrink-0">
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={allRead || !hasNotifications}
                onClick={markAllAsRead}
              >
                Mark All Read
              </Button>

              <Button
                size="sm"
                variant="secondary"
                disabled={allUnread || !hasNotifications}
                onClick={markAllAsUnread}
              >
                Mark All Unread
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!hasNotifications}
                onClick={clearAll}
              >
                Clear All
              </Button>

              <Button size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}