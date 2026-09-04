// components/ui/ProjectCard.jsx

import Card from "../ui/Card";
import Badge from "../ui/Badge";
import useCurrency from "../../hooks/useCurrency";

export default function ProjectCard({
  title,
  client,
  dueDate,
  budget = 0,
  billed = 0,
  progress: initialProgress = 0,
  milestones = [],
  members = 8,
  icon = "folder",
  onClick,
  isSelected = false,
}) {
  const { format } = useCurrency();

  const clientName =
    typeof client === "object" && client !== null
      ? client.name || client.clientName || "Unknown Client"
      : client || "Unknown Client";

  const calculateProgress = () => {
    if (!milestones || milestones.length === 0) {
      return initialProgress || 0;
    }

    const paidCount = milestones.filter(
      (m) => String(m?.status || "").toLowerCase() === "paid"
    ).length;

    return Math.round((paidCount / milestones.length) * 100);
  };

  const progress = calculateProgress();

  const getProjectStatus = () => {
    const budgetAmount = Number(budget || 0);
    const billedAmount = Number(billed || 0);

    if (budgetAmount > 0 && billedAmount > budgetAmount) {
      return "AT_RISK";
    }

    if (!milestones || milestones.length === 0) {
      return "ACTIVE";
    }

    const allPaid = milestones.every(
      (m) => String(m?.status || "").toLowerCase() === "paid"
    );
    if (allPaid) return "PAID";

    const hasPending = milestones.some((m) =>
      ["pending", "scheduled"].includes(
        String(m?.status || "").toLowerCase()
      )
    );

    return hasPending ? "PENDING" : "ACTIVE";
  };

  const projectStatus = getProjectStatus();

  const getBadgeProps = (status) => {
    switch (status) {
      case "ACTIVE":
        return { label: "ACTIVE", variant: "active" };
      case "PAID":
        return { label: "PAID", variant: "paid" };
      case "PENDING":
        return { label: "PENDING", variant: "warning" };
      case "AT_RISK":
        return { label: "AT RISK", variant: "risk" };
      default:
        return { label: "ACTIVE", variant: "active" };
    }
  };

  const badgeProps = getBadgeProps(projectStatus);

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Card
      hover
      onClick={onClick}
      className={`
        group border-2 cursor-pointer
        transition-all duration-fast
        ${
          isSelected
            ? "border-primary shadow-md"
            : "border-transparent hover:border-primary/30"
        }
      `}
    >
      <div className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="
                w-11 h-11 rounded-xl
                bg-primary-soft
                grid place-items-center
                shrink-0
              "
            >
              <span className="material-symbols-outlined text-[22px] text-primary">
                {icon}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-text leading-tight truncate">
                {title}
              </div>
              <div className="text-xs text-text-muted truncate">
                {clientName} · {formattedDueDate}
              </div>
            </div>
          </div>

          <Badge label={badgeProps.label} variant={badgeProps.variant} />
        </div>

        {/* Stats + Progress */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              Budget ·{" "}
              <span className="tabular-nums font-semibold text-text">
                {format(budget || 0)}
              </span>
            </span>

            <span className="text-text-muted">
              Billed ·{" "}
              <span className="tabular-nums font-semibold text-primary">
                {format(billed || 0)}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
            <div
              className="
                h-full rounded-full
                bg-gradient-to-r from-primary to-info
                transition-all duration-slow
              "
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-text-secondary tabular-nums">
              {progress}% complete
            </span>
            <span className="text-text-muted">{members} members</span>
          </div>
        </div>
      </div>
    </Card>
  );
}