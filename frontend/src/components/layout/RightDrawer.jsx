import React, { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useUIStore } from "../../store/uiStore";

export default function RightDrawer({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  width = "max-w-2xl",
}) {
  const openOverlay = useUIStore((state) => state.openOverlay);
  const closeOverlay = useUIStore((state) => state.closeOverlay);

  // Global Overlay Counter
  useEffect(() => {
    if (!isOpen) return;

    openOverlay();
    return () => closeOverlay();
  }, [isOpen, openOverlay, closeOverlay]);

  // Body Scroll Lock + ESC Key
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-[100]
          bg-black/40 backdrop-blur-[2px]
          transition-all duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 right-0 bottom-0 z-[101]
          w-full ${width}
          bg-surface
          border-l border-border
          shadow-xl
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="flex items-center gap-2.5 text-base font-bold text-text">
            {icon && (
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: 18 }}
              >
                {icon}
              </span>
            )}
            {title}
          </h3>

          <button
            onClick={onClose}
            className="
              p-1 rounded-lg
              text-text-light
              hover:text-text
              hover:bg-surface-hover
              transition-colors duration-200
              outline-none
              focus-visible:ring-2 focus-visible:ring-primary
            "
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border-light bg-surface-secondary">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}