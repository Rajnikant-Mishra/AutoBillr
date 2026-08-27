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
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: "dashboard",
      },
      {
        to: "/invoice",
        label: "Invoices",
        icon: "receipt_long",
        count: true,
      },
      {
        to: "/composer",
        label: "Composer",
        icon: "edit_note",
      },
      {
        to: "/clients",
        label: "Clients",
        icon: "group",
      },
      {
        to: "/projects",
        label: "Projects",
        icon: "assignment",
      },
    ],
  },
  {
    section: "Intelligence",
    items: [
      {
        to: "/analytics",
        label: "Analytics",
        icon: "bar_chart",
      },
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
      {
        to: "/settings",
        label: "Settings",
        icon: "settings",
      },
      {
        to: "/team",
        label: "Team & Permissions",
        icon: "admin_panel_settings",
      },
      {
        to: "/client-portal",
        label: "Client Portal",
        icon: "share",
      },
      {
        to: "/pricing",
        label: "Pricing",
        icon: "loyalty",
      },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const [invoiceCount, setInvoiceCount] = useState(0);
  const [invoiceCountLoading, setInvoiceCountLoading] = useState(false);

  /**
   * Fetch invoice count
   */
  const fetchInvoiceCount = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setInvoiceCount(0);
      return;
    }

    try {
      setInvoiceCountLoading(true);

      const response = await axios.get(`${API_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

      /**
       * If authentication has expired,
       * remove the session and send the user to login.
       */
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

  /**
   * Logout
   */
  const handleLogout = () => {
    clearAuth();

    navigate("/login", {
      replace: true,
    });
  };

  /**
   * Navigation link classes
   */
  const linkClass = ({ isActive }) =>
    [
      "sb-item",
      "group",
      "flex",
      "items-center",
      "gap-3",
      "px-3",
      "py-2.5",
      "rounded-lg",
      "transition-all",
      "duration-200",
      "text-sm",
      "font-medium",
      "outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-teal-500",
      "focus-visible:ring-offset-1",

      isActive
        ? "bg-white text-teal-600 shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  return (
    <aside
      className="
        hidden md:flex
        h-screen
        w-64
        fixed
        left-0
        top-0
        border-r
        border-slate-200
        bg-slate-50
        z-40
        flex-col
      "
      aria-label="Main navigation"
    >
      {/* =====================================================
          LOGO
      ====================================================== */}
      <div className="p-5">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="
            w-full
            flex
            items-center
            gap-3
            text-left
            rounded-lg
            outline-none
            focus-visible:ring-2
            focus-visible:ring-teal-500
          "
          aria-label="Go to dashboard"
        >
          <div
            className="
              w-8
              h-8
              bg-teal-600
              rounded-lg
              flex
              items-center
              justify-center
              text-white
              shadow-sm
              flex-none
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
            <div className="text-[17px] font-bold tracking-tight text-slate-900 leading-none">
              AutoBillr
            </div>

            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold mt-1">
              Billing Automation
            </div>
          </div>
        </button>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <nav
        className="flex-1 px-3 overflow-y-auto pb-2"
        aria-label="Application navigation"
      >
        {navigation.map((section) => (
          <div
            key={section.section}
            className={section.section !== "Workspace" ? "mt-5" : ""}
          >
            <div
              className="
                px-3
                mb-1.5
                text-[10px]
                uppercase
                tracking-[0.12em]
                text-slate-400
                font-semibold
              "
            >
              {section.section}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                >
                  <span
                    className="
                      material-symbols-outlined
                      text-[20px]
                      transition-transform
                      duration-200
                      group-hover:scale-105
                    "
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1 truncate">
                    {item.label}
                  </span>

                  {/* Invoice count */}
                  {item.count && (
                    <span
                      className="
                        min-w-[20px]
                        text-center
                        text-[10.5px]
                        tabular-nums
                        text-slate-400
                        font-semibold
                      "
                      aria-label={`${invoiceCount} invoices`}
                    >
                      {invoiceCountLoading ? "..." : invoiceCount}
                    </span>
                  )}

                  {/* AI badge */}
                  {item.badge && (
                    <span
                      className="
                        text-[9.5px]
                        font-bold
                        px-1.5
                        py-0.5
                        bg-teal-100
                        text-teal-700
                        rounded
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

      {/* =====================================================
          BOTTOM ACTIONS
      ====================================================== */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        {/* New Invoice */}
        <button
          type="button"
          onClick={() => navigate("/invoice/new")}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            py-2.5
            bg-teal-600
            text-white
            rounded-xl
            text-sm
            font-semibold
            hover:bg-teal-700
            active:scale-[0.98]
            transition
            shadow-sm
            shadow-teal-600/20
            outline-none
            focus-visible:ring-2
            focus-visible:ring-teal-500
            focus-visible:ring-offset-2
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
            w-full
            flex
            items-center
            gap-2
            px-3
            py-2
            text-slate-500
            hover:text-red-600
            hover:bg-red-50
            rounded-lg
            text-xs
            font-medium
            transition
            outline-none
            focus-visible:ring-2
            focus-visible:ring-red-500
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