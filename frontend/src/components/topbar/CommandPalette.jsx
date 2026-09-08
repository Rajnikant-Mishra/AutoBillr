import { useEffect, useRef, useState } from "react";

export default function CommandPalette({
  isOpen,
  onClose,
}) {
  const modalRef = useRef(null);
  const [search, setSearch] = useState("");

  const navigateItems = [
    { icon: "dashboard", label: "Dashboard" },
    { icon: "receipt_long", label: "Invoices" },
    { icon: "edit_note", label: "Invoice Composer" },
    { icon: "group", label: "Clients" },
    { icon: "assignment", label: "Projects & Milestones" },
    { icon: "bar_chart", label: "Analytics" },
    { icon: "auto_awesome", label: "Recurring Automation" },
    { icon: "settings", label: "Settings" },
    {
      icon: "admin_panel_settings",
      label: "Team & Permissions",
    },
    { icon: "share", label: "Client Portal" },
    { icon: "loyalty", label: "Pricing" },
  ];

  const actionItems = [
    {
      icon: "add",
      label: "Create new invoice",
      shortcut: "⇧ N",
    },
    {
      icon: "person_add",
      label: "Add a new client",
    },
    {
      icon: "add_business",
      label: "Add a new project",
    },
    {
      icon: "bolt",
      label: "Quick invoice (drawer)",
    },
    {
      icon: "filter_list",
      label: "Open filter panel",
    },
    {
      icon: "notifications",
      label: "Notifications",
    },
  ];

  const recentItems = [
    {
      icon: "receipt_long",
      label: "INV-8821 · Apex Partners",
    },
    {
      icon: "assignment",
      label: "Q4 Marketing Campaign · Acme",
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const filteredNavigate = navigateItems.filter((item) =>
    item.label
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredActions = actionItems.filter((item) =>
    item.label
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredRecent = recentItems.filter((item) =>
    item.label
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalResults =
    filteredNavigate.length +
    filteredActions.length +
    filteredRecent.length;

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

          {/* Recent */}
          {filteredRecent.length > 0 && (
            <div>
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-text-light uppercase tracking-wider">
                Recent
              </div>

              {filteredRecent.map((item) => (
                <div
                  key={item.label}
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

          <span className="ml-auto">
            {totalResults} results
          </span>
        </div>
      </div>
    </div>
  );
}