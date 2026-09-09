// src/components/notifications/notificationUtils.js

export const formatNotificationTime = (date) => {
  if (!date) return "Just now";

  const now = new Date();
  const d = new Date(date);

  const diff = now - d;

  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)} min ago`;
  }

  if (diff < day) {
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (diff < day * 2) {
    return "Yesterday";
  }

  if (diff < day * 7) {
    return `${Math.floor(diff / day)} days ago`;
  }

  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year:
      now.getFullYear() !== d.getFullYear()
        ? "numeric"
        : undefined,
  });
};