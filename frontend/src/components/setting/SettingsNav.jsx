const SETTINGS_NAV = [
  { id: "business", label: "Business Info", icon: "business" },
  { id: "branding", label: "Branding", icon: "palette" },
  { id: "tax", label: "Tax & Invoicing", icon: "receipt" },
  { id: "payments", label: "Payment Methods", icon: "credit_card" },
  { id: "integrations", label: "Integrations", icon: "extension" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "api", label: "API & Webhooks", icon: "code" },
  { id: "export", label: "Data & Export", icon: "cloud_download" },
];

export default function SettingsNav({ activeTab, onTabChange }) {
  return (
    <aside className="col-span-12 md:col-span-3">
      <div className="bg-surface rounded-xl border border-border shadow-sm p-2 sticky top-24">
        {SETTINGS_NAV.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-colors text-left
                ${
                  isActive
                    ? "bg-primary-soft text-primary font-semibold"
                    : "text-text-secondary hover:bg-surface-hover"
                }
              `}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive ? "text-primary" : "text-text-light"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[13.5px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}