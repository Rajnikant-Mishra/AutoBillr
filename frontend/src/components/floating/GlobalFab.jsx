import { useState } from "react";
import QuickInvoiceDrawer from "./QuickInvoiceDrawer";
import { useUIStore } from "../../store/uiStore";

export default function GlobalFab() {
  const [open, setOpen] = useState(false);

  const overlayCount = useUIStore((s) => s.overlayCount);

  // Hide FAB whenever any modal/drawer is open
  if (overlayCount > 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Create quick invoice"
        className="
          fixed bottom-6 right-6 z-[999]
          w-14 h-14 rounded-full
          bg-primary text-text-inverse
          shadow-xl shadow-primary/30
          hover:bg-primary-hover
          hover:scale-105
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-primary/40
          focus-visible:ring-offset-2
          transition-all duration-fast
          flex items-center justify-center
        "
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden>
          add
        </span>
      </button>

      <QuickInvoiceDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}