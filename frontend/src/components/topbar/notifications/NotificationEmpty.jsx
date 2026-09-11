// src/components/notifications/NotificationEmpty.jsx

export default function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="
          w-20 h-20 rounded-full
          bg-surface-secondary
          flex items-center justify-center
        "
      >
        <span className="material-symbols-outlined text-5xl text-text-light">
          notifications_off
        </span>
      </div>

      <h3 className="mt-6 text-lg font-bold text-text">
        No Notifications
      </h3>

      <p className="mt-2 text-sm text-text-muted">
        You're all caught up 🎉
      </p>
    </div>
  );
}