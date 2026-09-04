import Card from "./Card";

export default function StatCard({
  title,
  value,
  sub,
  change,
  badge,
  icon,
  iconColor = "text-primary",
  changeColor = "text-emerald-600",
  badgeColor = "bg-primary-light text-primary",
  showProgress = false,
  progressValue = 0,
  className = "",
  variant = "default",
}) {
  const safeProgress = Math.min(
    100,
    Math.max(0, Number(progressValue) || 0)
  );

  return (
    <Card
      hover
      className={`min-h-[172px] p-6 relative overflow-hidden ${className}`}
    >
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
              className={`text-xs font-semibold leading-tight ${changeColor}`}
            >
              {change}
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between h-full">
        <div className="space-y-4 flex-1 min-w-0">
          {icon && variant === "dashboard" && (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <span
                className={`material-symbols-outlined text-3xl ${iconColor}`}
                aria-hidden="true"
              >
                {icon}
              </span>
            </div>
          )}

          <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">
            {title}
          </p>

          <h2 className="text-[30px] leading-none font-bold tracking-tighter text-slate-900">
            {value}
          </h2>

          {sub && (
            <p className="text-sm text-slate-600 font-medium">
              {sub}
            </p>
          )}

          {showProgress && (
            <div className="mt-3">
              <div
                className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={safeProgress}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${safeProgress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {icon && variant !== "dashboard" && (
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 mt-1">
            <span
              className={`material-symbols-outlined text-5xl ${iconColor}`}
              aria-hidden="true"
            >
              {icon}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}