// components/projects/MilestoneTimeline.jsx

import Badge from "../ui/Badge";
import useCurrency from "../../hooks/useCurrency";
export default function MilestoneTimeline({
  title,
  date,
  amount,
  status,
  done = false,
  onClick,
}) {
   const { format } = useCurrency();
  const statusConfig = {
    paid: {
      dot: "bg-teal-500 border-teal-500",
      badgeVariant: "paid",
      cardClass: "bg-slate-50 border-slate-100",
    },

    pending: {
      dot: "bg-white border-amber-500",
      badgeVariant: "pending",
      cardClass: "bg-amber-50 border-amber-200",
    },

    scheduled: {
      dot: "bg-white border-slate-300",
      badgeVariant: "scheduled",
      cardClass: "bg-slate-50 border-slate-100",
    },
  };

  const config = statusConfig[status] || statusConfig.scheduled;

  const statusIcons = {
    paid: "check_circle",
    pending: "schedule",
    scheduled: "event",
  };

  return (
    <div
      className="relative cursor-pointer group"
      onClick={onClick}
    >
      {/* Timeline Dot */}
      <div
        className={`absolute -left-4 top-3 w-3 h-3 rounded-full border-2 ${config.dot}`}
      />

      {/* Card */}
      <div
        className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${config.cardClass}`}
      >
        <div className="flex items-start justify-between">
          {/* Left Side */}
          <div className="flex items-start gap-2 flex-1">
            <span
              className={`material-symbols-outlined text-lg mt-0.5
                ${
                  status === "paid"
                    ? "text-teal-600"
                    : status === "pending"
                    ? "text-amber-500"
                    : "text-slate-400"
                }`}
            >
              {statusIcons[status]}
            </span>

            <div>
              <div
                className={`text-[13px] font-bold ${
                  done || status === "paid"
                    ? "line-through text-slate-400"
                    : "text-slate-900"
                }`}
              >
                {title}
              </div>

              <div className="text-[11px] text-slate-500 mt-0.5">
                {date}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="text-right">
            <div className="text-[13px] font-bold text-slate-900 tabular">
                {format(Number(amount) || 0)}
            </div>

            <Badge
              label={status}
              variant={config.badgeVariant}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}