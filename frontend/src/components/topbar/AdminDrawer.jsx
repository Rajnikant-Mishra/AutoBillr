import React from "react";
import { useNavigate } from "react-router-dom";
import RightDrawer from "../layout/RightDrawer";
import { clearAuth } from "../../utils/auth";

const MENU_ITEMS = [
  { icon: "person", title: "Personal Info" },
  { icon: "domain", title: "Switch Workspace", meta: "3 connected" },
  { icon: "shield", title: "Security & Sessions", meta: "2FA enabled" },
  { icon: "notifications", title: "Notification Preferences" },
  { icon: "settings", title: "Account Settings" },
  { icon: "help", title: "Help & Support" },
];

export default function AdminDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearAuth();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Account"
      icon="account_circle"
      width="max-w-lg"
      footer={
        <button
          type="button"
          onClick={handleSignOut}
          className="
            w-full h-[var(--button-height-md)] px-4
            rounded-[var(--button-radius)]
            bg-danger-soft text-danger
            font-semibold text-sm
            hover:bg-danger/15
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30
            transition-colors duration-fast
            flex items-center justify-center gap-2
          "
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            logout
          </span>
          Sign Out
        </button>
      }
    >
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-light">
        <img
          src="https://i.pravatar.cc/100?img=12"
          alt=""
          className="
            w-14 h-14 rounded-2xl object-cover
            border-2 border-surface shadow-sm
            shrink-0
          "
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-[15px] font-bold text-text truncate">
            Alex Sterling
          </h4>
          <p className="text-xs text-text-muted truncate">
            alex@autobillr.io
          </p>
          <span
            className="
              inline-block mt-1.5
              px-2 py-0.5 rounded-md
              bg-primary-soft text-primary-dark
              text-[10px] font-bold uppercase tracking-wider
            "
          >
            Owner · Admin
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav aria-label="Account menu" className="space-y-1">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={item.onClick}
            className="
              w-full flex items-center gap-3
              px-3 py-3 rounded-xl
              text-left
              hover:bg-surface-hover
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
              transition-colors duration-fast
              group
            "
          >
            <span
              className="
                w-9 h-9 rounded-lg
                bg-surface-secondary
                grid place-items-center
                text-text-secondary
                group-hover:bg-surface group-hover:text-text
                transition-colors duration-fast
                shrink-0
              "
              aria-hidden
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
            </span>

            <span className="flex-1 min-w-0">
              <span className="block text-[13.5px] font-medium text-text-secondary group-hover:text-text transition-colors">
                {item.title}
              </span>
            </span>

            {item.meta && (
              <span className="text-[11px] text-text-light whitespace-nowrap shrink-0">
                {item.meta}
              </span>
            )}

            <span
              className="material-symbols-outlined text-text-light text-[16px] shrink-0"
              aria-hidden
            >
              chevron_right
            </span>
          </button>
        ))}
      </nav>
    </RightDrawer>
  );
}