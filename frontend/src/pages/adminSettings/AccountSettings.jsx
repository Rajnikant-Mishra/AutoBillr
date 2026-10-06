export default function AccountSettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
      <p className="text-text-muted text-sm mb-8">
        Manage your workspace and billing.
      </p>

      <div className="space-y-6 max-w-md">
        <div className="p-5 border border-border rounded-xl">
          <h3 className="font-semibold mb-1">Workspace</h3>
          <p className="text-sm text-text-muted">Manage team members and permissions</p>
        </div>

        <div className="p-5 border border-border rounded-xl">
          <h3 className="font-semibold mb-1">Billing & Plan</h3>
          <p className="text-sm text-text-muted">View invoices and change your plan</p>
        </div>
      </div>
    </div>
  );
}