// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function CommandPalette({ isOpen, onClose }) {
//   const modalRef = useRef(null);
//   const [search, setSearch] = useState("");
//   const navigate = useNavigate();

//   const navigateItems = [
//     { icon: "dashboard", label: "Dashboard", path: "/dashboard" },
//     { icon: "receipt_long", label: "Invoices", path: "/invoice" },
//     { icon: "edit_note", label: "Invoice Composer", path: "/composer" },
//     { icon: "group", label: "Clients", path: "/clients" },
//     { icon: "assignment", label: "Projects & Milestones", path: "/projects" },
//     { icon: "bar_chart", label: "Analytics", path: "/analytics" },
//     { icon: "auto_awesome", label: "Recurring Automation", path: "/automation" },
//     { icon: "settings", label: "Settings", path: "/settings" },
//     {
//       icon: "admin_panel_settings",
//       label: "Team & Permissions",
//       path: "/team",
//     },
//     { icon: "share", label: "Client Portal", path: "/clientportal" },
//     { icon: "loyalty", label: "Pricing", path: "/app/pricing" },
//   ];

//   const actionItems = [
//     {
//       icon: "add",
//       label: "Create new invoice",
//       shortcut: "⇧ N",
//       path: "/composer", // ✅ Direct Composer route
//     },
//     {
//       icon: "person_add",
//       label: "Add a new client",
//       path: "/clients",
//     },
//     {
//       icon: "add_business",
//       label: "Add a new project",
//       path: "/projects",
//     },
//     {
//       icon: "bolt",
//       label: "Quick invoice (composer)",
//       path: "/composer", // ✅ Direct Composer route
//     },
//     {
//       icon: "filter_list",
//       label: "Open filter panel",
//       path: null,
//     },
//     {
//       icon: "notifications",
//       label: "Notifications",
//       path: null,
//     },
//   ];

//   const recentItems = [
//     {
//       icon: "receipt_long",
//       label: "INV-8821 · Apex Partners",
//       path: "/invoice",
//     },
//     {
//       icon: "assignment",
//       label: "Q4 Marketing Campaign · Acme",
//       path: "/projects",
//     },
//   ];

//   const handleSelect = (path) => {
//     if (path) {
//       onClose();
//       navigate(path);
//     }
//   };

//   // Escape key listener
//   useEffect(() => {
//     if (!isOpen) {
//       setSearch("");
//       return;
//     }

//     const handleKeyDown = (e) => {
//       if (e.key === "Escape") {
//         e.preventDefault();
//         e.stopPropagation();
//         onClose();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [isOpen, onClose]);

//   // Outside click listener
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleClickOutside = (e) => {
//       if (modalRef.current && !modalRef.current.contains(e.target)) {
//         e.preventDefault();
//         e.stopPropagation();
//         onClose();
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) {
//     return null;
//   }

//   const filteredNavigate = navigateItems.filter((item) =>
//     item.label.toLowerCase().includes(search.toLowerCase())
//   );

//   const filteredActions = actionItems.filter((item) =>
//     item.label.toLowerCase().includes(search.toLowerCase())
//   );

//   const filteredRecent = recentItems.filter((item) =>
//     item.label.toLowerCase().includes(search.toLowerCase())
//   );

//   const totalResults =
//     filteredNavigate.length + filteredActions.length + filteredRecent.length;

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] flex items-start justify-end pt-[12vh] pr-6 md:pr-8">
//       <div
//         ref={modalRef}
//         className="
//           modal-in
//           w-full
//           max-w-xl
//           bg-surface
//           border
//           border-border
//           rounded-2xl
//           shadow-xl
//           overflow-hidden
//         "
//       >
//         {/* Search Header */}
//         <div className="flex items-center gap-3 px-5 py-4 border-b border-border-light">
//           <span
//             className="material-symbols-outlined text-text-light"
//             style={{ fontSize: "20px" }}
//           >
//             search
//           </span>

//           <input
//             autoFocus
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search or jump to…"
//             className="
//               flex-1
//               border-0
//               outline-none
//               text-[15px]
//               font-medium
//               placeholder:text-text-light
//               bg-transparent
//             "
//           />

//           <kbd
//             onClick={onClose}
//             className="
//               text-[10px]
//               font-mono
//               text-text-light
//               px-1.5
//               py-0.5
//               rounded
//               border
//               border-border
//               bg-surface-secondary
//               cursor-pointer
//               hover:text-text
//             "
//           >
//             ESC
//           </kbd>
//         </div>

//         {/* Content */}
//         <div className="max-h-[420px] overflow-auto p-2">
//           {/* Navigate */}
//           {filteredNavigate.length > 0 && (
//             <div>
//               <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-text-light uppercase tracking-wider">
//                 Navigate
//               </div>

//               {filteredNavigate.map((item) => (
//                 <div
//                   key={item.label}
//                   onClick={() => handleSelect(item.path)}
//                   className="
//                     group
//                     flex
//                     items-center
//                     gap-3
//                     px-3
//                     py-2.5
//                     rounded-lg
//                     cursor-pointer
//                     text-text-secondary
//                     hover:text-text
//                     hover:bg-primary-soft
//                   "
//                 >
//                   <span className="w-7 h-7 rounded-md grid place-items-center bg-surface-secondary text-text-muted group-hover:bg-surface group-hover:text-primary transition-colors">
//                     <span
//                       className="material-symbols-outlined"
//                       style={{ fontSize: "16px" }}
//                     >
//                       {item.icon}
//                     </span>
//                   </span>

