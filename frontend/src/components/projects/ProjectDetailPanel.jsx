// components/projects/ProjectDetailPanel.jsx
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
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        Loading...
      </div>
    );
  }

  // Safe client name extraction
  const clientName = typeof project.client === "object" && project.client !== null
    ? project.client.name || project.clientName || "Unknown Client"
    : project.client || "Unknown Client";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
      
      {/* HEADER */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-teal-50 to-white">
        <div className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-1">
          PROJECT DETAIL
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          {project.title}
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          {clientName} ·{" "}
          {project.dueDate
            ? new Date(project.dueDate).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )
            : "No Due Date"}
        </p>
      </div>

      {/* CONTENT */}
      <div className="p-5">

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-3 mb-5">
         <Box
  label="Budget"
  value={format(project.budget || 0)}
/>

<Box
  label="Billed"
  value={format(project.billed || 0)}
  highlight
/>

          <Box
            label="Progress"
            value={`${project.progress || 0}%`}
          />
        </div>

        {/* MILESTONE HEADER */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest">
            Milestones
          </div>

          <span className="text-[11px] font-semibold text-slate-500">
            {project.milestones?.length || 0} Items
          </span>
        </div>

        {/* MILESTONES */}
        {project.milestones?.length > 0 ? (
          <div className="relative space-y-3 pl-4">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-200" />

            {project.milestones.map((milestone, index) => (
              <MilestoneTimeline
                key={index}
                title={milestone.title}
                date={
                  milestone.dueDate
                    ? new Date(milestone.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "-"
                }
                  amount={format(milestone.amount || 0)}
                status={milestone.status}
                done={milestone.status === "paid"}
              onClick={() => onMilestoneClick?.(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
              event_note
            </span>

            <p className="text-sm font-medium text-slate-500">
              No milestones configured
            </p>

            <button
              onClick={onAddMilestone}
              className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Add First Milestone
            </button>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex gap-2">
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

/* SUMMARY BOX */
function Box({ label, value, highlight = false }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-center">
      <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </div>

      <div
        className={`text-lg font-bold mt-1 tabular ${
          highlight ? "text-teal-600" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}