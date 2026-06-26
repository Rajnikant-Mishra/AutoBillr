// Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          © 2026 AutoBillr Inc. All rights reserved.
        </p>

        <div className="flex items-center gap-5 text-sm">
          <button className="text-slate-500 hover:text-teal-600 transition">
            Privacy
          </button>

          <button className="text-slate-500 hover:text-teal-600 transition">
            Terms
          </button>

          <button className="text-slate-500 hover:text-teal-600 transition">
            Support
          </button>
        </div>
      </div>
    </footer>
  );
}