//                   <span className="text-[13px] font-medium flex-1">
//                     {item.label}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Actions */}
//           {filteredActions.length > 0 && (
//             <div>
//               <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-text-light uppercase tracking-wider">
//                 Actions
//               </div>

//               {filteredActions.map((item) => (
//                 <div
//                   key={item.label}
//                   onClick={() => handleSelect(item.path)}
//                   className="
//                     group
//                     flex
//                     items-center
//                     gap-3
//                     px-3
//                     py-2.5
//                     rounded-lg
//                     cursor-pointer
//                     text-text-secondary
//                     hover:text-text
//                     hover:bg-primary-soft
//                   "
//                 >
//                   <span className="w-7 h-7 rounded-md grid place-items-center bg-surface-secondary text-text-muted group-hover:bg-surface group-hover:text-primary transition-colors">
//                     <span
//                       className="material-symbols-outlined"
//                       style={{ fontSize: "16px" }}
//                     >
//                       {item.icon}
//                     </span>
//                   </span>

//                   <span className="text-[13px] font-medium flex-1">
//                     {item.label}
//                   </span>

//                   {item.shortcut && (
//                     <span className="text-[11px] text-text-light">
//                       {item.shortcut}
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Recent */}
//           {filteredRecent.length > 0 && (
//             <div>
//               <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-text-light uppercase tracking-wider">
//                 Recent
//               </div>

//               {filteredRecent.map((item) => (
//                 <div
//                   key={item.label}
//                   onClick={() => handleSelect(item.path)}
//                   className="
//                     group
//                     flex
//                     items-center
//                     gap-3
//                     px-3
//                     py-2.5
//                     rounded-lg
//                     cursor-pointer
//                     text-text-secondary
//                     hover:text-text
//                     hover:bg-primary-soft
//                   "
//                 >
//                   <span className="w-7 h-7 rounded-md grid place-items-center bg-surface-secondary text-text-muted group-hover:bg-surface group-hover:text-primary transition-colors">
//                     <span
//                       className="material-symbols-outlined"
//                       style={{ fontSize: "16px" }}
//                     >
//                       {item.icon}
//                     </span>
//                   </span>

//                   <span className="text-[13px] font-medium flex-1">
//                     {item.label}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {totalResults === 0 && (
//             <div className="py-10 text-center text-sm text-text-muted">
//               No results found.
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-5 py-2.5 border-t border-border-light bg-surface-secondary flex gap-4 text-[10.5px] text-text-muted">
//           <span>
//             <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono mr-1">
//               ↑↓
//             </kbd>
//             Navigate
//           </span>

//           <span>
//             <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface font-mono mr-1">
//               ↵
//             </kbd>
//             Select
//           </span>

//           <span className="ml-auto">{totalResults} results</span>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const navigateItems = [
    { icon: "dashboard", label: "Dashboard", path: "/dashboard" },
    { icon: "receipt_long", label: "Invoices", path: "/invoice" },
    { icon: "edit_note", label: "Invoice Composer", path: "/composer" },
    { icon: "group", label: "Clients", path: "/clients" },
    { icon: "assignment", label: "Projects & Milestones", path: "/projects" },
    { icon: "bar_chart", label: "Analytics", path: "/analytics" },
    { icon: "auto_awesome", label: "Recurring Automation", path: "/automation" },
    { icon: "settings", label: "Settings", path: "/settings" },
    {
      icon: "admin_panel_settings",
      label: "Team & Permissions",
      path: "/team",
    },
    { icon: "share", label: "Client Portal", path: "/clientportal" },
    { icon: "loyalty", label: "Pricing", path: "/app/pricing" },
  ];

  const actionItems = [
    {
      icon: "add",
      label: "Create new invoice",
      shortcut: "⇧ N",
      path: "/composer",
    },
    {
      icon: "person_add",
      label: "Add a new client",
      path: "/clients",
    },
    {
      icon: "add_business",
      label: "Add a new project",
      path: "/projects",
    },
    {
      icon: "bolt",
      label: "Quick invoice (composer)",
      path: "/composer",
    },
    {
      icon: "filter_list",
      label: "Open filter panel",
      path: null,
    },
    {
      icon: "notifications",
      label: "Notifications",
      path: null,
    },
  ];

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

        const [dashRes, projRes] = await Promise.allSettled([
          fetch(`${API_URL}/dashboard`, { headers }),
          fetch(`${API_URL}/projects`, { headers }),
        ]);

        const items = [];

        // 1. Latest Invoice
        if (dashRes.status === "fulfilled" && dashRes.value.ok) {
          const dashData = await dashRes.value.json();
          const latestInv = dashData?.recentInvoices?.[0];
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
              path: "/invoice",
            });
          }
        }

        // Fallback for invoice agar dashboard me list na ho
        if (items.length === 0) {
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
                  path: "/invoice",
                });
              }
            }
          } catch (_) {
            // silent catch
          }
        }

        // 2. Latest Project
        if (projRes.status === "fulfilled" && projRes.value.ok) {
          const projData = await projRes.value.json();
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

        if (isMounted && items.length > 0) {
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
      onClose();
      navigate(path);
    }
  };

  // Escape key listener
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
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
        onClose();
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

  const filteredNavigate = navigateItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const filteredActions = actionItems.filter((item) =>
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