import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

// Safe Token Helper
const getAuthToken = () => {
  const plainToken = localStorage.getItem("token");
  if (plainToken && plainToken.startsWith("ey")) return plainToken;

  const authStorage = localStorage.getItem("autobiller-auth");
  if (authStorage) {
    if (authStorage.startsWith("ey")) return authStorage;
    try {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token || parsed?.token;
      if (token) return token;
    } catch {
      // ignore json error
    }
  }
  return plainToken || authStorage || "";
};

export default function CommandPalette({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const [search, setSearch] = useState("");
  const [recentItems, setRecentItems] = useState([]);
  const navigate = useNavigate();

  // Permissions hook se check functions le rahe hain
  const { can, role } = usePermissions();

  const closePalette = () => {
    setSearch("");
    onClose();
  };

  // 1. Navigation items with exact required permissions
  const navigateItems = useMemo(
    () => [
      { icon: "dashboard", label: "Dashboard", path: "/dashboard", permission: "dashboard:view" },
      { icon: "receipt_long", label: "Invoices", path: "/invoices", permission: "invoices:view" },
      { icon: "edit_note", label: "Invoice Composer", path: "/composer", permission: "invoices:create" },
      { icon: "group", label: "Clients", path: "/clients", permission: "clients:view" },
      { icon: "assignment", label: "Projects & Milestones", path: "/projects", permission: "projects:view" },
      { icon: "bar_chart", label: "Analytics", path: "/analytics", permission: "analytics:view" },
      { icon: "auto_awesome", label: "Recurring Automation", path: "/automation", permission: "automation:view" },
      { icon: "settings", label: "Settings", path: "/settings", permission: "settings:view" },
      {
        icon: "admin_panel_settings",
        label: "Team & Permissions",
        path: "/team",
        permission: "team:view",
      },
      { icon: "share", label: "Client Portal", path: "/clientportal", permission: "settings:view" },
      { icon: "loyalty", label: "Pricing", path: "/app/pricing", permission: "billing:view" },
    ],
    []
  );

  // 2. Action items with required permissions
  const actionItems = useMemo(
    () => [
      {
        icon: "add",
        label: "Create new invoice",
        shortcut: "⇧ N",
        path: "/composer",
        permission: "invoices:create",
      },
      {
        icon: "person_add",
        label: "Add a new client",
        path: "/clients",
        permission: "clients:create",
      },
      {
        icon: "add_business",
        label: "Add a new project",
        path: "/projects",
        permission: "projects:create",
      },
      {
        icon: "bolt",
        label: "Quick invoice (composer)",
        path: "/composer",
        permission: "invoices:create",
      },
      {
        icon: "filter_list",
        label: "Open filter panel",
        path: null,
        permission: null,
      },
      {
        icon: "notifications",
        label: "Notifications",
        path: null,
        permission: null,
      },
    ],
    []
  );

  // Check helper: Owner/Admin ko all access, baaki ke liye can() check
  const hasAccess = (permission) => {
    if (!permission) return true;
    if (role === "Owner" || role === "Admin") return true;
    return can(permission);
  };

  // Only keep items user has permission to see
  const allowedNavigateItems = useMemo(
    () => navigateItems.filter((item) => hasAccess(item.permission)),
    [navigateItems, role, can]
  );

  const allowedActionItems = useMemo(
    () => actionItems.filter((item) => hasAccess(item.permission)),
    [actionItems, role, can]
  );

  // ==================== FETCH LATEST INVOICE & PROJECT DATA ====================
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchRecentItems = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const canViewInvoices = hasAccess("invoices:view");
        const canViewProjects = hasAccess("projects:view");
        const canViewDashboard = hasAccess("dashboard:view");

        // Sirf wahi API call karo jiski user ke paas permission hai
        const promises = [];
        if (canViewDashboard) promises.push(fetch(`${API_URL}/dashboard`, { headers }));
        if (canViewProjects) promises.push(fetch(`${API_URL}/projects`, { headers }));

        if (promises.length === 0 && !canViewInvoices) {
          setRecentItems([]);
          return;
        }

        const items = [];

        // 1. Invoices (Only if permitted)
        if (canViewInvoices) {
          try {
            const invRes = await fetch(`${API_URL}/invoices`, { headers });
            if (invRes.ok) {
              const invData = await invRes.json();
              const invList = Array.isArray(invData)
                ? invData
                : invData?.invoices || invData?.data || [];
              const latestInv = invList[0];
              if (latestInv) {
                const num = latestInv.invoiceNumber || latestInv.number || "INV";
                const invLabel = num.toString().startsWith("#") ? num : `#${num}`;
                const clientName =
                  latestInv.clientName ||
                  latestInv.client?.name ||
                  (typeof latestInv.client === "string" ? latestInv.client : "") ||
                  "Client";

                items.push({
                  icon: "receipt_long",
                  label: `${invLabel} · ${clientName}`,
                  path: "/invoices",
                });
              }
            }
          } catch {
            // silent catch
          }
        }

        // 2. Projects (Only if permitted)
        if (canViewProjects) {
          try {
            const projRes = await fetch(`${API_URL}/projects`, { headers });
            if (projRes.ok) {
              const projData = await projRes.json();
              const projList = Array.isArray(projData)
                ? projData
                : projData?.projects || projData?.data || [];
              const latestProj = projList[0];
              if (latestProj) {
                const projName = latestProj.name || latestProj.title || "Project";
                const clientName =
                  latestProj.clientName ||
                  latestProj.client?.name ||
                  latestProj.company ||
                  "Client";

                items.push({
                  icon: "assignment",
                  label: `${projName} · ${clientName}`,
                  path: "/projects",
                });
              }
            }
          } catch {
            // silent catch
          }
        }

        if (isMounted) {
          setRecentItems(items);
        }
      } catch (err) {
        console.error("Failed to load real recent items:", err);
      }
    };

    fetchRecentItems();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleSelect = (path) => {
    if (path) {
      closePalette();
      navigate(path);
    }
  };

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closePalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Outside click listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        closePalette();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Filter with search query only from allowed items
  const filteredNavigate = allowedNavigateItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const filteredActions = allowedActionItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRecent = recentItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const totalResults =
    filteredNavigate.length + filteredActions.length + filteredRecent.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] flex items-start justify-end pt-[12vh] pr-6 md:pr-8">
      <div
        ref={modalRef}
        className="
          modal-in
          w-full
          max-w-xl
          bg-surface
          border
          border-border
          rounded-2xl
          shadow-xl
          overflow-hidden
        "
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-light">
          <span
            className="material-symbols-outlined text-text-light"
            style={{ fontSize: "20px" }}
          >
            search
          </span>

          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or jump to…"
            className="
              flex-1
              border-0
              outline-none
              text-[15px]
              font-medium
              placeholder:text-text-light
              bg-transparent
            "
          />

          <kbd
            onClick={onClose}
            className="
              text-[10px]
              font-mono
              text-text-light
              px-1.5
              py-0.5
              rounded
              border
              border-border
              bg-surface-secondary
              cursor-pointer
              hover:text-text
            "
          >
            ESC
          </kbd>
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-auto p-2">
          {/* Navigate */}
          {filteredNavigate.length > 0 && (
            <div>
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-text-light uppercase tracking-wider">
                Navigate
              </div>

              {filteredNavigate.map((item) => (
                <div
                  key={item.label}
                  onClick={() => handleSelect(item.path)}
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-lg
                    cursor-pointer
                    text-text-secondary
                    hover:text-text
                    hover:bg-primary-soft
                  "
                >
                  <span className="w-7 h-7 rounded-md grid place-items-center bg-surface-secondary text-text-muted group-hover:bg-surface group-hover:text-primary transition-colors">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      {item.icon}
                    </span>
                  </span>

                  <span className="text-[13px] font-medium flex-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-text-light uppercase tracking-wider">
                Actions
              </div>

              {filteredActions.map((item) => (
                <div
                  key={item.label}
                  onClick={() => handleSelect(item.path)}
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-lg
                    cursor-pointer
                    text-text-secondary
                    hover:text-text
                    hover:bg-primary-soft
                  "
                >
                  <span className="w-7 h-7 rounded-md grid place-items-center bg-surface-secondary text-text-muted group-hover:bg-surface group-hover:text-primary transition-colors">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      {item.icon}
                    </span>
                  </span>

                  <span className="text-[13px] font-medium flex-1">
                    {item.label}
                  </span>

                  {item.shortcut && (
                    <span className="text-[11px] text-text-light">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recent (Real DB Data) */}
          {filteredRecent.length > 0 && (
            <div>
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-text-light uppercase tracking-wider">
                Recent
              </div>

              {filteredRecent.map((item) => (
                <div
                  key={item.label}
                  onClick={() => handleSelect(item.path)}
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-lg
                    cursor-pointer
                    text-text-secondary
                    hover:text-text
                    hover:bg-primary-soft
                  "
                >
                  <span className="w-7 h-7 rounded-md grid place-items-center bg-surface-secondary text-text-muted group-hover:bg-surface group-hover:text-primary transition-colors">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      {item.icon}
                    </span>
                  </span>

                  <span className="text-[13px] font-medium flex-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalResults === 0 && (
            <div className="py-10 text-center text-sm text-text-muted">
              No results found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-border-light bg-surface-secondary flex gap-4 text-[10.5px] text-text-muted">
          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono mr-1">
              ↑↓
            </kbd>
            Navigate
          </span>

          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono mr-1">
              ↵
            </kbd>
            Select
          </span>

          <span className="ml-auto">{totalResults} results</span>
        </div>
      </div>
    </div>
  );
}