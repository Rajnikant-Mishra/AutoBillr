// Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <p className="text-sm text-slate-500 text-center sm:text-left">
          © 2026 AutoBillr Inc. All rights reserved.
        </p>

        {/* Footer Links */}
        <nav className="flex items-center gap-5 text-sm" aria-label="Footer navigation">
          <button
            type="button"
            className="text-slate-500 hover:text-teal-600 transition-colors duration-200"
          >
            Privacy
          </button>

          <button
            type="button"
            className="text-slate-500 hover:text-teal-600 transition-colors duration-200"
          >
            Terms
          </button>

          <button
            type="button"
            className="text-slate-500 hover:text-teal-600 transition-colors duration-200"
          >
            Support
          </button>
        </nav>
      </div>
    </footer>
  );
}