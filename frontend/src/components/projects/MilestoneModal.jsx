import Modal from "../ui/Modal";
import FormInput from "../ui/FormInput";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { showSuccessToast, showErrorToast } from "../ui/CustomToast";

export default function MilestoneModal({
  isOpen,
  onClose,
  milestone,
  setMilestone,
   project,
  onSave,
  projectId,           // ← NEW: Pass project ID
  milestoneIndex,      // ← NEW: Index in milestones array
}) {
  if (!milestone) return null;
 const isEditing =
  milestoneIndex !== null &&
  milestoneIndex !== undefined &&
  milestoneIndex >= 0;
  const handleSave = async () => {
    if (!milestone.title?.trim()) {
      showErrorToast("Milestone name is required");
      return;
    }
    if (!milestone.dueDate) {
      showErrorToast("Due date is required");
      return;
    }
    if (Number(milestone.amount) <= 0) {
      showErrorToast("Amount must be greater than 0");
      return;
    }

    try {
    

const response = await fetch(
  isEditing
    ? `http://localhost:5000/api/projects/${projectId}/milestones/${milestoneIndex}`
    : `http://localhost:5000/api/projects/${projectId}/milestones`,
  {
    method: isEditing ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(milestone),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save milestone");
      }

      showSuccessToast(
  isEditing
    ? "Milestone updated successfully"
    : "Milestone created successfully"
);
      onSave();        // Call parent refresh
      onClose();
    } catch (error) {
      console.error(error);
      showErrorToast(error.message || "Failed to save milestone");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    title={isEditing ? "Edit Milestone" : "New Milestone"}
      size="sm"
      position="right-modal"
    >
      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Milestone Name"
            icon="task"
            value={milestone.title}
            placeholder="Milestone name"
            onChange={(e) =>
              setMilestone({ ...milestone, title: e.target.value })
            }
          />

          <FormInput
            label="Amount"
            icon="payments"
            type="number"
            value={milestone.amount}
            placeholder="0"
            onChange={(e) =>
              setMilestone({
                ...milestone,
                amount: Number(e.target.value),
              })
            }
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Due Date"
            icon="calendar_month"
            type="date"
            value={
              milestone.dueDate
                ? new Date(milestone.dueDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setMilestone({ ...milestone, dueDate: e.target.value })
            }
          />

          <div>
            <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
              Status
            </label>
            <select
              value={milestone.status}
              onChange={(e) =>
                setMilestone({ ...milestone, status: e.target.value })
              }
              className="w-full h-[42px] px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="primary" icon="save" onClick={handleSave}>
  {isEditing ? "Update Milestone" : "Create Milestone"}
</Button>
        </div>
      </div>
    </Modal>
  );
}