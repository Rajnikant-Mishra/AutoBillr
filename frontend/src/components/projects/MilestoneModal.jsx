// src/components/.../MilestoneModal.jsx

import Modal from "../ui/Modal";
import FormInput from "../ui/FormInput";
import Button from "../ui/Button";
import {
  showSuccessToast,
  showErrorToast,
} from "../ui/CustomToast";
import { getAuthToken } from "../../utils/auth";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export default function MilestoneModal({
  isOpen,
  onClose,
  milestone,
  setMilestone,
  project,
  onSave,
  projectId,
}) {
  if (!milestone) return null;

  const isEditing = Boolean(milestone?.id);
  const actualProjectId = projectId || project?.id;

  const formatDateForInput = (date) => {
    if (!date) return "";

    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

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

    if (!actualProjectId) {
      showErrorToast("Project ID is missing");
      return;
    }

    // Auth
    const token = getAuthToken();
    if (!token) {
      showErrorToast("Authentication required");
      return;
    }

    // URL
    let url;
    if (isEditing) {
      if (!milestone.id) {
        showErrorToast("Milestone ID is missing");
        return;
      }
      url = `${API_BASE}/projects/${actualProjectId}/milestones/${milestone.id}`;
    } else {
      url = `${API_BASE}/projects/${actualProjectId}/milestones`;
    }

    // Payload
    const payload = {
      title: milestone.title.trim(),
      amount: Number(milestone.amount),
      dueDate: formatDateForInput(milestone.dueDate),
      status: String(milestone.status || "scheduled").toLowerCase(),
    };

    try {
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      let data = {};

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text || `Request failed with status ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to ${isEditing ? "update" : "create"} milestone`
        );
      }

      showSuccessToast(
        isEditing
          ? "Milestone updated successfully"
          : "Milestone created successfully"
      );

      await onSave();
    } catch (error) {
      console.error("MILESTONE SAVE ERROR:", error);
      showErrorToast(error?.message || "Failed to save milestone");
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
            value={milestone.title || ""}
            placeholder="Milestone name"
            onChange={(e) =>
              setMilestone({
                ...milestone,
                title: e.target.value,
              })
            }
          />

          <FormInput
            label="Amount"
            icon="payments"
            type="number"
            value={milestone.amount ?? ""}
            placeholder="0"
            onChange={(e) =>
              setMilestone({
                ...milestone,
                amount: e.target.value === "" ? "" : Number(e.target.value),
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
            value={formatDateForInput(milestone.dueDate)}
            onChange={(e) =>
              setMilestone({
                ...milestone,
                dueDate: e.target.value,
              })
            }
          />

          <div>
            <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
              Status
            </label>

            <select
              value={milestone.status || "scheduled"}
              onChange={(e) =>
                setMilestone({
                  ...milestone,
                  status: e.target.value,
                })
              }
              className="
                w-full h-[42px] px-3
                bg-[var(--input-background)]
                border border-border
                rounded-lg
                text-sm text-text
                focus:outline-none
                focus:ring-2 focus:ring-primary/20
                focus:border-primary
                transition-colors duration-fast
              "
            >
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
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