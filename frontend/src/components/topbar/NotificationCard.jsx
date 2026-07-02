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

    bgColor = "bg-teal-100",

    iconColor = "text-teal-600",

    borderColor = "border-slate-200",

    isRead,

    isImportant,

    createdAt,
    time,
  } = notification;

  const handleRead = (e) => {
    e.stopPropagation();

    toggleRead(_id);

    showSuccessToast(
      isRead
        ? "Marked as unread"
        : "Marked as read"
    );
  };

  const handleImportant = (e) => {
    e.stopPropagation();

    toggleImportant(_id);

    showSuccessToast(
      isImportant
        ? "Removed from Important"
        : "Saved to Important"
    );
  };

  const handleRemove = (e) => {
    e.stopPropagation();

    removeNotification(_id);

    showSuccessToast(
      "Notification removed"
    );
  };

  return (
    <Card
      hover
      padding="p-4"
      onClick={() => {
        if (!isRead) {
          markAsRead(_id);
        }
      }}
      className={`
        relative

        ${borderColor}

        ${
          isRead
            ? "bg-white"
            : "bg-teal-50"
        }
      `}
    >
      {/* unread dot */}

      {!isRead && (
        <span
          className="
            absolute
            top-4
            left-4
            w-2
            h-2
            rounded-full
            bg-green-500
          "
        />
      )}

      {/* actions */}

      <div className="absolute top-3 right-3 flex items-center gap-1">

        {/* Important */}

        <button
          onClick={handleImportant}
          className="
            p-1.5
            rounded-lg
            hover:bg-slate-100
            transition
          "
        >
          <span
            className={`
              material-symbols-outlined
              text-[20px]

              ${
                isImportant
                  ? "text-amber-500"
                  : "text-slate-400"
              }
            `}
          >
            {isImportant
              ? "bookmark"
              : "bookmark_add"}
          </span>
        </button>

        {/* Read */}

        <button
          onClick={handleRead}
          className="
            p-1.5
            rounded-lg
            hover:bg-slate-100
            transition
          "
        >
          <span className="material-symbols-outlined text-[20px] text-slate-500">

            {isRead
              ? "mark_email_unread"
              : "done"}

          </span>
        </button>

        {/* Close */}

        <button
          onClick={handleRemove}
          className="
            p-1.5
            rounded-lg
            hover:bg-red-50
            transition
          "
        >
          <span className="material-symbols-outlined text-[20px] text-red-500">

            close

          </span>
        </button>

      </div>

      {/* content */}

      <div className="flex gap-4">

        {/* icon */}

        <div
          className={`
            w-12
            h-12
            rounded-xl
            flex
            items-center
            justify-center
            flex-shrink-0

            ${bgColor}
          `}
        >
          <span
            className={`
              material-symbols-outlined
              text-2xl

              ${iconColor}
            `}
          >
            {icon}
          </span>
        </div>

        {/* text */}

        <div className="flex-1 pr-20">

          <div className="flex items-center gap-2">

            <h4
              className={`
                text-sm
                font-bold

                ${
                  isRead
                    ? "text-slate-700"
                    : "text-slate-900"
                }
              `}
            >
              {title}
            </h4>

            {isImportant && (
              <Badge
                label="Important"
                variant="important"
              />
            )}

          </div>

          <p className="mt-1 text-xs text-slate-500 leading-relaxed">

            {description}

          </p>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-[11px] text-slate-400">

              {formatNotificationTime(
                createdAt || time
              )}

            </span>

            <Badge
              label={
                isRead
                  ? "Read"
                  : "Unread"
              }
              variant={
                isRead
                  ? "default"
                  : "active"
              }
            />

          </div>

        </div>

      </div>
    </Card>
  );
}