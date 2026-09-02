// src/components/notifications/NotificationEmpty.jsx

export default function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20">

      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">

        <span className="material-symbols-outlined text-5xl text-slate-300">
          notifications_off
        </span>

      </div>

      <h3 className="mt-6 text-lg font-bold text-slate-700">
        No Notifications
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        You're all caught up 🎉
      </p>

    </div>
  );
}