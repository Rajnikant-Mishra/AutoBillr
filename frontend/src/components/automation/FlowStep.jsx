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
          ${
            active
              ? "bg-primary text-text-inverse ring-8 ring-primary/10"
              : `bg-surface ${iconColor} ring-4 ${ringColor}`
          }
        `}
      >
        <span className="material-symbols-outlined text-[22px]" aria-hidden>
          {icon}
        </span>
      </div>

      <div>
        <p
          className={`font-bold text-sm ${
            active ? "text-primary-dark" : "text-text"
          }`}
        >
          {title}
        </p>

        <p className="text-xs text-text-muted mt-1">{description}</p>
      </div>
    </div>
  );
}