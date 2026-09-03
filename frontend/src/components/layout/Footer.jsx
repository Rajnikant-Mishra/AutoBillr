// Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <p className="text-sm text-text-muted text-center sm:text-left">
          © 2026 AutoBillr Inc. All rights reserved.
        </p>

        {/* Footer Links */}
        <nav
          className="flex items-center gap-5 text-sm"
          aria-label="Footer navigation"
        >
          <button
            type="button"
            className="
              text-text-muted
              hover:text-primary
              transition-colors duration-200
              outline-none
              focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              rounded
            "
          >
            Privacy
          </button>

          <button
            type="button"
            className="
              text-text-muted
              hover:text-primary
              transition-colors duration-200
              outline-none
              focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              rounded
            "
          >
            Terms
          </button>

          <button
            type="button"
            className="
              text-text-muted
              hover:text-primary
              transition-colors duration-200
              outline-none
              focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              rounded
            "
          >
            Support
          </button>
        </nav>
      </div>
    </footer>
  );
}