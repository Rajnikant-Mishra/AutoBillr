import React, { useCallback, useEffect, useMemo, useState } from "react";
import RightDrawer from "../layout/RightDrawer";
import {
  showErrorToast,
  showSuccessToast,
} from "../ui/CustomToast";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import useCurrency from "../../hooks/useCurrency";
import { getAuthToken } from "../../utils/auth";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const INITIAL_FORM_DATA = {
  title: "",
  client: "",
  clientName: "",
  projectType: "Fixed Fee",
  startDate: "",
  endDate: "",
  description: "",
  budget: "",
  billingMethod: "Milestone",
  autoInvoice: true,
  color: "bg-primary",
};

const INITIAL_TEAM_MEMBERS = ["Alex Sterling", "Marcus Chen"];

const ALL_TEAM_MEMBERS = [
  "Alex Sterling",
  "Marcus Chen",
  "Diego Ruiz",
  "Aria Singh",
  "Sophia Taylor",
  "Ethan Parker",
  "Olivia Brown",
];

const BILLING_OPTIONS = [
  { label: "Milestone", icon: "flag" },
  { label: "Hourly", icon: "schedule" },
  { label: "Retainer", icon: "sync" },
  { label: "Fixed Fee", icon: "request_quote" },
];

const PROJECT_COLORS = [
  "bg-primary",
  "bg-info",
  "bg-warning",
  "bg-danger",
  "bg-secondary",
  "bg-success",
];

const createEmptyMilestone = () => ({
  title: "",
  dueDate: "",
  amount: 0,
  status: "scheduled",
});

const getClientId = (client) =>
  client?._id ?? client?.id ?? client?.clientId ?? null;

const getClientName = (client) =>
  client?.name ?? client?.clientName ?? "Unnamed Client";

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status})`
    );
  }
};

const selectClassName = `
  w-full px-3.5 py-2.5
  border border-border rounded-lg text-sm
  bg-[var(--input-background)] text-text
  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
  disabled:bg-[var(--input-background-disabled)] disabled:cursor-not-allowed
  transition-colors duration-fast
