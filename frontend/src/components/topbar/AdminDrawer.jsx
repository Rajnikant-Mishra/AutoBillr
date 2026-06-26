import React from "react";
import RightDrawer from "../layout/RightDrawer";
import { useNavigate } from "react-router-dom";

export default function AdminDrawer({
  isOpen,
  onClose,
}) {

      const navigate = useNavigate();
 

  const handleSignOut = () => {
    logout(); // clear auth state

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    onClose();

    navigate("/login", { replace: true });
  };
  const menuItems = [
    {
      icon: "person",
      title: "Personal Info",
    },
    {
      icon: "domain",
      title: "Switch Workspace",
      meta: "3 connected",
    },
    {
      icon: "shield",
      title: "Security & Sessions",
      meta: "2FA enabled",
    },
    {
      icon: "notifications",
      title: "Notification Preferences",
    },
    {
      icon: "settings",
      title: "Account Settings",
    },
    {
      icon: "help",
      title: "Help & Support",
    },
  ];

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Account"
      icon="account_circle"
      width="max-w-lg"
      footer={
        <button onClick={handleSignOut} className="w-full px-4 py-3 rounded-xl bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100 transition flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">
            logout
          </span>
          Sign Out
        </button>
      }
    >
      {/* Profile */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <img
          src="https://i.pravatar.cc/100?img=12"
          alt="Profile"
          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow"
        />

        <div className="flex-1">
          <h4 className="text-[15px] font-bold text-slate-900">
            Alex Sterling
          </h4>

          <p className="text-[12px] text-slate-500">
            alex@autobillr.io
          </p>

          <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider">
            Owner · Admin
          </span>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.title}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition"
          >
            <span className="w-9 h-9 rounded-lg bg-slate-100 grid place-items-center text-slate-600">
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
            </span>

            <span className="flex-1 text-left text-[13.5px] font-medium text-slate-700">
              {item.title}
            </span>

            {item.meta && (
              <span className="text-[11px] text-slate-400">
                {item.meta}
              </span>
            )}

            <span className="material-symbols-outlined text-slate-300 text-[16px]">
              chevron_right
            </span>
          </button>
        ))}
      </div>
    </RightDrawer>
  );
}