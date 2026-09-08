


// Footer.jsx
export default function Footer() {
  return (
    <footer className="w-full py-10 border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand + Copyright + Badges */}
        <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
          <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm flex-none">
            <span
              className="material-symbols-outlined mi-fill"
              style={{ fontSize: "22px" }}
            >
              bolt
            </span>
          </div>
          <span className="font-bold text-slate-900 text-sm">AutoBillr</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500">
            © 2026 AutoBillr Inc. All rights reserved.
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-teal-50 text-teal-700 rounded">
            SOC 2
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
            PCI DSS
          </span>
        </div>

        {/* Links + Powered by */}
        <div className="flex items-center gap-6 text-xs text-slate-500 flex-wrap justify-center">
          <a href="#" className="hover:text-teal-600 transition">
            Privacy
          </a>
          <a href="#" className="hover:text-teal-600 transition">
            Terms
          </a>
          <a href="#" className="hover:text-teal-600 transition">
            Security
          </a>
          <a href="#" className="hover:text-teal-600 transition">
            Status
          </a>
          <span className="h-4 w-px bg-slate-200" />
          <span className="text-slate-500">
            Powered by{" "}
            <a
              href="https://www.evoquesys.com"
              target="_blank"
              rel="noreferrer"
              className="text-teal-600 font-semibold hover:underline"
            >
              EvoqueSys
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}