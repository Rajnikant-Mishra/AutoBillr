import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../store/uiStore";
import { usePermissions } from "../../hooks/usePermissions";

export default function GlobalFab() {
  const navigate = useNavigate();
  const { can, role } = usePermissions();
  const overlayCount = useUIStore((s) => s.overlayCount);


  if (overlayCount > 0) return null;
  const canCreate = role === "Owner" || role === "Admin" || can("invoices:create");
  if (!canCreate) return null;

  const handleClick = (e) => {
    e.preventDefault();
    navigate("/composer"); 
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Create invoice"
      title="Create Invoice"
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
        cursor-pointer
      "
    >
      <span className="material-symbols-outlined text-[28px]" aria-hidden>
        add
      </span>
    </button>
  );
}