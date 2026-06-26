// components/ui/StatCard.jsx
import Card from "./Card";

export default function StatCard({
  title,
  value,
  sub,
  change,
  badge,
  icon,
  iconColor = "text-teal-600",
  changeColor = "text-emerald-600",
  badgeColor = "bg-teal-50 text-teal-700",
  showProgress = false,
  progressValue = 0,
  className = "",
  variant = "default",
  dashboardCompact = false, // ADD THIS
}) {
  return (
    <Card
      hover
      className={`min-h-[172px] p-6 relative overflow-hidden ${className}`}
    >
      {/* Top Badge / Change Indicator */}
      {(badge || change) && (
  <div
    className={
      variant === "dashboard"
        ? "absolute top-4 right-4 max-w-[120px] text-right"
        : "absolute top-6 right-6 flex items-center gap-1"
    }
  >
    {badge && (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
      >
        {badge}
      </span>
    )}

    {change && (
      <span
        className={`
          text-xs font-semibold leading-tight
          ${changeColor}
        `}
      >
        {change}
      </span>
    )}
  </div>
)}

      <div className="flex items-start justify-between h-full">
        <div className="space-y-4 flex-1">
          {/* Icon (Dashboard style - top left) */}
          {icon && variant === "dashboard" && (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <span className={`material-symbols-outlined text-3xl ${iconColor}`}>
                {icon}
              </span>
            </div>
          )}

          {/* Title */}
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">
            {title}
          </p>

          {/* Value */}
          <h2 className="text-[30px] leading-none font-bold tracking-tighter text-slate-900">
            {value}
          </h2>

          {/* Subtitle */}
          {sub && (
            <p className="text-sm text-slate-600 font-medium">{sub}</p>
          )}

          {/* Progress Bar (for Dashboard) */}
          {showProgress && (
            <div className="mt-3">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Icon (Projects style) */}
        {icon && variant !== "dashboard" && (
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
            <span className={`material-symbols-outlined text-5xl ${iconColor}`}>
              {icon}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}