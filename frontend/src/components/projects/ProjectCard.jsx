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
  progress: initialProgress = 0, // fallback
  milestones = [],
  members = 8,
  icon = "folder",
  iconBg = "bg-teal-100",
  iconColor = "text-teal-700",
  onClick,
  isSelected = false,
}) {
const { format } = useCurrency();
  // Safe client name extraction
  const clientName = typeof client === "object" && client !== null 
    ? client.name || client.clientName || "Unknown Client"
    : client || "Unknown Client";

  // Calculate progress based on paid milestones
  const calculateProgress = () => {
    if (!milestones || milestones.length === 0) {
      return initialProgress || 0;
    }

    const paidCount = milestones.filter(m => m.status === "paid").length;
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

    const allPaid = milestones.every((m) => m.status === "paid");
    if (allPaid) return "PAID";

    const hasPending = milestones.some((m) =>
      ["pending", "scheduled"].includes(m.status)
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

  return (
    <Card
      hover
      className={`group border-2 transition-all duration-300 cursor-pointer
      ${
        isSelected
          ? "border-teal-500 shadow-md"
          : "border-transparent hover:border-teal-200"
      }`}
      onClick={onClick}
    >
      <div className="p-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl grid place-items-center ${iconBg}`}
            >
              <span
                className={`material-symbols-outlined ${iconColor}`}
                style={{ fontSize: "22px" }}
              >
                {icon}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-slate-900 leading-tight">
                {title}
              </div>

              <div className="text-xs text-slate-500">
                {clientName} ·{" "}
                {dueDate
                  ? new Date(dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-"}
              </div>
            </div>
          </div>

          <Badge
            label={badgeProps.label}
            variant={badgeProps.variant}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Budget ·{" "}
              <span className="tabular font-semibold text-slate-900">
               {format(budget || 0)}
              </span>
            </span>

            <span className="text-slate-500">
              Billed ·{" "}
              <span className="tabular font-semibold text-teal-600">
                 {format(billed || 0)}
              </span>
            </span>
          </div>

          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700 tabular">
              {progress}% complete
            </span>

            <span className="text-slate-500">
              {members} members
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}



