import MilestoneTimeline from "./MilestoneTimeline";
import Button from "../ui/Button";
import useCurrency from "../../hooks/useCurrency";

export default function ProjectDetailPanel({
  project,
  onAddMilestone,
  onMilestoneClick,
}) {
  const { format } = useCurrency();

  if (!project) {
    return (
      <div className="bg-surface rounded-xl border border-border-light p-6 text-text-muted">
        Loading...
      </div>
    );
  }

  // Safe client name
  const clientName =
    typeof project.client === "object" && project.client !== null
      ? project.client.name ||
        project.client.clientName ||
        project.clientName ||
        "Unknown Client"
      : project.clientName || project.client || "Unknown Client";

  // Safe values
  const budget = Number(project.budget || 0);
  const billed = Number(project.billed || 0);
  const progress = Number(project.progress || 0);
  const milestones = Array.isArray(project.milestones)
    ? project.milestones
    : [];

  const formattedDueDate = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No Due Date";

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border-light overflow-hidden sticky top-24">
      {/* Header */}
      <div className="p-5 border-b border-border-light bg-gradient-to-br from-primary-soft to-surface">
        <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">
          Project Detail
        </div>

        <h3 className="text-lg font-bold text-text">
          {project.title || "Untitled Project"}
        </h3>

        <p className="text-sm text-text-muted mt-1">
          {clientName} · {formattedDueDate}
        </p>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Box label="Budget" value={format(budget)} />
          <Box label="Billed" value={format(billed)} highlight />
          <Box
            label="Progress"
            value={`${Math.min(Math.max(progress, 0), 100)}%`}
          />
        </div>

        {/* Milestone header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11.5px] font-bold text-text-secondary uppercase tracking-widest">
            Milestones
          </div>
          <span className="text-[11px] font-semibold text-text-muted">
            {milestones.length} Items
          </span>
        </div>

        {/* Milestones list */}
        {milestones.length > 0 ? (
          <div className="relative space-y-3 pl-4">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />

            {milestones.map((milestone, index) => (
              <MilestoneTimeline
                key={milestone.id || milestone.id || index}
                title={milestone.title || "Untitled Milestone"}
                date={
                  milestone.dueDate
                    ? new Date(milestone.dueDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )
                    : "—"
                }
                amount={Number(milestone.amount || 0)}
                status={String(milestone.status || "scheduled").toLowerCase()}
                done={
                  String(milestone.status || "").toLowerCase() === "paid"
                }
                onClick={() => onMilestoneClick?.(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-border rounded-xl bg-surface-secondary">
            <span className="material-symbols-outlined text-4xl text-text-light mb-2 block">
              event_note
            </span>

            <p className="text-sm font-medium text-text-muted">
              No milestones configured
            </p>

            <button
              type="button"
              onClick={onAddMilestone}
              className="
                mt-3 text-xs font-semibold
                text-primary hover:text-primary-hover
                transition-colors duration-fast
              "
            >
              Add First Milestone
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 pt-5 border-t border-border-light flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={onAddMilestone}
          >
            Add Milestone
          </Button>

          <Button variant="primary" size="sm" fullWidth>
            Bill Now
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Summary Box
-------------------------------------------------- */

function Box({ label, value, highlight = false }) {
  return (
    <div className="bg-surface-secondary rounded-lg p-3 text-center">
      <div className="text-[9.5px] font-bold text-text-light uppercase tracking-wider">
        {label}
      </div>

      <div
        className={`
          text-lg font-bold mt-1 tabular-nums
          ${highlight ? "text-primary" : "text-text"}
        `}
      >
        {value}
      </div>
    </div>
  );
}