export default function FlowStep({
  icon,
  title,
  description,
  active = false,
  iconColor = "text-text-secondary",
  ringColor = "ring-surface-secondary",
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 flex-1">
      <div
        className={`
          w-14 h-14 rounded-full
          grid place-items-center
          shadow-lg transition-all duration-fast
          ${active ? "ring-8" : `ring-4 ${ringColor}`}
        `}
        style={
          active
            ? {
                // Uses design-system tokens — change --color-primary in CSS to recolor everything
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text-inverse)",
                boxShadow: "0 0 0 8px color-mix(in srgb, var(--color-primary) 15%, transparent)",
              }
            : undefined
        }
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            active ? "" : iconColor
          }`}
          aria-hidden
        >
          {icon}
        </span>
      </div>

      <div>
        <p
          className="font-bold text-sm"
          style={
            active
              ? { color: "var(--color-primary-dark)" }
              : undefined
          }
        >
          <span className={active ? "" : "text-text"}>{title}</span>
        </p>

        <p className="text-xs text-text-muted mt-1">{description}</p>
      </div>
    </div>
  );
}