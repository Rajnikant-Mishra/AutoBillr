export default function NotificationSettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Notification Preferences</h1>
      <p className="text-text-muted text-sm mb-8">
        Choose what you want to be notified about.
      </p>

      <div className="space-y-4 max-w-md">
        {["Invoice paid", "Invoice overdue", "New client added", "Weekly summary"].map(
          (item) => (
            <label
              key={item}
              className="flex items-center justify-between p-4 border border-border rounded-xl cursor-pointer hover:bg-surface-hover"
            >
              <span className="text-sm font-medium">{item}</span>
              <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
            </label>
          )
        )}
      </div>
    </div>
  );
}