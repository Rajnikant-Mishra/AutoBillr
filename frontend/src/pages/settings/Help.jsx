export default function Help() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
      <p className="text-text-muted mb-8">
        Find answers or contact our support team.
      </p>

      <div className="grid gap-4">
        <a href="#" className="p-5 border border-border rounded-xl hover:bg-surface-hover">
          <h3 className="font-semibold">Documentation</h3>
          <p className="text-sm text-text-muted mt-1">Guides and API reference</p>
        </a>
        <a href="#" className="p-5 border border-border rounded-xl hover:bg-surface-hover">
          <h3 className="font-semibold">Contact Support</h3>
          <p className="text-sm text-text-muted mt-1">We usually reply within 24 hours</p>
        </a>
      </div>
    </div>
  );
}