import toast from "react-hot-toast";

const TOAST_CONFIG = {
  success: {
    title: "Success",
    icon: "task_alt",
    iconClass: "bg-emerald-50 text-emerald-600",
  },

  error: {
    title: "Error",
    icon: "error",
    iconClass: "bg-red-50 text-red-600",
  },
};

export const showToast = ({
  title,
  message = "",
  type = "success",
  duration = 4000,
}) => {
  const config =
    TOAST_CONFIG[type] ||
    TOAST_CONFIG.success;

  toast(
    (t) => (
      <div className="flex items-center gap-3 pl-3 pr-4 py-3 w-full">
        <span
          className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 ${config.iconClass}`}
        >
          <span
            className="material-symbols-outlined mi-fill text-[16px]"
            aria-hidden="true"
          >
            {config.icon}
          </span>
        </span>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-slate-900">
            {title || config.title}
          </div>

          {message && (
            <div className="text-[11.5px] text-slate-500 mt-0.5">
              {message}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
        >
          <span
            className="material-symbols-outlined text-[14px]"
            aria-hidden="true"
          >
            close
          </span>
        </button>
      </div>
    ),
    {
      duration,
      position: "bottom-center",
      style: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow:
          "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)",
        padding: 0,
        maxWidth: "360px",
        minWidth: "280px",
      },
    }
  );
};

export const showSuccessToast = (
  title = "Success",
  name = ""
) => {
  showToast({
    title,
    message: name
      ? `Welcome back, ${name}`
      : "",
    type: "success",
    duration: 4000,
  });
};

export const showErrorToast = (
  message = "Something went wrong"
) => {
  showToast({
    title: "Error",
    message,
    type: "error",
    duration: 5000,
  });
};

export const showReminderToast = (
  clientName = ""
) => {
  showToast({
    title: "Reminder Sent",
    message: clientName
      ? `Reminder sent to ${clientName}`
      : "Reminder sent successfully",
    type: "success",
    duration: 3000,
  });
};