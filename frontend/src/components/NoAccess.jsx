export default function NoAccess({ role = "your role" }) {
  return (
    <main className="flex-1 flex items-center justify-center min-h-[70vh] px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-[32px]">
            lock
          </span>
        </div>

        <h1 className="text-2xl font-bold text-text mb-3">
          No access assigned
        </h1>

        <p className="text-sm text-text-muted leading-relaxed mb-6">
          Your account ({role}) does not have permission to view any workspace
          pages yet. Please contact your workspace owner or administrator to
          assign the required permissions.
        </p>

        <div className="rounded-xl border border-border bg-surface-secondary px-5 py-4 text-left text-sm text-text-secondary">
          <p className="font-semibold text-text mb-1">What to do next</p>
          <ul className="list-disc list-inside space-y-1 text-text-muted">
            <li>Ask the Owner to open Team &amp; Permissions</li>
            <li>Request access to the pages you need (e.g. Dashboard, Invoices)</li>
            <li>Sign out and sign in again after permissions are updated</li>
          </ul>
        </div>
      </div>
    </main>
  );
}