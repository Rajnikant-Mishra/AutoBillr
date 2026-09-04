// src/components/notifications/NotificationCard.jsx

import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { formatNotificationTime } from "../../utils/notificationUtils";
import { showSuccessToast } from "../ui/CustomToast";

export default function NotificationCard({
  notification,
  markAsRead,
  toggleRead,
  toggleImportant,
  removeNotification,
}) {
  const {
    _id,
    title,
    description,
    icon = "notifications",
    isRead,
    isImportant,
    createdAt,
    time,
  } = notification;

  const handleRead = (e) => {
    e.stopPropagation();
    toggleRead(_id);
    showSuccessToast(isRead ? "Marked as unread" : "Marked as read");
  };

  const handleImportant = (e) => {
    e.stopPropagation();
    toggleImportant(_id);
    showSuccessToast(
      isImportant ? "Removed from Important" : "Saved to Important"
    );
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    removeNotification(_id);
    showSuccessToast("Notification removed");
  };

  return (
    <Card
      hover
      padding="p-4"
      onClick={() => {
        if (!isRead) markAsRead(_id);
      }}
      className={`
        relative
        border border-border-light
        ${isRead ? "bg-surface" : "bg-primary-soft"}
        transition-colors duration-fast
      `}
    >
      {/* Unread indicator */}
      {!isRead && (
        <span
          className="
            absolute top-4 left-4
            w-2 h-2 rounded-full
            bg-success
            ring-2 ring-surface
          "
          aria-hidden
        />
      )}

      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {/* Important */}
        <button
          type="button"
          onClick={handleImportant}
          className="
            p-1.5 rounded-lg
            text-text-light
            hover:bg-surface-hover hover:text-warning
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/30
            transition-colors duration-fast
          "
          aria-label={isImportant ? "Remove from Important" : "Mark as Important"}
        >
          <span
            className={`
              material-symbols-outlined text-[20px]
              ${isImportant ? "text-warning" : "text-text-light"}
            `}
          >
            {isImportant ? "bookmark" : "bookmark_add"}
          </span>
        </button>

        {/* Read / Unread */}
        <button
          type="button"
          onClick={handleRead}
          className="
            p-1.5 rounded-lg
            text-text-muted
            hover:bg-surface-hover hover:text-text
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
            transition-colors duration-fast
          "
          aria-label={isRead ? "Mark as unread" : "Mark as read"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isRead ? "mark_email_unread" : "done"}
          </span>
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={handleRemove}
          className="
            p-1.5 rounded-lg
            text-danger
            hover:bg-danger-soft
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30
            transition-colors duration-fast
          "
          aria-label="Remove notification"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Icon */}
        <div
          className="
            w-12 h-12 rounded-xl
            bg-primary-soft
            flex items-center justify-center
            shrink-0
          "
        >
          <span className="material-symbols-outlined text-2xl text-primary">
            {icon}
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-20">
          <div className="flex items-center gap-2">
            <h4
              className={`
                text-sm font-bold truncate
                ${isRead ? "text-text-secondary" : "text-text"}
              `}
            >
              {title}
            </h4>

            {isImportant && (
              <Badge label="Important" variant="important" />
            )}
          </div>

          <p className="mt-1 text-xs text-text-muted leading-relaxed line-clamp-2">
            {description}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[11px] text-text-light whitespace-nowrap">
              {formatNotificationTime(createdAt || time)}
            </span>

            <Badge
              label={isRead ? "Read" : "Unread"}
              variant={isRead ? "default" : "active"}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}