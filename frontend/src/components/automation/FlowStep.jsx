export default function FlowStep({
  icon,
  title,
  description,
  active = false,
  iconColor = "text-slate-600",
  ringColor = "ring-slate-100",
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 flex-1">
      <div
        className={`
          w-14 h-14 rounded-full
          grid place-items-center
          shadow-lg transition-all

          ${
            active
              ? "bg-teal-600 text-white ring-8 ring-teal-600/10"
              : `bg-white ${iconColor} ring-4 ${ringColor}`
          }
        `}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 22 }}
        >
          {icon}
        </span>
      </div>

      <div>
        <p
          className={`font-bold text-sm ${
            active
              ? "text-teal-700"
              : "text-slate-900"
          }`}
        >
          {title}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}