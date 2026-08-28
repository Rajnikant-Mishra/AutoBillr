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
  color: "bg-cyan-500",
};

const INITIAL_TEAM_MEMBERS = [
  "Alex Sterling",
  "Marcus Chen",
];

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
  {
    label: "Milestone",
    icon: "flag",
  },
  {
    label: "Hourly",
    icon: "schedule",
  },
  {
    label: "Retainer",
    icon: "sync",
  },
  {
    label: "Fixed Fee",
    icon: "request_quote",
  },
];

const PROJECT_COLORS = [
  "bg-teal-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
];
const token = getAuthToken();
const createEmptyMilestone = () => ({
  title: "",
  dueDate: "",
  amount: 0,
  status: "scheduled",
});

const normalizeArray = (value) => {
  return Array.isArray(value) ? value : [];
};
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

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status})`
    );
  }
};

export default function ProjectDrawer({
  isOpen,
  onClose,
  onProjectCreated,
}) {
  const {
    format,
    selectedCurrency,
    currencySymbol,
  } = useCurrency();

  const [formData, setFormData] = useState(
    INITIAL_FORM_DATA
  );

  const [clients, setClients] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [teamMembers, setTeamMembers] = useState(
    INITIAL_TEAM_MEMBERS
  );
  const [removedMembers, setRemovedMembers] = useState([]);

  const [nextMemberIndex, setNextMemberIndex] =
    useState(INITIAL_TEAM_MEMBERS.length);

  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] =
    useState(false);

  /**
   * ---------------------------------------------------------
   * RESET
   * ---------------------------------------------------------
   */

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setMilestones([]);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setRemovedMembers([]);
    setNextMemberIndex(INITIAL_TEAM_MEMBERS.length);
  }, []);

  /**
   * ---------------------------------------------------------
   * CLOSE
   * ---------------------------------------------------------
   */

  const handleClose = useCallback(() => {
    if (loading) return;

    resetForm();
    onClose?.();
  }, [loading, onClose, resetForm]);

  /**
   * ---------------------------------------------------------
   * FORM CHANGE
   * ---------------------------------------------------------
   */

  const handleChange = useCallback((field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }, []);

  /**
   * ---------------------------------------------------------
   * FETCH CLIENTS
   * ---------------------------------------------------------
   */

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
    console.log("CLIENT API RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data?.message || `Failed to load clients (${response.status})`
      );
    }

    const clientList =
      Array.isArray(data) ? data :
      Array.isArray(data?.clients) ? data.clients :
      Array.isArray(data?.data) ? data.data :
      Array.isArray(data?.data?.clients) ? data.data.clients :
      Array.isArray(data?.result) ? data.result :
      [];

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
    if (!signal?.aborted) {
      setClientsLoading(false);
    }
  }
}, []);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();

    fetchClients(controller.signal);

    return () => {
      controller.abort();
    };
  }, [isOpen, fetchClients]);

  /**
   * ---------------------------------------------------------
   * CLIENT SELECTION
   * ---------------------------------------------------------
   */

  const handleClientChange = useCallback(
  (event) => {
    const clientId = event.target.value;

    const selectedClient = clients.find(
      (client) => String(getClientId(client)) === String(clientId)
    );

    setFormData((previous) => ({
      ...previous,
      client: getClientId(selectedClient) || "",
      clientName: getClientName(selectedClient),
    }));
  },
  [clients]
);

  /**
   * ---------------------------------------------------------
   * MILESTONES
   * ---------------------------------------------------------
   */

  const addMilestone = useCallback(() => {
    setMilestones((previous) => [
      ...previous,
      createEmptyMilestone(),
    ]);
  }, []);

  const deleteMilestone = useCallback((index) => {
    setMilestones((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }, []);

  const updateMilestone = useCallback(
    (index, field, value) => {
      setMilestones((previous) =>
        previous.map((milestone, itemIndex) => {
          if (itemIndex !== index) {
            return milestone;
          }

          return {
            ...milestone,
            [field]:
              field === "amount"
                ? value === ""
                  ? ""
                  : Number(value)
                : value,
          };
        })
      );
    },
    []
  );

  /**
   * ---------------------------------------------------------
   * TEAM MEMBERS
   * ---------------------------------------------------------
   */

  const addMember = useCallback(() => {
    // Add members from the original queue first.
    if (
      nextMemberIndex < ALL_TEAM_MEMBERS.length
    ) {
      const nextMember =
        ALL_TEAM_MEMBERS[nextMemberIndex];

      setTeamMembers((previous) => {
        if (previous.includes(nextMember)) {
          return previous;
        }

        return [...previous, nextMember];
      });

      setNextMemberIndex(
        (previous) => previous + 1
      );

      return;
    }

    // Restore a removed member.
    if (removedMembers.length > 0) {
      const memberToRestore = removedMembers[0];

      setTeamMembers((previous) => {
        if (previous.includes(memberToRestore)) {
          return previous;
        }

        return [...previous, memberToRestore];
      });

      setRemovedMembers((previous) =>
        previous.slice(1)
      );
    }
  }, [nextMemberIndex, removedMembers]);

  const removeMember = useCallback((member) => {
    setTeamMembers((previous) =>
      previous.filter(
        (existingMember) => existingMember !== member
      )
    );

    setRemovedMembers((previous) => {
      if (previous.includes(member)) {
        return previous;
      }

      return [...previous, member];
    });
  }, []);

  const allMembersAdded = useMemo(() => {
    return (
      nextMemberIndex >= ALL_TEAM_MEMBERS.length &&
      removedMembers.length === 0
    );
  }, [nextMemberIndex, removedMembers]);

  /**
   * ---------------------------------------------------------
   * MILESTONE TOTAL
   * ---------------------------------------------------------
   */

  const totalMilestoneAmount = useMemo(() => {
    return milestones.reduce(
      (total, milestone) =>
        total + (Number(milestone?.amount) || 0),
      0
    );
  }, [milestones]);

  /**
   * ---------------------------------------------------------
   * VALIDATION
   * ---------------------------------------------------------
   */

  const validateForm = useCallback(() => {
    const title = String(
      formData.title || ""
    ).trim();

    const client = String(
      formData.client || ""
    ).trim();

    const startDate = String(
      formData.startDate || ""
    ).trim();

    const endDate = String(
      formData.endDate || ""
    ).trim();

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

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      showErrorToast("Please enter valid project dates");
      return false;
    }

    if (end < start) {
      showErrorToast(
        "End date cannot be before start date"
      );
      return false;
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      showErrorToast(
        "Budget must be greater than 0"
      );
      return false;
    }

    /**
     * Validate milestones.
     */
    for (let index = 0; index < milestones.length; index++) {
      const milestone = milestones[index];

      const title = String(
        milestone?.title || ""
      ).trim();

      const amount = Number(
        milestone?.amount
      );

      if (!title) {
        showErrorToast(
          `Milestone ${index + 1} title is required`
        );
        return false;
      }

      if (!milestone?.dueDate) {
        showErrorToast(
          `Milestone ${index + 1} due date is required`
        );
        return false;
      }

      const dueDate = new Date(
        `${milestone.dueDate}T00:00:00`
      );

      if (Number.isNaN(dueDate.getTime())) {
        showErrorToast(
          `Milestone ${index + 1} has an invalid due date`
        );
        return false;
      }

      if (dueDate < start || dueDate > end) {
        showErrorToast(
          `Milestone ${
            index + 1
          } due date must be within the project dates`
        );
        return false;
      }

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        showErrorToast(
          `Milestone ${
            index + 1
          } amount must be greater than 0`
        );
        return false;
      }
    }

    /**
     * Prevent milestone total from exceeding budget.
     */
    if (
      milestones.length > 0 &&
      totalMilestoneAmount > budget
    ) {
      showErrorToast(
        "Total milestone amount cannot exceed the project budget"
      );
      return false;
    }

    return true;
  }, [formData, milestones, totalMilestoneAmount]);

  /**
   * ---------------------------------------------------------
   * CREATE PROJECT
   * ---------------------------------------------------------
   */

  const createProject = useCallback(async () => {
    if (loading) return;

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: String(formData.title).trim(),

        client: formData.client,

        clientName:
          String(formData.clientName || "").trim(),

        projectType: formData.projectType,

        startDate: formData.startDate,

        endDate: formData.endDate,

        description:
          String(formData.description || "").trim(),

        budget: Number(formData.budget),

        billingMethod: formData.billingMethod,

        autoInvoice: Boolean(formData.autoInvoice),

        color: formData.color,

        milestones: milestones.map((milestone) => ({
          title: String(
            milestone?.title || ""
          ).trim(),

          dueDate: milestone.dueDate,

          amount: Number(
            milestone?.amount || 0
          ),

          status:
            String(
              milestone?.status || "scheduled"
            ).toLowerCase(),
        })),

        teamMembers: [...teamMembers],

        members: teamMembers.length,

        billed: 0,

        progress: 0,

        status: "ACTIVE",

        icon: "folder",

        dueDate: formData.endDate,
      };

      console.log("Creating project:", payload);

      const token = getAuthToken();

const response = await fetch(
  `${API_URL}/projects`,
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },

    body: JSON.stringify(payload),
  }
);

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Project creation failed (${response.status})`
        );
      }

      const createdProject =
        data?.project || data?.data || data;

      showSuccessToast(
        "Project created successfully"
      );

      /**
       * Notify parent immediately if callback exists.
       */
      onProjectCreated?.(createdProject);

      /**
       * Backward-compatible custom event.
       */
      window.dispatchEvent(
        new CustomEvent("project-created", {
          detail: {
            project: createdProject,
          },
        })
      );

      resetForm();
      onClose?.();
    } catch (error) {
      console.error(
        "Project creation error:",
        error
      );

      showErrorToast(
        error?.message ||
          "Failed to create project"
      );
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

  /**
   * ---------------------------------------------------------
   * FOOTER
   * ---------------------------------------------------------
   */

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
        {loading
          ? "Creating..."
          : "Create Project"}
      </Button>
    </div>
  );

  /**
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

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
        {/* =====================================================
            SECTION 1 — PROJECT BASICS
        ====================================================== */}

        <section>
          <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 grid place-items-center text-[10px] font-black">
              1
            </span>

            Project Basics
          </h4>

          <div className="space-y-4">
            {/* Project name */}

            <FormInput
              label="Project Name *"
              value={formData.title}
              onChange={(event) =>
                handleChange(
                  "title",
                  event.target.value
                )
              }
              placeholder="Q1 Marketing Sprint"
              disabled={loading}
            />

            {/* Client + project type */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="project-client"
                  className="block text-[11.5px] font-semibold text-slate-600 mb-1.5"
                >
                  Client *
                </label>

                <select
                  id="project-client"
                  value={formData.client}
                  onChange={handleClientChange}
                  disabled={
                    loading || clientsLoading
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {clientsLoading
                      ? "Loading clients..."
                      : "Select Client"}
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
                  className="block text-[11.5px] font-semibold text-slate-600 mb-1.5"
                >
                  Project Type
                </label>

                <select
                  id="project-type"
                  value={formData.projectType}
                  onChange={(event) =>
                    handleChange(
                      "projectType",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white disabled:bg-slate-100"
                >
                  <option value="Fixed Fee">
                    Fixed Fee
                  </option>

                  <option value="Time & Materials">
                    Time & Materials
                  </option>

                  <option value="Retainer">
                    Retainer
                  </option>

                  <option value="Internal">
                    Internal
                  </option>
                </select>
              </div>
            </div>

            {/* Dates */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(event) =>
                  handleChange(
                    "startDate",
                    event.target.value
                  )
                }
                disabled={loading}
              />

              <FormInput
                label="End Date *"
                type="date"
                value={formData.endDate}
                onChange={(event) =>
                  handleChange(
                    "endDate",
                    event.target.value
                  )
                }
                disabled={loading}
              />
            </div>

            {/* Description */}

            <div>
              <label
                htmlFor="project-description"
                className="block text-[11.5px] font-semibold text-slate-600 mb-1.5"
              >
                Description
              </label>

              <textarea
                id="project-description"
                rows={3}
                value={formData.description}
                onChange={(event) =>
                  handleChange(
                    "description",
                    event.target.value
                  )
                }
                disabled={loading}
                placeholder="Describe the project..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm resize-none outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
              />
            </div>

            {/* Color */}

            <div>
              <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">
                Color Tag
              </label>

              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    disabled={loading}
                    aria-label={`Select ${color.replace(
                      "bg-",
                      ""
                    )} project color`}
                    aria-pressed={
                      formData.color === color
                    }
                    onClick={() =>
                      handleChange(
                        "color",
                        color
                      )
                    }
                    className={`
                      w-9 h-9 rounded-lg
                      ${color}
                      transition
                      hover:scale-105
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      ${
                        formData.color === color
                          ? "ring-2 ring-offset-2 ring-slate-900 scale-110"
                          : ""
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SECTION 2 — BUDGET & BILLING
        ====================================================== */}

        <section className="pt-5 border-t border-slate-100">
          <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 grid place-items-center text-[10px] font-black">
              2
            </span>

            Budget & Billing
          </h4>

          <div className="space-y-4">
            {/* Budget */}

            <div>
              <label
                htmlFor="project-budget"
                className="block text-[11.5px] font-semibold text-slate-600 mb-1.5"
              >
                Total Budget (
                {selectedCurrency?.code || "USD"})
              </label>

              <div className="relative">
                <span
                  aria-hidden="true"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold"
                >
                  {currencySymbol}
                </span>

                <input
                  id="project-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(event) =>
                    handleChange(
                      "budget",
                      event.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Billing method */}

            <div>
              <label className="block text-[11.5px] font-semibold text-slate-600 mb-2">
                Billing Method
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BILLING_OPTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={loading}
                    aria-pressed={
                      formData.billingMethod ===
                      item.label
                    }
                    onClick={() =>
                      handleChange(
                        "billingMethod",
                        item.label
                      )
                    }
                    className={`
                      flex flex-col items-center
                      p-3 rounded-lg border-2
                      transition
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                      ${
                        formData.billingMethod ===
                        item.label
                          ? "border-teal-500 bg-teal-50"
                          : "border-slate-200 hover:border-teal-300"
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
                ))}
              </div>
            </div>

            {/* Auto invoice */}

            <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="text-[13px] font-bold text-slate-900">
                  Auto-generate invoices
                </div>

                <div className="text-[11.5px] text-slate-500">
                  Create and send invoices when
                  milestones complete
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={
                  formData.autoInvoice
                }
                disabled={loading}
                onClick={() =>
                  handleChange(
                    "autoInvoice",
                    !formData.autoInvoice
                  )
                }
                className={`
                  w-11 h-6 rounded-full
                  relative transition
                  shrink-0
                  disabled:opacity-50
                  ${
                    formData.autoInvoice
                      ? "bg-teal-600"
                      : "bg-slate-300"
                  }
                `}
              >
                <span
                  className={`
                    absolute top-0.5
                    w-5 h-5 bg-white
                    rounded-full shadow
                    transition
                    ${
                      formData.autoInvoice
                        ? "right-0.5"
                        : "left-0.5"
                    }
                  `}
                />
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            SECTION 3 — MILESTONES
        ====================================================== */}

        <section className="pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 grid place-items-center text-[10px] font-black">
                3
              </span>

              Milestones
            </h4>

            <span className="text-[11px] font-bold text-teal-600">
              {format(totalMilestoneAmount)}
            </span>
          </div>

          <div className="space-y-2">
            {milestones.map(
              (item, index) => (
                <div
                  key={`milestone-${index}`}
                  className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  {/* Title */}

                  <div className="col-span-12 sm:col-span-6">
                    <label className="text-[9px] uppercase text-slate-400 font-bold">
                      Milestone
                    </label>

                    <input
                      type="text"
                      value={item?.title || ""}
                      onChange={(event) =>
                        updateMilestone(
                          index,
                          "title",
                          event.target.value
                        )
                      }
                      disabled={loading}
                      placeholder="Milestone name"
                      className="w-full bg-transparent border-0 p-0 text-[13px] font-medium outline-none focus:ring-0 disabled:opacity-60"
                    />
                  </div>

                  {/* Due date */}

                 <div className="col-span-6 sm:col-span-3">
  <label
    htmlFor={`milestone-due-${index}`}
    className="block text-[9px] uppercase text-slate-400 font-bold mb-1"
  >
    Due
  </label>

  <input
    id={`milestone-due-${index}`}
    type="date"
    value={item?.dueDate ?? ""}
    onChange={(event) => {
      updateMilestone(
        index,
        "dueDate",
        event.target.value
      );
    }}
    onClick={(event) => {
      if (!loading && typeof event.currentTarget.showPicker === "function") {
        event.currentTarget.showPicker();
      }
    }}
    disabled={loading}
    className="
      w-full
      min-w-0
      bg-transparent
      border-0
      p-0
      text-[12px]
      text-slate-700
      outline-none
      focus:ring-0
      cursor-pointer
      disabled:opacity-60
      disabled:cursor-not-allowed
    "
  />
</div>
                  {/* Amount */}

                  <div className="col-span-5 sm:col-span-2">
                    <label className="text-[9px] uppercase text-slate-400 font-bold">
                      Amount (
                      {selectedCurrency?.code ||
                        "USD"}
                      )
                    </label>

                    <div className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                      >
                        {currencySymbol}
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          item?.amount ?? ""
                        }
                        onChange={(event) =>
                          updateMilestone(
                            index,
                            "amount",
                            event.target.value
                          )
                        }
                        disabled={loading}
                        className="w-full pl-4 bg-transparent border-0 p-0 text-[13px] font-medium outline-none disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Delete */}

                  <div className="col-span-1 flex justify-center pt-5">
                    <button
                      type="button"
                      disabled={loading}
                      aria-label={`Delete milestone ${
                        index + 1
                      }`}
                      onClick={() =>
                        deleteMilestone(index)
                      }
                      className="text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              )
            )}

            <button
              type="button"
              disabled={loading}
              onClick={addMilestone}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-teal-300 rounded-lg text-xs font-semibold text-teal-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">
                add
              </span>

              Add Milestone
            </button>

            {/* Budget warning */}

            {Number(formData.budget) > 0 &&
              totalMilestoneAmount >
                Number(formData.budget) && (
                <p className="text-[11px] text-red-500 font-medium">
                  Milestone total exceeds
                  project budget.
                </p>
              )}
          </div>
        </section>

        {/* =====================================================
            SECTION 4 — TEAM
        ====================================================== */}

        <section className="pt-5 border-t border-slate-100">
          <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-700 grid place-items-center text-[10px] font-black">
              4
            </span>

            Team & Access
          </h4>

          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <span
                key={member}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-[12px] font-semibold text-teal-700"
              >
                <span
                  aria-hidden="true"
                  className="w-5 h-5 bg-teal-600 text-white rounded-full grid place-items-center text-[10px] font-black"
                >
                  {member.charAt(0)}
                </span>

                {member}

                <button
                  type="button"
                  disabled={loading}
                  aria-label={`Remove ${member}`}
                  onClick={() =>
                    removeMember(member)
                  }
                  className="hover:text-red-600 disabled:opacity-40"
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
                className="inline-flex items-center gap-1 px-3 py-1.5 border-2 border-dashed border-slate-200 hover:border-teal-300 rounded-full text-[12px] font-semibold text-slate-500 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">
                  add
                </span>

                Add Member
              </button>
            )}
          </div>
        </section>
      </div>
    </RightDrawer>
  );
} 