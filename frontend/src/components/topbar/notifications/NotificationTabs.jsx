// src/components/notifications/NotificationTabs.jsx

export default function NotificationTabs({
  activeTab,
  setActiveTab,
  notifications,
}) {
  const unread = notifications.filter((n) => !n.isRead).length;
  const important = notifications.filter((n) => n.isImportant).length;

  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: `Unread (${unread})` },
    { id: "read", label: "Read" },
    { id: "important", label: `Important (${important})` },
    { id: "mentions", label: "Mentions" },
  ];

  return (
    <div
      className="
        inline-flex flex-wrap gap-1
        p-1 rounded-xl
        bg-surface-secondary
        mb-5
      "
      role="tablist"
      aria-label="Notification filters"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 rounded-lg
              text-xs font-semibold
              transition-colors duration-fast
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
              ${
                isActive
                  ? "bg-surface text-primary shadow-sm"
                  : "text-text-muted hover:bg-surface hover:text-text-secondary"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}