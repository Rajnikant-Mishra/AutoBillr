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

  const normalizedStatus =
    String(
      status || "scheduled"
    ).toLowerCase();

  const statusConfig = {
    paid: {
      dot: "bg-success border-success",
      icon: "text-success",
      badgeVariant: "paid",
      cardClass:
        "bg-success-soft border-success/20",
    },

    pending: {
      dot:
        "bg-surface border-warning",
      icon: "text-warning",
      badgeVariant: "pending",
      cardClass:
        "bg-warning-soft border-warning/20",
    },

    scheduled: {
      dot:
        "bg-surface border-border-dark",
      icon: "text-text-light",
      badgeVariant: "scheduled",
      cardClass:
        "bg-surface-secondary border-border-light",
    },
  };

  const config =
    statusConfig[normalizedStatus] ||
    statusConfig.scheduled;

  const statusIcons = {
    paid: "check_circle",
    pending: "schedule",
    scheduled: "event",
  };

  const isCompleted =
    done ||
    normalizedStatus === "paid";

  return (
    <div
      className="relative cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <div
        className={`
          absolute -left-4 top-3
          w-3 h-3 rounded-full border-2
          ${config.dot}
        `}
        aria-hidden="true"
      />

      <div
        className={`
          p-3 rounded-lg border
          transition-all
          hover:shadow-sm
          group-hover:border-border
          ${config.cardClass}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span
              className={`
                material-symbols-outlined
                text-lg mt-0.5 shrink-0
                ${config.icon}
              `}
              aria-hidden="true"
            >
              {statusIcons[
                normalizedStatus
              ] || "event"}
            </span>

            <div className="min-w-0">
              <div
                className={`
                  text-[13px]
                  font-bold
                  truncate
                  ${
                    isCompleted
                      ? "line-through text-text-light"
                      : "text-text"
                  }
                `}
              >
                {title ||
                  "Untitled Milestone"}
              </div>

              <div className="text-[11px] text-text-muted mt-0.5">
                {date || "—"}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[13px] font-bold text-text tabular-nums">
              {format(
                Number(amount) || 0
              )}
            </div>

            <Badge
              label={normalizedStatus}
              variant={
                config.badgeVariant
              }
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}