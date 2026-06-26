// src/utils/customToast.js
import toast from "react-hot-toast";

export const showToast = ({
  title = "Success",
  message = "",
  type = "success",
  duration = 4000,
}) => {
  const isSuccess = type === "success";

  toast(
    <div className="flex items-center gap-3 pl-3 pr-4 py-3 w-full">
      {/* Icon Container - Matching your design */}
      <span className="w-7 h-7 rounded-lg grid place-items-center bg-teal-50 text-teal-600 flex-shrink-0">
        <span 
          className="material-symbols-outlined mi-fill" 
          style={{ fontSize: "16px" }}
        >
          {isSuccess ? "task_alt" : "error"}
        </span>
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-slate-900">{title}</div>
        {message && (
          <div className="text-[11.5px] text-slate-500 mt-0.5">{message}</div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => toast.dismiss()}
        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
      >
        <span 
          className="material-symbols-outlined" 
          style={{ fontSize: "14px" }}
        >
          close
        </span>
      </button>
    </div>,
    {
      duration,
      position: "bottom-center",
      style: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        padding: "0",           // Removed because we have internal padding
        maxWidth: "360px",
        minWidth: "280px",
      },
      icon: null,
    }
  );
};

// Updated Helpers
export const showSuccessToast = (title = "Signed in", name = "") => {
  showToast({
    title,
    message: name ? `Welcome back, ${name}` : "",
    type: "success",
    duration: 4000,
  });
};

export const showErrorToast = (message = "Something went wrong") => {
  showToast({
    title: "Error",
    message,
    type: "error",
    duration: 5000,
  });
};
export const showReminderToast = (clientName = "") => {
  showToast({
    title: "Reminder Sent",
    message: `Reminder sent to ${clientName}`,
    type: "success",
    duration: 3000,
  });
};