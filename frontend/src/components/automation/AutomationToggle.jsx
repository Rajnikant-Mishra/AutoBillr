export default function AutomationToggle({
  title,
  description,
  icon,
  enabled = false,
  onToggle,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            {icon}
          </span>
        </div>

        <div className="min-w-0">
          <div className="text-[13px] font-bold text-text">{title}</div>
          <div className="text-[11px] text-text-muted">{description}</div>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${title}`}
        onClick={onToggle}
        className={`
          w-11 h-6 rounded-full relative shrink-0
          transition-colors duration-fast
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
          ${enabled ? "bg-primary" : "bg-border-dark"}
        `}
      >
        <span
          aria-hidden
          className={`
            absolute top-0.5 w-5 h-5
            bg-surface rounded-full shadow-sm
            transition-all duration-fast
            ${enabled ? "right-0.5" : "left-0.5"}
          `}
        />
      </button>
    </div>
  );
}