export default function SecuritySettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Security & Sessions</h1>
      <p className="text-text-muted text-sm mb-8">
        Manage your password and active sessions.
      </p>

      <div className="space-y-6 max-w-md">
        <div className="p-5 border border-border rounded-xl">
          <h3 className="font-semibold mb-1">Password</h3>
          <p className="text-sm text-text-muted mb-4">
            Last changed 3 months ago
          </p>
          <button className="text-sm font-semibold text-primary hover:underline">
            Change password
          </button>
        </div>

        <div className="p-5 border border-border rounded-xl">
          <h3 className="font-semibold mb-1">Two-factor authentication</h3>
          <p className="text-sm text-text-muted mb-4">
            Add an extra layer of security to your account.
          </p>
          <button className="text-sm font-semibold text-primary hover:underline">
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  );
}