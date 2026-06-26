import React, {
  useState,
  useMemo,
  useEffect,
} from "react";
import RightDrawer from "../layout/RightDrawer";
import { useNotificationStore } from "../../store/notificationStore";

export default function NotificationDrawer({
  isOpen,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("all");

 const {
  notifications,
  fetchNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearAll,
} = useNotificationStore();

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);

      case "mentions":
        return notifications.filter((n) =>
          ["overdue", "automation", "warning"].includes(
            n.type
          )
        );

      default:
        return notifications;
    }
  }, [activeTab, notifications]);

useEffect(() => {
  if (isOpen) {
    fetchNotifications();
  }
}, [isOpen, fetchNotifications]);

  const unreadCount = useMemo(
  () =>
    notifications.filter(
      (n) => !n.isRead
    ).length,
  [notifications]
);

  const handleNotificationClick = async (
  notification
) => {
  if (!notification.isRead) {
    await markAsRead(notification._id);
  }
};

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      icon="notifications"
      width="max-w-lg"
    >
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1 mb-5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-white text-teal-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "unread"
                ? "bg-white text-teal-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setActiveTab("mentions")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "mentions"
                ? "bg-white text-teal-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Mentions
          </button>
        </div>

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() =>
                  handleNotificationClick(notif)
                }
                className={`
                  relative
                  flex gap-3
                  p-4
                  rounded-xl
                  border
                  cursor-pointer
                  transition-all
                  hover:shadow-md
                  ${
                    notif.borderColor ||
                    "border-slate-200"
                  }
                  ${
                    !notif.isRead
                      ? "bg-slate-50"
                      : "bg-white"
                  }
                `}
              >
                {!notif.isRead && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-teal-500" />
                )}

                <div
                  className={`
                    w-10 h-10
                    rounded-xl
                    flex-shrink-0
                    grid place-items-center
                    ${
                      notif.bgColor ||
                      "bg-teal-50"
                    }
                  `}
                >
                  <span
                    className={`material-symbols-outlined ${
                      notif.iconColor ||
                      "text-teal-600"
                    }`}
                  >
                    {notif.icon ||
                      "notifications"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">
                    {notif.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {notif.description}
                  </p>

                  <div className="mt-2 text-[11px] text-slate-400">
                    {notif.time || "Just now"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">
                notifications_off
              </span>

              <h4 className="mt-4 font-semibold text-slate-600">
                No notifications
              </h4>

              <p className="text-sm text-slate-400 mt-1">
                You're all caught up.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={async () => {
    await markAllAsRead();
  }}
            disabled={!notifications.length}
            className="
              px-4 py-2
              text-sm
              font-medium
              text-rose-600
              hover:bg-rose-50
              rounded-lg
              transition
              disabled:opacity-50
            "
          >
             Mark All Read
          </button>

          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              disabled={!unreadCount}
              className="
                px-4 py-2
                text-sm
                font-medium
                text-slate-600
                hover:bg-slate-100
                rounded-lg
                transition
                disabled:opacity-50
              "
            >
              Mark All Read
            </button>

            <button
              onClick={onClose}
              className="
                px-4 py-2
                text-sm
                font-semibold
                bg-teal-600
                text-white
                rounded-lg
                hover:bg-teal-700
                transition
              "
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}