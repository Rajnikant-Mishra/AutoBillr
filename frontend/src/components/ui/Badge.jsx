// components/ui/Badge.jsx

export default function Badge({
  label,
  variant = "active",
  className = "",
}) {
const variants = {
  active: {
    bg: "var(--primary-light)",
    text: "var(--primary)",
    dot: "var(--primary)",
  },

  paid: {
    bg: "var(--primary-light)",
    text: "var(--primary)",
    dot: "var(--primary)",
  },

  pending: {
    bg: "var(--warning-light)",
    text: "var(--warning)",
    dot: "var(--warning)",
  },

  risk: {
    bg: "var(--danger-light)",
    text: "var(--danger)",
    dot: "var(--danger)",
  },

  scheduled: {
    bg: "var(--info-light)",
    text: "var(--info)",
    dot: "var(--info)",
  },

  default: {
    bg: "#f1f5f9",
    text: "#475569",
    dot: "#64748b",
  },
};
  const style =
    variants[variant] || variants.default;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${className}`}
      style={{
        background: style.bg,
        color: style.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: style.dot,
        }}
      />
      {label}
    </div>
  );
}