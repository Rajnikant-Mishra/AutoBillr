import React from "react";
import {
  NavLink,
  Outlet,
} from "react-router-dom";

const SETTINGS_LINKS = [
  {
    to: "/settings/profile",
    label: "Personal Info",
    icon: "person",
  },
  {
    to: "/settings/security",
    label: "Security & Sessions",
    icon: "shield",
  },
  {
    to: "/settings/notifications",
    label: "Notifications",
    icon: "notifications",
  },
  {
    to: "/settings",
    label: "Account Settings",
    icon: "settings",
    end: true,
  },
];

export default function SettingsLayout() {
  return (
    <main className="flex-1 pt-2 pb-12">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-12 gap-8">

          {/* LEFT NAV */}

          <aside className="col-span-12 lg:col-span-3">

            <div className="border border-border rounded-2xl p-2 bg-surface">

              <div className="px-3 py-3">

                <h2 className="font-semibold text-text">
                  Settings
                </h2>

                <p className="text-xs text-text-muted mt-1">
                  Manage your account
                </p>

              </div>

              <nav className="space-y-1">

                {SETTINGS_LINKS.map(
                  (link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3",
                          "px-3 py-2.5",
                          "rounded-xl",
                          "text-sm font-medium",
                          "transition-colors",

                          isActive
                            ? "bg-primary-soft text-primary-dark"
                            : "text-text-muted hover:text-text hover:bg-surface-hover",
                        ].join(" ")
                      }
                    >

                      <span className="material-symbols-outlined text-[20px]">
                        {link.icon}
                      </span>

                      <span>
                        {link.label}
                      </span>

                    </NavLink>
                  )
                )}

              </nav>

            </div>

          </aside>

          {/* CONTENT */}

          <section className="col-span-12 lg:col-span-9 min-w-0">

            <Outlet />

          </section>

        </div>

      </div>

    </main>
  );
}