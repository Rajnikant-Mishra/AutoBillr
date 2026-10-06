import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const solutions = [
  { label: "Invoicing", href: "#features", icon: "receipt_long" },
  { label: "Automated Billing", href: "#features", icon: "autorenew" },
  { label: "Payment Tracking", href: "#features", icon: "payments" },
  { label: "Reports & Analytics", href: "#features", icon: "analytics" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef(null);
  const mobileRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (
        mobileRef.current &&
        !mobileRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const close = () => {
    setOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md z-40">
      {/* Same container + padding as footer */}
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2" onClick={close}>
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container">
                payments
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              AutoBillr
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <div ref={ref} className="relative">
              <button
                type="button"
                className={`flex items-center gap-1 text-teal-600 font-medium ${
                  open ? "active" : ""
                }`}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
              >
                <span>Solutions</span>
                <span className="material-symbols-outlined text-[18px]">
                  expand_more
                </span>
              </button>

              {open && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[270px] p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  {solutions.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-primary-soft text-slate-600 hover:text-primary"
                      onClick={close}
                    >
                      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">
                          {s.icon}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{s.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/pricing"
              className="text-slate-500 hover:text-teal-600 transition-colors font-medium"
              onClick={close}
            >
              Pricing
            </a>
            <a
              href="/enterprise"
              className="text-slate-500 hover:text-teal-600 transition-colors font-medium"
              onClick={close}
            >
              Enterprise
            </a>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 gap-2 border border-slate-200">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="search"
              placeholder="Search features..."
              className="bg-transparent border-none focus:ring-0 text-sm w-48 outline-none"
              aria-label="Search features"
            />
          </div>

          <button
            type="button"
            className="text-slate-500 hover:text-teal-600 transition-colors"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            type="button"
            className="text-slate-500 hover:text-teal-600 transition-colors"
            aria-label="Help"
          >
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9tK-c3I6CDD3Rqt-GbFMV0vbSRxTzTTxVagpypZW_-p1vASA3S9Eeuzpjr-maldtGCF11lTy7fYIBRje27jVZsC_CkdsL3ceA846lO4Uf6mdl4yVID3986BTF5VX0v6glP0dBCBHilchHSipYNdWxRUC_quooRX-iYJ7Swf15kXVSl4k_ZWrz9n43Y1hzbb6Suc4AEpltgwyafUFL7h5grYlitHYuMs7tiLOeAiKkz7W_2RU91umlxA6F7HZ3VHXM8fyNc3FjAV0"
              alt="User profile"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          className="md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          ref={mobileRef}
          className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 md:hidden"
        >
          <nav className="flex flex-col gap-1 max-w-7xl mx-auto px-8">
            <a
              href="#features"
              className="py-3 px-3 rounded-md text-slate-600"
              onClick={close}
            >
              Solutions
            </a>
            <a
              href="#pricing"
              className="py-3 px-3 rounded-md text-slate-600"
              onClick={close}
            >
              Pricing
            </a>
            <a
              href="#enterprise"
              className="py-3 px-3 rounded-md text-slate-600"
              onClick={close}
            >
              Enterprise
            </a>
            <Link
              to="/register"
              className="mt-3 w-full justify-center px-6 py-3 bg-primary text-white rounded-xl font-semibold text-center"
              onClick={close}
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}