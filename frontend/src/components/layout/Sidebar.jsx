import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `sb-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
      isActive
        ? "bg-white text-teal-600 shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  const [invoiceCount, setInvoiceCount] = useState(0);
   useEffect(() => {
    const fetchInvoiceCount = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/invoices`
        );

        setInvoiceCount(res.data.length || 0);
      } catch (error) {
        console.error("Failed to load invoice count", error);
      }
    };

    fetchInvoiceCount();
  }, []);

  return (
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 border-r border-slate-200 bg-slate-50 z-40 flex-col">
      {/* LOGO */}
      <div className="p-5">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm flex-none">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              bolt
            </span>
          </div>
          <div>
            <div className="text-[17px] font-bold tracking-tight text-slate-900 leading-none">
              AutoBillr
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold mt-1">
              Billing Automation
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 overflow-y-auto pb-2">
        {/* Workspace */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold">
            Workspace
          </div>
          <div className="space-y-0.5">
            <NavLink to="/dashboard" className={linkClass}>
              <span className="material-symbols-outlined">dashboard</span>
              <span className="flex-1">Dashboard</span>
            </NavLink>

            <NavLink to="/invoice" className={linkClass}>
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="flex-1">Invoices</span>
              <span className="text-[10.5px] tabular text-slate-400 font-semibold">{invoiceCount}</span>
            </NavLink>

            <NavLink to="/composer" className={linkClass}>
              <span className="material-symbols-outlined">edit_note</span>
              <span className="flex-1">Composer</span>
            </NavLink>

            <NavLink to="/clients" className={linkClass}>
              <span className="material-symbols-outlined">group</span>
              <span className="flex-1">Clients</span>
            </NavLink>

            <NavLink to="/projects" className={linkClass}>
              <span className="material-symbols-outlined">assignment</span>
              <span className="flex-1">Projects</span>
            </NavLink>
          </div>
        </div>

        {/* Intelligence */}
        <div className="mt-5">
          <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold">
            Intelligence
          </div>
          <div className="space-y-0.5">
            <NavLink to="/analytics" className={linkClass}>
              <span className="material-symbols-outlined">bar_chart</span>
              <span className="flex-1">Analytics</span>
            </NavLink>

            <NavLink to="/automation" className={linkClass}>
              <span className="material-symbols-outlined">auto_awesome</span>
              <span className="flex-1">Automation</span>
              <span className="text-[9.5px] font-bold px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded">
                AI
              </span>
            </NavLink>
          </div>
        </div>

        {/* Administration */}
        <div className="mt-5">
          <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.12em] text-slate-400 font-semibold">
            Administration
          </div>
          <div className="space-y-0.5">
            <NavLink to="/settings" className={linkClass}>
              <span className="material-symbols-outlined">settings</span>
              <span className="flex-1">Settings</span>
            </NavLink>

            <NavLink to="/team" className={linkClass}>
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="flex-1">Team & Permissions</span>
            </NavLink>

            <NavLink to="/client-portal" className={linkClass}>
              <span className="material-symbols-outlined">share</span>
              <span className="flex-1">Client Portal</span>
            </NavLink>

            <NavLink to="/pricing" className={linkClass}>
              <span className="material-symbols-outlined">loyalty</span>
              <span className="flex-1">Pricing</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* BOTTOM SECTION */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition active:scale-[0.98] shadow-sm shadow-teal-600/20">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            add
          </span>
          New Invoice
        </button>

        <button className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            logout
          </span>
          Sign out
        </button>
      </div>
    </aside>
  );
}