export default function AutomationToggle({
  title,
  description,
  icon,
  enabled = false,
  onToggle,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 grid place-items-center">
          <span className="material-symbols-outlined">
            {icon}
          </span>
        </div>

        <div>
          <div className="text-[13px] font-bold">
            {title}
          </div>

          <div className="text-[11px] text-slate-500">
            {description}
          </div>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full relative transition ${
          enabled
            ? "bg-teal-600"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
            enabled
              ? "right-0.5"
              : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}