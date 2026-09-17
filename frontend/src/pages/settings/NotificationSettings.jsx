import React, {
  useEffect,
  useState,
} from "react";

import {
  getProfile,
} from "../../services/userService";

const NOTIFICATIONS = [
  "Invoice paid",
  "Invoice overdue",
  "New client added",
  "Weekly summary",
];

export default function NotificationSettings() {
  const [preferences, setPreferences] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response =
        await getProfile();

      const saved =
        response?.user?.notifications ||
        response?.notifications;

      if (saved) {
        setPreferences(saved);
      } else {
        /*
         * Empty state, NOT fake user data.
         */
        setPreferences(
          Object.fromEntries(
            NOTIFICATIONS.map((item) => [
              item,
              false,
            ])
          )
        );
      }
    } catch (error) {
      console.error(
        "LOAD NOTIFICATIONS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (item) => {
    setPreferences(
      (previous) => ({
        ...previous,
        [item]:
          !previous[item],
      })
    );
  };

  if (loading) {
    return (
      <div className="text-sm text-text-muted">
        Loading notification preferences...
      </div>
    );
  }

  return (
    <div>

      <h1 className="text-2xl font-bold mb-1">
        Notification Preferences
      </h1>

      <p className="text-text-muted text-sm mb-8">
        Choose what you want to be notified about.
      </p>

      <div className="space-y-4 max-w-md">

        {NOTIFICATIONS.map(
          (item) => (
            <label
              key={item}
              className="flex items-center justify-between p-4 border border-border rounded-xl cursor-pointer hover:bg-surface-hover"
            >

              <span className="text-sm font-medium">
                {item}
              </span>

              <input
                type="checkbox"
                checked={
                  !!preferences[item]
                }
                onChange={() =>
                  toggleNotification(
                    item
                  )
                }
                className="accent-primary w-4 h-4"
              />

            </label>
          )
        )}

      </div>

    </div>
  );
}