`;

const sectionLabelClass =
  "text-[11.5px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2";

const stepBadgeClass =
  "w-5 h-5 rounded-md bg-primary-soft text-primary grid place-items-center text-[10px] font-black";

export default function ProjectDrawer({
  isOpen,
  onClose,
  onProjectCreated,
}) {
  const { format, selectedCurrency, currencySymbol } = useCurrency();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [clients, setClients] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [teamMembers, setTeamMembers] = useState(INITIAL_TEAM_MEMBERS);
  const [removedMembers, setRemovedMembers] = useState([]);
  const [nextMemberIndex, setNextMemberIndex] = useState(
    INITIAL_TEAM_MEMBERS.length
  );
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setMilestones([]);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setRemovedMembers([]);
    setNextMemberIndex(INITIAL_TEAM_MEMBERS.length);
  }, []);

  const handleClose = useCallback(() => {
    if (loading) return;
    resetForm();
    onClose?.();
  }, [loading, onClose, resetForm]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const fetchClients = useCallback(async (signal) => {
    try {
      setClientsLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/clients`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message || `Failed to load clients (${response.status})`
        );
      }

      const clientList =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.clients)
          ? data.clients
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.clients)
          ? data.data.clients
          : Array.isArray(data?.result)
          ? data.result
          : [];

      const normalized = clientList.map((c) => ({
        ...c,
        id: getClientId(c),
        name: getClientName(c),
      }));

      setClients(normalized);
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Failed to fetch clients:", error);
      setClients([]);
      showErrorToast(error?.message || "Failed to load clients");
    } finally {
      if (!signal?.aborted) setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    fetchClients(controller.signal);
    return () => controller.abort();
  }, [isOpen, fetchClients]);

  const handleClientChange = useCallback(
    (event) => {
      const clientId = event.target.value;
      const selectedClient = clients.find(
        (c) => String(getClientId(c)) === String(clientId)
      );

      setFormData((prev) => ({
        ...prev,
        client: getClientId(selectedClient) || "",
        clientName: getClientName(selectedClient),
      }));
    },
    [clients]
  );

  const addMilestone = useCallback(() => {
    setMilestones((prev) => [...prev, createEmptyMilestone()]);
  }, []);

  const deleteMilestone = useCallback((index) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateMilestone = useCallback((index, field, value) => {
    setMilestones((prev) =>
      prev.map((m, i) => {
        if (i !== index) return m;
        return {
          ...m,
          [field]:
            field === "amount"
              ? value === ""
                ? ""
                : Number(value)
              : value,
        };
      })
    );
  }, []);

  const addMember = useCallback(() => {
    if (nextMemberIndex < ALL_TEAM_MEMBERS.length) {
      const nextMember = ALL_TEAM_MEMBERS[nextMemberIndex];
      setTeamMembers((prev) =>
        prev.includes(nextMember) ? prev : [...prev, nextMember]
      );
      setNextMemberIndex((prev) => prev + 1);
      return;
    }

    if (removedMembers.length > 0) {
      const memberToRestore = removedMembers[0];
      setTeamMembers((prev) =>
        prev.includes(memberToRestore)
          ? prev
          : [...prev, memberToRestore]
      );
      setRemovedMembers((prev) => prev.slice(1));
    }
  }, [nextMemberIndex, removedMembers]);

  const removeMember = useCallback((member) => {
    setTeamMembers((prev) => prev.filter((m) => m !== member));
    setRemovedMembers((prev) =>
      prev.includes(member) ? prev : [...prev, member]
    );
  }, []);

  const allMembersAdded = useMemo(
    () =>
      nextMemberIndex >= ALL_TEAM_MEMBERS.length &&
      removedMembers.length === 0,
    [nextMemberIndex, removedMembers]
  );

  const totalMilestoneAmount = useMemo(
    () =>
      milestones.reduce(
        (total, m) => total + (Number(m?.amount) || 0),
        0
      ),
    [milestones]
  );

  const validateForm = useCallback(() => {
    const title = String(formData.title || "").trim();
    const client = String(formData.client || "").trim();
    const startDate = String(formData.startDate || "").trim();
    const endDate = String(formData.endDate || "").trim();
    const budget = Number(formData.budget);

    if (!title) {
      showErrorToast("Project Name is required");
      return false;
    }
    if (!client) {
      showErrorToast("Client is required");
      return false;
    }
    if (!startDate) {
      showErrorToast("Start date is required");
      return false;
    }
    if (!endDate) {
      showErrorToast("End date is required");
      return false;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      showErrorToast("Please enter valid project dates");
      return false;
    }
    if (end < start) {
      showErrorToast("End date cannot be before start date");
      return false;
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      showErrorToast("Budget must be greater than 0");
      return false;
    }

    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      const mTitle = String(m?.title || "").trim();
      const amount = Number(m?.amount);

      if (!mTitle) {
        showErrorToast(`Milestone ${i + 1} title is required`);
        return false;
      }
      if (!m?.dueDate) {
        showErrorToast(`Milestone ${i + 1} due date is required`);
        return false;
      }

      const dueDate = new Date(`${m.dueDate}T00:00:00`);
      if (Number.isNaN(dueDate.getTime())) {
        showErrorToast(`Milestone ${i + 1} has an invalid due date`);
        return false;
      }
      if (dueDate < start || dueDate > end) {
        showErrorToast(
          `Milestone ${i + 1} due date must be within the project dates`
        );
        return false;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        showErrorToast(
          `Milestone ${i + 1} amount must be greater than 0`
        );
        return false;
      }
    }

    if (milestones.length > 0 && totalMilestoneAmount > budget) {
      showErrorToast(
        "Total milestone amount cannot exceed the project budget"
      );
      return false;
    }

    return true;
  }, [formData, milestones, totalMilestoneAmount]);

  const createProject = useCallback(async () => {
    if (loading) return;
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        title: String(formData.title).trim(),
        client: formData.client,
        clientName: String(formData.clientName || "").trim(),
        projectType: formData.projectType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: String(formData.description || "").trim(),
        budget: Number(formData.budget),
        billingMethod: formData.billingMethod,
        autoInvoice: Boolean(formData.autoInvoice),
        color: formData.color,
        milestones: milestones.map((m) => ({
          title: String(m?.title || "").trim(),
          dueDate: m.dueDate,
          amount: Number(m?.amount || 0),
          status: String(m?.status || "scheduled").toLowerCase(),
        })),
        teamMembers: [...teamMembers],
        members: teamMembers.length,
        billed: 0,
        progress: 0,
        status: "ACTIVE",
        icon: "folder",
        dueDate: formData.endDate,
      };

      const token = getAuthToken();

      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Project creation failed (${response.status})`
        );
      }

      const createdProject = data?.project || data?.data || data;

      showSuccessToast("Project created successfully");
      onProjectCreated?.(createdProject);

      window.dispatchEvent(
        new CustomEvent("project-created", {
          detail: { project: createdProject },
        })
      );

      resetForm();
      onClose?.();
    } catch (error) {
      console.error("Project creation error:", error);
      showErrorToast(error?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    loading,
    milestones,
    onClose,
    onProjectCreated,
    resetForm,
    teamMembers,
    validateForm,
  ]);

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleClose}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        icon="rocket_launch"
        onClick={createProject}
        disabled={loading || clientsLoading}
      >
        {loading ? "Creating..." : "Create Project"}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title="New Project"
      icon="add_business"
      width="max-w-2xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Section 1 — Project Basics */}
        <section>
          <h4 className={sectionLabelClass}>
            <span className={stepBadgeClass}>1</span>
            Project Basics
          </h4>

          <div className="space-y-4">
            <FormInput
              label="Project Name *"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Q1 Marketing Sprint"
              disabled={loading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="project-client"
                  className="block text-[11.5px] font-semibold text-text-secondary mb-1.5"
                >
                  Client *
                </label>
                <select
                  id="project-client"
                  value={formData.client}
                  onChange={handleClientChange}
                  disabled={loading || clientsLoading}
                  className={selectClassName}
                >
                  <option value="">
                    {clientsLoading ? "Loading clients..." : "Select Client"}
                  </option>
                  {clients.map((client) => {
                    const id = getClientId(client);
                    if (!id) return null;
                    return (
                      <option key={id} value={id}>
                        {getClientName(client)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-type"
                  className="block text-[11.5px] font-semibold text-text-secondary mb-1.5"
                >
                  Project Type
                </label>
                <select
                  id="project-type"
                  value={formData.projectType}
                  onChange={(e) =>
                    handleChange("projectType", e.target.value)
                  }
                  disabled={loading}
                  className={selectClassName}
                >
                  <option value="Fixed Fee">Fixed Fee</option>
                  <option value="Time & Materials">Time & Materials</option>
                  <option value="Retainer">Retainer</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                disabled={loading}
              />
              <FormInput
                label="End Date *"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="project-description"
                className="block text-[11.5px] font-semibold text-text-secondary mb-1.5"
              >
                Description
              </label>
              <textarea
                id="project-description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  handleChange("description", e.target.value)
                }
                disabled={loading}
                placeholder="Describe the project..."
                className="
                  w-full px-3.5 py-2.5
                  border border-border rounded-lg text-sm
                  bg-[var(--input-background)] text-text
                  resize-none outline-none
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  disabled:bg-[var(--input-background-disabled)]
                  transition-colors duration-fast
                "
              />
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                Color Tag
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    disabled={loading}
                    aria-label={`Select ${color.replace("bg-", "")} project color`}
                    aria-pressed={formData.color === color}
                    onClick={() => handleChange("color", color)}
                    className={`
                      w-9 h-9 rounded-lg ${color}
                      transition-transform duration-fast
                      hover:scale-105
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        formData.color === color
                          ? "ring-2 ring-offset-2 ring-text scale-110"
                          : ""
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Budget & Billing */}
        <section className="pt-5 border-t border-border-light">
          <h4 className={sectionLabelClass}>
            <span className={stepBadgeClass}>2</span>
            Budget & Billing
          </h4>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="project-budget"
                className="block text-[11.5px] font-semibold text-text-secondary mb-1.5"
              >
                Total Budget ({selectedCurrency?.code || "USD"})
              </label>
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light font-bold"
                >
                  {currencySymbol}
                </span>
                <input
                  id="project-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  disabled={loading}
                  placeholder="0.00"
                  className="
                    w-full pl-8 pr-3.5 py-2.5
                    border border-border rounded-lg text-sm
                    bg-[var(--input-background)] text-text
                    outline-none
                    focus:border-primary focus:ring-2 focus:ring-primary/20
                    disabled:bg-[var(--input-background-disabled)]
                    transition-colors duration-fast
                  "
                />
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-text-secondary mb-2">
                Billing Method
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BILLING_OPTIONS.map((item) => {
                  const isActive = formData.billingMethod === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      disabled={loading}
                      aria-pressed={isActive}
                      onClick={() =>
                        handleChange("billingMethod", item.label)
                      }
                      className={`
                        flex flex-col items-center p-3 rounded-lg border-2
                        transition-colors duration-fast
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          isActive
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border hover:border-primary/40 text-text-secondary"
                        }
                      `}
                    >
                      <span className="material-symbols-outlined mb-1">
                        {item.icon}
                      </span>
                      <span className="text-[11px] font-bold">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-3 bg-surface-secondary rounded-lg">
              <div>
                <div className="text-[13px] font-bold text-text">
                  Auto-generate invoices
                </div>
                <div className="text-[11.5px] text-text-muted">
                  Create and send invoices when milestones complete
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.autoInvoice}
                disabled={loading}
                onClick={() =>
                  handleChange("autoInvoice", !formData.autoInvoice)
                }
                className={`
                  w-11 h-6 rounded-full relative transition-colors duration-fast shrink-0
                  disabled:opacity-50
                  ${formData.autoInvoice ? "bg-primary" : "bg-border-dark"}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 w-5 h-5 bg-surface rounded-full shadow-sm
                    transition-all duration-fast
                    ${formData.autoInvoice ? "right-0.5" : "left-0.5"}
                  `}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3 — Milestones */}
        <section className="pt-5 border-t border-border-light">
          <div className="flex items-center justify-between mb-3">
            <h4 className={`${sectionLabelClass} mb-0`}>
              <span className={stepBadgeClass}>3</span>
              Milestones
            </h4>
            <span className="text-[11px] font-bold text-primary">
              {format(totalMilestoneAmount)}
            </span>
          </div>

          <div className="space-y-2">
            {milestones.map((item, index) => (
              <div
                key={`milestone-${index}`}
                className="
                  grid grid-cols-12 gap-2 items-start
                  p-3 bg-surface-secondary rounded-lg
                  border border-border-light
                "
              >
                <div className="col-span-12 sm:col-span-6">
                  <label className="text-[9px] uppercase text-text-light font-bold">
                    Milestone
                  </label>
                  <input
                    type="text"
                    value={item?.title || ""}
                    onChange={(e) =>
                      updateMilestone(index, "title", e.target.value)
                    }
                    disabled={loading}
                    placeholder="Milestone name"
                    className="
                      w-full bg-transparent border-0 p-0
                      text-[13px] font-medium text-text
                      outline-none focus:ring-0
                      disabled:opacity-60
                    "
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label
                    htmlFor={`milestone-due-${index}`}
                    className="block text-[9px] uppercase text-text-light font-bold mb-1"
                  >
                    Due
                  </label>
                  <input
                    id={`milestone-due-${index}`}
                    type="date"
                    value={item?.dueDate ?? ""}
                    onChange={(e) =>
                      updateMilestone(index, "dueDate", e.target.value)
                    }
                    onClick={(e) => {
                      if (
                        !loading &&
                        typeof e.currentTarget.showPicker === "function"
                      ) {
                        e.currentTarget.showPicker();
                      }
                    }}
                    disabled={loading}
                    className="
                      w-full min-w-0 bg-transparent border-0 p-0
                      text-[12px] text-text-secondary
                      outline-none focus:ring-0 cursor-pointer
                      disabled:opacity-60 disabled:cursor-not-allowed
                    "
                  />
                </div>

                <div className="col-span-5 sm:col-span-2">
                  <label className="text-[9px] uppercase text-text-light font-bold">
                    Amount ({selectedCurrency?.code || "USD"})
                  </label>
                  <div className="relative">
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-text-light text-xs"
                    >
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item?.amount ?? ""}
                      onChange={(e) =>
                        updateMilestone(index, "amount", e.target.value)
                      }
                      disabled={loading}
                      className="
                        w-full pl-4 bg-transparent border-0 p-0
                        text-[13px] font-medium text-text
                        outline-none disabled:opacity-60
                      "
                    />
                  </div>
                </div>

                <div className="col-span-1 flex justify-center pt-5">
                  <button
                    type="button"
                    disabled={loading}
                    aria-label={`Delete milestone ${index + 1}`}
                    onClick={() => deleteMilestone(index)}
                    className="
                      text-danger hover:text-danger-hover
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-colors duration-fast
                    "
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              disabled={loading}
              onClick={addMilestone}
              className="
                w-full py-2.5
                border-2 border-dashed border-border
                hover:border-primary/40
                rounded-lg text-xs font-semibold text-primary
                flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-fast
              "
            >
              <span className="material-symbols-outlined">add</span>
              Add Milestone
            </button>

            {Number(formData.budget) > 0 &&
              totalMilestoneAmount > Number(formData.budget) && (
                <p className="text-[11px] text-danger font-medium">
                  Milestone total exceeds project budget.
                </p>
              )}
          </div>
        </section>

        {/* Section 4 — Team */}
        <section className="pt-5 border-t border-border-light">
          <h4 className={sectionLabelClass}>
            <span className={stepBadgeClass}>4</span>
            Team & Access
          </h4>

          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <span
                key={member}
                className="
                  inline-flex items-center gap-2
                  px-3 py-1.5
                  bg-primary-soft border border-primary/20
                  rounded-full text-[12px] font-semibold text-primary-dark
                "
              >
                <span
                  aria-hidden
                  className="
                    w-5 h-5 bg-primary text-text-inverse
                    rounded-full grid place-items-center
                    text-[10px] font-black
                  "
                >
                  {member.charAt(0)}
                </span>
                {member}
                <button
                  type="button"
                  disabled={loading}
                  aria-label={`Remove ${member}`}
                  onClick={() => removeMember(member)}
                  className="
                    hover:text-danger
                    disabled:opacity-40
                    transition-colors duration-fast
                  "
                >
                  <span className="material-symbols-outlined text-[13px] mt-1">
                    close
                  </span>
                </button>
              </span>
            ))}

            {!allMembersAdded && (
              <button
                type="button"
                disabled={loading}
                onClick={addMember}
                className="
                  inline-flex items-center gap-1
                  px-3 py-1.5
                  border-2 border-dashed border-border
                  hover:border-primary/40
                  rounded-full text-[12px] font-semibold
                  text-text-muted hover:text-primary
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-fast
                "
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Member
              </button>
            )}
          </div>
        </section>
      </div>
    </RightDrawer>
  );
}