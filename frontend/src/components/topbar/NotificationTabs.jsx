// src/components/notifications/NotificationTabs.jsx

export default function NotificationTabs({
  activeTab,
  setActiveTab,
  notifications,
}) {
  const unread = notifications.filter((n) => !n.isRead).length;

  const read = notifications.filter((n) => n.isRead).length;

  const important = notifications.filter((n) => n.isImportant).length;

  const tabs = [
    {
      id: "all",
      label: `All`,
      active: "text-teal-600",
    },
    {
      id: "unread",
      label: `Unread (${unread})`,
      active: "text-green-600",
    },
    {
      id: "read",
      label: `Read`,
      active: "text-blue-600",
    },
    {
      id: "important",
      label: `Important (${important})`,
      active: "text-amber-600",
    },
    {
      id: "mentions",
      label: "Mentions",
      active: "text-purple-600",
    },
  ];

  return (
    <div className="inline-flex flex-wrap gap-2 p-1 rounded-xl bg-slate-100 mb-5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            px-4
            py-2
            rounded-lg
            text-xs
            font-semibold
            transition-all
            ${
              activeTab === tab.id
                ? `bg-white shadow ${tab.active}`
                : "text-slate-500 hover:bg-white"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}