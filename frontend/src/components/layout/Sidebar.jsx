
import { NavLink, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getAuthToken, clearAuth } from "../../utils/auth";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const navigation = [
  {
    section: "Workspace",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { to: "/invoice", label: "Invoices", icon: "receipt_long", count: true },
      { to: "/composer", label: "Composer", icon: "edit_note" },
      { to: "/clients", label: "Clients", icon: "group" },
      { to: "/projects", label: "Projects", icon: "assignment" },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { to: "/analytics", label: "Analytics", icon: "bar_chart" },
      {
        to: "/automation",
        label: "Automation",
        icon: "auto_awesome",
        badge: "AI",
      },
    ],
  },
  {
    section: "Administration",
    items: [
      { to: "/settings", label: "Settings", icon: "settings" },
      { to: "/team", label: "Team & Permissions", icon: "admin_panel_settings" },
      { to: "/client-portal", label: "Client Portal", icon: "share" },
      { to: "/pricing", label: "Pricing", icon: "loyalty" },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const [invoiceCount, setInvoiceCount] = useState(0);
  const [invoiceCountLoading, setInvoiceCountLoading] = useState(false);

  const fetchInvoiceCount = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setInvoiceCount(0);
      return;
    }

    try {
      setInvoiceCountLoading(true);

      const response = await axios.get(`${API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const invoices = Array.isArray(response.data)
        ? response.data
        : response.data?.invoices || [];

      setInvoiceCount(invoices.length);
    } catch (error) {
      console.error(
        "Failed to load invoice count:",
        error?.response?.data || error.message
      );

      if (error.response?.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
      }

      setInvoiceCount(0);
    } finally {
      setInvoiceCountLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchInvoiceCount();
  }, [fetchInvoiceCount]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  // Design-system aware link styles
  const linkClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 px-3 py-2.5 rounded-lg",
      "text-sm font-medium transition-all duration-200",
      "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",

      isActive
        ? "bg-surface text-primary shadow-sm"
        : "text-text-muted hover:bg-surface-hover hover:text-text",
    ].join(" ");

  return (
    <aside
      className="
        hidden md:flex
        h-screen w-64
        fixed left-0 top-0 z-40
        flex-col
        border-r border-border
        bg-surface-secondary
      "
      aria-label="Main navigation"
    >
      {/* ========== LOGO ========== */}
      <div className="p-5">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="
            w-full flex items-center gap-3 text-left rounded-lg
            outline-none focus-visible:ring-2 focus-visible:ring-primary
          "
          aria-label="Go to dashboard"
        >
          <div
            className="
              w-8 h-8 flex-none
              bg-primary text-text-inverse
              rounded-lg
              flex items-center justify-center
              shadow-sm
            "
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
              aria-hidden="true"
            >
              bolt
            </span>
          </div>

          <div>
            <div className="text-[17px] font-bold tracking-tight text-text leading-none">
              AutoBillr
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.15em] font-semibold text-text-light">
              Billing Automation
            </div>
          </div>
        </button>
      </div>

      {/* ========== NAVIGATION ========== */}
      <nav
        className="flex-1 px-3 overflow-y-auto pb-2"
        aria-label="Application navigation"
      >
        {navigation.map((section) => (
          <div
            key={section.section}
            className={section.section !== "Workspace" ? "mt-5" : ""}
          >
            <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold text-text-light">
              {section.section}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <span
                    className="
                      material-symbols-outlined text-[20px]
                      transition-transform duration-200
                      group-hover:scale-105
                    "
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1 truncate">{item.label}</span>

                  {/* Invoice count */}
                  {item.count && (
                    <span
                      className="
                        min-w-[20px] text-center
                        text-[10.5px] tabular-nums font-semibold
                        text-text-light
                      "
                      aria-label={`${invoiceCount} invoices`}
                    >
                      {invoiceCountLoading ? "…" : invoiceCount}
                    </span>
                  )}

                  {/* AI badge */}
                  {item.badge && (
                    <span
                      className="
                        text-[9.5px] font-bold
                        px-1.5 py-0.5
                        rounded
                        bg-primary-soft text-primary-dark
                      "
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ========== BOTTOM ACTIONS ========== */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Primary CTA – New Invoice */}
        <button
          type="button"
          onClick={() => navigate("/invoice/new")}
          className="
            w-full flex items-center justify-center gap-2
            py-2.5 px-4
            rounded-xl
            text-sm font-semibold
            bg-primary text-text-inverse
            shadow-sm shadow-primary/20
            hover:bg-primary-hover
            active:scale-[0.98]
            transition-all duration-200
            outline-none
            focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          "
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
            aria-hidden="true"
          >
            add
          </span>
          New Invoice
        </button>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleLogout}
          className="
            w-full flex items-center gap-2
            px-3 py-2
            rounded-lg
            text-xs font-medium
            text-text-muted
            hover:text-danger hover:bg-danger-soft
            transition-all duration-200
            outline-none
            focus-visible:ring-2 focus-visible:ring-danger
          "
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
            aria-hidden="true"
          >
            logout
          </span>
          Sign out
        </button>
      </div>
    </aside>
  );
}