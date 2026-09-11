import { Outlet, NavLink } from "react-router-dom";

const SETTINGS_LINKS = [
  { to: "/settings/profile", label: "Personal Info", icon: "person" },
  { to: "/settings/security", label: "Security & Sessions", icon: "shield" },
  { to: "/settings/notifications", label: "Notifications", icon: "notifications" },
  { to: "/settings", label: "Account Settings", icon: "settings", end: true },
];

export default function SettingsLayout() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto py-8 px-4">
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}