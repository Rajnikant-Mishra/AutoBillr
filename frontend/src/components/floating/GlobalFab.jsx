import { useState } from "react";
import QuickInvoiceDrawer from "./QuickInvoiceDrawer";
import { useUIStore } from "../../store/uiStore";

export default function GlobalFab() {
  const [open, setOpen] = useState(false);

  const overlayCount = useUIStore(
    (s) => s.overlayCount
  );

  // Hide FAB whenever any modal/drawer is open
  if (overlayCount > 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 right-6 z-[999]
          w-14 h-14 rounded-full
          bg-teal-600 text-white
          shadow-xl shadow-teal-600/30
          hover:bg-teal-700
          hover:scale-105
          transition-all duration-200
          flex items-center justify-center
        "
      >
        <span className="material-symbols-outlined text-[28px]">
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