import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import RightDrawer from "../layout/RightDrawer";
import {
  showErrorToast,
  showSuccessToast,
} from "../ui/CustomToast";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import useCurrency from "../../hooks/useCurrency";
import { getAuthToken } from "../../utils/auth";

/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const TEAM_API = `${String(API_URL).replace(/\/$/, "")}/team`;

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM_DATA = {
  title: "",
  client: "",
  clientName: "",

  projectType: "Fixed Fee",

  startDate: "",
  endDate: "",

  description: "",

  /* Money – budget used for Fixed Fee / Milestone / Hourly.
     Retainer uses recurringAmount. */
  budget: "",

  billingMethod: "Fixed Fee",
  billingRateType: "FIXED",
  billingRate: "",
  billingCycle: "MONTHLY",
  paymentMethod: "WIRE",
  paymentTerms: "NET_30",

  recurringAmount: "",
  recurringStartDate: "",
  recurringEndDate: "",
  nextBillingDate: "",
  recurringStatus: "ACTIVE",

  autoInvoice: true,
  autoCharge: false,

  color: "bg-primary",
  icon: "folder",

  milestones: [],
  teamMembers: [],
};

/* =========================================================
   BILLING OPTIONS
========================================================= */

const BILLING_OPTIONS = [
  {
    label: "Fixed Fee",
    icon: "request_quote",
    description: "One agreed project price",
  },
  {
    label: "Milestone",
    icon: "flag",
    description: "Bill based on milestones",
  },
  {
    label: "Hourly",
    icon: "schedule",
    description: "Bill based on tracked hours",
  },
  {
    label: "Retainer",
    icon: "sync",
    description: "Recurring retainer billing",
  },
];

const BILLING_CYCLE_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "FORTNIGHTLY", label: "Fortnightly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "WIRE", label: "Bank Transfer / Wire" },
  { value: "ACH", label: "ACH" },
  { value: "CARD", label: "Card" },
  { value: "CHECK", label: "Check" },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: "DUE_ON_RECEIPT", label: "Due on Receipt" },
  { value: "NET_15", label: "Net 15" },
  { value: "NET_30", label: "Net 30" },
  { value: "NET_60", label: "Net 60" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "Fixed Fee", label: "Fixed Fee" },
  { value: "Time & Materials", label: "Time & Materials" },
  { value: "Retainer", label: "Retainer" },
  { value: "Internal", label: "Internal" },
];

const PROJECT_COLORS = [
  "bg-primary",
  "bg-info",
  "bg-warning",
  "bg-danger",
  "bg-secondary",
  "bg-success",
];

/* =========================================================
   HELPERS
========================================================= */

const createEmptyMilestone = () => ({
  title: "",
  dueDate: "",
  amount: "",
  status: "scheduled",
});

const getClientId = (client) =>
  client?.id ?? client?._id ?? client?.clientId ?? null;

const getClientName = (client) =>
  client?.name ??
  client?.clientName ??
  client?.companyName ??
  "Unnamed Client";

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

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

/* =========================================================
   DATE HELPERS
========================================================= */

const formatDateOnly = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (dateString) => {
  if (!dateString) return null;

  const parts = String(dateString).split("-").map(Number);
  if (parts.length !== 3) return null;

  const [year, month, day] = parts;
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const addBillingCycle = (dateString, cycle) => {
  const date = parseDateOnly(dateString);
  if (!date || !cycle) return "";

  const originalDay = date.getDate();

  if (cycle === "FORTNIGHTLY") {
    date.setDate(date.getDate() + 14);
    return formatDateOnly(date);
  }

  if (cycle === "MONTHLY" || cycle === "QUARTERLY") {
    const monthsToAdd = cycle === "MONTHLY" ? 1 : 3;
    const targetDate = new Date(
      date.getFullYear(),
      date.getMonth() + monthsToAdd,
      1
    );
    const lastDayOfTargetMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0
    ).getDate();
    targetDate.setDate(Math.min(originalDay, lastDayOfTargetMonth));
    return formatDateOnly(targetDate);
  }

  if (cycle === "ANNUAL") {
    const targetDate = new Date(
      date.getFullYear() + 1,
      date.getMonth(),
      1
    );
    const lastDayOfTargetMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0
    ).getDate();
    targetDate.setDate(Math.min(originalDay, lastDayOfTargetMonth));
    return formatDateOnly(targetDate);
  }

  return "";
};

const calculateInitialNextBillingDate = (
  recurringStartDate,
  billingCycle
) => {
  if (!recurringStartDate || !billingCycle) return "";
  return addBillingCycle(recurringStartDate, billingCycle);
};

const formatDisplayDate = (dateString) => {
  const date = parseDateOnly(dateString);
  if (!date) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   COMMON CLASSES
========================================================= */

const selectClassName = `
  w-full
  px-3.5
  py-2.5
  border
  border-border
  rounded-lg
  text-sm
  bg-[var(--input-background)]
  text-text
  focus:outline-none
  focus:border-primary
  focus:ring-2
  focus:ring-primary/20
  disabled:bg-[var(--input-background-disabled)]
  disabled:cursor-not-allowed
  transition-colors
  duration-fast
`;

const numberInputClass = `
  w-full
  pl-8
  pr-3.5
  py-2.5
  border
  border-border
  rounded-lg
  text-sm
  bg-[var(--input-background)]
  text-text
  outline-none
  focus:border-primary
  focus:ring-2
  focus:ring-primary/20
  disabled:bg-[var(--input-background-disabled)]
`;

const sectionLabelClass =
  "text-[11.5px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2";

const stepBadgeClass =
  "w-5 h-5 rounded-md bg-primary-soft text-primary grid place-items-center text-[10px] font-black";

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={selectClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative w-11 h-6 rounded-full shrink-0
        transition-colors duration-fast disabled:opacity-50
        ${checked ? "bg-primary" : "bg-border-dark"}
      `}
    >
      <span
        className={`
          absolute top-0.5 w-5 h-5 rounded-full bg-surface shadow-sm
          transition-all duration-fast
          ${checked ? "right-0.5" : "left-0.5"}
        `}
      />
    </button>
  );
}

/* =========================================================
   MONEY INPUT
========================================================= */

function MoneyInput({
  id,
  label,
  value,
  onChange,
  currencySymbol,
  placeholder = "0.00",
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11.5px] font-semibold text-text-secondary mb-1.5"
      >
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <div className="relative">
        <span
          aria-hidden
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light font-bold"
        >
          {currencySymbol || "₹"}
        </span>
        <input
          id={id}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={numberInputClass}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ADD MEMBER DROPDOWN (project color on hover – no blue)
========================================================= */

function AddMemberDropdown({
  members,
  onSelect,
  disabled = false,
  projectColor = "bg-primary",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const hoverMap = {
    "bg-primary": "hover:bg-primary-soft hover:text-primary",
    "bg-info": "hover:bg-info/15 hover:text-info",
    "bg-warning": "hover:bg-warning/15 hover:text-warning",
    "bg-danger": "hover:bg-danger/15 hover:text-danger",
    "bg-secondary": "hover:bg-secondary/15 hover:text-secondary",
    "bg-success": "hover:bg-success/15 hover:text-success",
  };

  const itemHoverClass =
    hoverMap[projectColor] || "hover:bg-primary-soft hover:text-primary";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="
          inline-flex items-center gap-1
          h-7 pl-2.5 pr-2
          border border-dashed border-border
          hover:border-primary/50 hover:bg-primary-soft/30
          rounded-full
          text-[11px] font-semibold
          text-text-muted hover:text-primary
          bg-surface
          cursor-pointer
          outline-none
          focus:border-primary focus:ring-1 focus:ring-primary/20
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          add
        </span>
        Add Member
        <span
          className="material-symbols-outlined text-text-light"
          style={{ fontSize: 14 }}
        >
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div
          className="
            absolute left-0 top-full mt-1.5 z-50
            min-w-[220px] max-w-[280px]
            max-h-[220px] overflow-y-auto
            rounded-lg border border-border
            bg-surface shadow-lg
            py-1
          "
        >
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelect(m);
                setOpen(false);
              }}
              className={`
                w-full flex items-center gap-2.5
                px-3 py-2
                text-left text-[12px] font-medium text-text
                transition-colors
                ${itemHoverClass}
              `}
            >
              <span
                className={`
                  w-6 h-6 rounded-full shrink-0
                  grid place-items-center
                  text-[10px] font-black text-text-inverse
                  ${projectColor}
                `}
              >
                {m.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{m.name}</span>
                {m.email && (
                  <span className="block text-[10px] text-text-light truncate">
                    {m.email}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ProjectDrawer({
  isOpen,
  onClose,
  onProjectCreated,
}) {
  const { format, selectedCurrency, currencySymbol } = useCurrency();

  /* =======================================================
     STATE
  ======================================================= */

  const [formData, setFormData] = useState({
    ...INITIAL_FORM_DATA,
    milestones: [],
    teamMembers: [],
  });

  const [clients, setClients] = useState([]);
  const [milestones, setMilestones] = useState([]);

  // Selected members for this project: [{ id, name, email, ... }]
  const [teamMembers, setTeamMembers] = useState([]);

  // All available company team members from API
  const [availableMembers, setAvailableMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);

  /* =======================================================
     RESET
  ======================================================= */

  const resetForm = useCallback(() => {
    setFormData({
      ...INITIAL_FORM_DATA,
      milestones: [],
      teamMembers: [],
    });
    setMilestones([]);
    setTeamMembers([]);
  }, []);

  /* =======================================================
     CLOSE
  ======================================================= */

  const handleClose = useCallback(() => {
    if (loading) return;
    resetForm();
    onClose?.();
  }, [loading, resetForm, onClose]);

  /* =======================================================
     FIELD CHANGE
  ======================================================= */

  const handleChange = useCallback((field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }, []);

  /* =======================================================
     FETCH CLIENTS
  ======================================================= */

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

      const clientList = Array.isArray(data)
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

      const normalized = clientList
        .map((client) => ({
          ...client,
          id: getClientId(client),
          name: getClientName(client),
        }))
        .filter((client) => client.id);

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

  /* =======================================================
     FETCH TEAM MEMBERS
  ======================================================= */

  const fetchTeamMembers = useCallback(async (signal) => {
    try {
      setTeamLoading(true);
      const token = getAuthToken();

      const response = await fetch(TEAM_API, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            `Failed to load team members (${response.status})`
        );
      }

      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : Array.isArray(data?.members)
            ? data.members
            : [];

      const normalized = list
        .map((m) => ({
          id: m.id ?? m._id ?? null,
          name:
            m.name ||
            [m.firstName, m.lastName].filter(Boolean).join(" ") ||
            m.email ||
            "Unnamed",
          email: m.email || "",
          status: m.status || "ACTIVE",
          role: m.role || "",
          avatar: m.avatar || null,
        }))
        .filter((m) => m.id);

      setAvailableMembers(normalized);
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Failed to fetch team members:", error);
      setAvailableMembers([]);
    } finally {
      if (!signal?.aborted) setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    fetchClients(controller.signal);
    fetchTeamMembers(controller.signal);

    return () => controller.abort();
  }, [isOpen, fetchClients, fetchTeamMembers]);

  /* =======================================================
     CLIENT CHANGE
  ======================================================= */

  const handleClientChange = useCallback(
    (event) => {
      const clientId = event.target.value;
      const selectedClient = clients.find(
        (client) => String(getClientId(client)) === String(clientId)
      );

      setFormData((previous) => ({
        ...previous,
        client: getClientId(selectedClient) || "",
        clientName: selectedClient
          ? getClientName(selectedClient)
          : "",
      }));
    },
    [clients]
  );

  /* =======================================================
     BILLING METHOD
  ======================================================= */

  const handleBillingMethod = useCallback((method) => {
    setFormData((previous) => {
      if (method === "Fixed Fee") {
        return {
          ...previous,
          billingMethod: "Fixed Fee",
          billingRateType: "FIXED",
          billingRate: "",
          billingCycle: "MONTHLY",
          recurringAmount: "",
          recurringStartDate: "",
          recurringEndDate: "",
          nextBillingDate: "",
          recurringStatus: "ACTIVE",
          autoCharge: false,
        };
      }

      if (method === "Milestone") {
        return {
          ...previous,
          billingMethod: "Milestone",
          billingRateType: "FIXED",
          billingRate: "",
          billingCycle: "MONTHLY",
          recurringAmount: "",
          recurringStartDate: "",
          recurringEndDate: "",
          nextBillingDate: "",
          recurringStatus: "ACTIVE",
          autoCharge: false,
        };
      }

      if (method === "Hourly") {
        return {
          ...previous,
          billingMethod: "Hourly",
          billingRateType: "FIXED",
          billingRate: previous.billingRate || "",
          billingCycle: previous.billingCycle || "MONTHLY",
          recurringAmount: "",
          recurringStartDate: "",
          recurringEndDate: "",
          nextBillingDate: "",
          recurringStatus: "ACTIVE",
          autoCharge: false,
        };
      }

      if (method === "Retainer") {
        return {
          ...previous,
          billingMethod: "Retainer",
          billingRateType: "RECURRING",
          billingRate: "",
          billingCycle: previous.billingCycle || "MONTHLY",
          recurringAmount: previous.recurringAmount || "",
          recurringStartDate: previous.recurringStartDate || "",
          recurringEndDate: previous.recurringEndDate || "",
          nextBillingDate: "",
          recurringStatus: previous.recurringStatus || "ACTIVE",
        };
      }

      return previous;
    });

    if (method !== "Milestone") {
      setMilestones([]);
    }
  }, []);

  /* =======================================================
     MILESTONES
  ======================================================= */

  const addMilestone = useCallback(() => {
    setMilestones((previous) => [...previous, createEmptyMilestone()]);
  }, []);

  const deleteMilestone = useCallback((index) => {
    setMilestones((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }, []);

  const updateMilestone = useCallback((index, field, value) => {
    setMilestones((previous) =>
      previous.map((milestone, itemIndex) => {
        if (itemIndex !== index) return milestone;
        return { ...milestone, [field]: value };
      })
    );
  }, []);

  /* =======================================================
     TEAM
  ======================================================= */

  const addMember = useCallback((member) => {
    if (!member?.id) return;
    setTeamMembers((prev) => {
      if (prev.some((m) => m.id === member.id)) return prev;
      return [...prev, member];
    });
  }, []);

  const removeMember = useCallback((memberId) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  const unselectedMembers = useMemo(
    () =>
      availableMembers.filter(
        (m) => !teamMembers.some((s) => s.id === m.id)
      ),
    [availableMembers, teamMembers]
  );

  /* =======================================================
     MILESTONE TOTAL
  ======================================================= */

  const totalMilestoneAmount = useMemo(
    () =>
      milestones.reduce(
        (total, milestone) => total + (Number(milestone?.amount) || 0),
        0
      ),
    [milestones]
  );

  /* =======================================================
     BILLING FLAGS
  ======================================================= */

  const isFixedFee = formData.billingMethod === "Fixed Fee";
  const isMilestone = formData.billingMethod === "Milestone";
  const isHourly = formData.billingMethod === "Hourly";
  const isRetainer = formData.billingMethod === "Retainer";
  const recurringEnabled = isRetainer;

  /* =======================================================
     CALCULATED NEXT BILLING DATE
  ======================================================= */

  const calculatedNextBillingDate = useMemo(() => {
    if (!isRetainer) return "";
    if (!formData.recurringStartDate) return "";
    if (!formData.billingCycle) return "";
    return calculateInitialNextBillingDate(
      formData.recurringStartDate,
      formData.billingCycle
    );
  }, [isRetainer, formData.recurringStartDate, formData.billingCycle]);

  const billingCycleLabel = useMemo(() => {
    return (
      BILLING_CYCLE_OPTIONS.find(
        (item) => item.value === formData.billingCycle
      )?.label || "-"
    );
  }, [formData.billingCycle]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = useCallback(() => {
    const title = String(formData.title || "").trim();
    const client = String(formData.client || "").trim();

    if (!title) {
      showErrorToast("Project Name is required");
      return false;
    }
    if (!client) {
      showErrorToast("Client is required");
      return false;
    }
    if (!formData.startDate) {
      showErrorToast("Start date is required");
      return false;
    }
    if (!formData.endDate) {
      showErrorToast("End date is required");
      return false;
    }
    if (formData.endDate < formData.startDate) {
      showErrorToast("End date cannot be before start date");
      return false;
    }

    if (isFixedFee) {
      const projectAmount = Number(formData.budget);
      if (!Number.isFinite(projectAmount) || projectAmount <= 0) {
        showErrorToast("Project amount must be greater than 0");
        return false;
      }
      return true;
    }

    if (isMilestone) {
      const budget = Number(formData.budget);
      if (!Number.isFinite(budget) || budget <= 0) {
        showErrorToast("Project budget must be greater than 0");
        return false;
      }
      if (milestones.length === 0) {
        showErrorToast("Add at least one milestone");
        return false;
      }
      for (let index = 0; index < milestones.length; index++) {
        const milestone = milestones[index];
        if (!String(milestone?.title || "").trim()) {
          showErrorToast(`Milestone ${index + 1} title is required`);
          return false;
        }
        if (!milestone?.dueDate) {
          showErrorToast(`Milestone ${index + 1} due date is required`);
          return false;
        }
        if (
          milestone.dueDate < formData.startDate ||
          milestone.dueDate > formData.endDate
        ) {
          showErrorToast(
            `Milestone ${index + 1} due date must be within project dates`
          );
          return false;
        }
        const amount = Number(milestone?.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          showErrorToast(
            `Milestone ${index + 1} amount must be greater than 0`
          );
          return false;
        }
      }
      if (totalMilestoneAmount > budget) {
        showErrorToast(
          "Total milestone amount cannot exceed project budget"
        );
        return false;
      }
      return true;
    }

    if (isHourly) {
      const budget = Number(formData.budget);
      if (!Number.isFinite(budget) || budget <= 0) {
        showErrorToast("Project budget must be greater than 0");
        return false;
      }
      const hourlyRate = Number(formData.billingRate);
      if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
        showErrorToast("Hourly rate must be greater than 0");
        return false;
      }
      if (!formData.billingCycle) {
        showErrorToast("Billing cycle is required");
        return false;
      }
      return true;
    }

    if (isRetainer) {
      const recurringAmount = Number(formData.recurringAmount);
      if (!Number.isFinite(recurringAmount) || recurringAmount <= 0) {
        showErrorToast("Retainer amount must be greater than 0");
        return false;
      }
      if (!formData.billingCycle) {
        showErrorToast("Billing cycle is required");
        return false;
      }
      if (!formData.recurringStartDate) {
        showErrorToast("Retainer start date is required");
        return false;
      }
      if (formData.recurringStartDate < formData.startDate) {
        showErrorToast(
          "Retainer start date cannot be before project start date"
        );
        return false;
      }
      if (
        formData.recurringEndDate &&
        formData.endDate &&
        formData.recurringEndDate > formData.endDate
      ) {
        showErrorToast(
          "Retainer end date cannot be after project end date"
        );
        return false;
      }
      if (
        formData.recurringEndDate &&
        formData.recurringEndDate < formData.recurringStartDate
      ) {
        showErrorToast(
          "Retainer end date cannot be before retainer start date"
        );
        return false;
      }
      if (!calculatedNextBillingDate) {
        showErrorToast("Unable to calculate the next billing date");
        return false;
      }
      if (
        formData.recurringEndDate &&
        calculatedNextBillingDate > formData.recurringEndDate
      ) {
        showErrorToast(
          "Retainer end date must allow at least one billing cycle"
        );
        return false;
      }
      return true;
    }

    return true;
  }, [
    formData,
    milestones,
    isFixedFee,
    isMilestone,
    isHourly,
    isRetainer,
    totalMilestoneAmount,
    calculatedNextBillingDate,
  ]);

  /* =======================================================
     BUILD PAYLOAD
  ======================================================= */

  const buildPayload = useCallback(() => {
    const budget = isRetainer ? null : toNumber(formData.budget);
    const billingRate = isHourly
      ? toNumber(formData.billingRate)
      : null;
    const recurringAmount = isRetainer
      ? toNumber(formData.recurringAmount)
      : null;

    const projectMilestones = isMilestone
      ? milestones.map((milestone) => ({
          title: String(milestone.title || "").trim(),
          dueDate: milestone.dueDate,
          amount: toNumber(milestone.amount),
          status: String(milestone.status || "scheduled").toLowerCase(),
        }))
      : [];

    const nextBillingDate = isRetainer
      ? calculatedNextBillingDate || null
      : null;

    return {
      title: String(formData.title).trim(),
      client: formData.client,
      clientName: String(formData.clientName || "").trim(),
      projectType: formData.projectType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dueDate: formData.endDate,
      description: String(formData.description || "").trim(),
      currency: selectedCurrency?.code || "INR",

      budget,
      billed: 0,

      billingMethod: formData.billingMethod,
      billingRateType: formData.billingRateType,
      billingRate,
      billingCycle:
        isHourly || isRetainer ? formData.billingCycle : null,
      paymentMethod: formData.paymentMethod,
      paymentTerms: formData.paymentTerms,

      isRecurring: recurringEnabled,
      recurringAmount,
      recurringStartDate: recurringEnabled
        ? formData.recurringStartDate || null
        : null,
      recurringEndDate: recurringEnabled
        ? formData.recurringEndDate || null
        : null,
      nextBillingDate,
      recurringStatus: recurringEnabled
        ? formData.recurringStatus || "ACTIVE"
        : null,

      autoInvoice: Boolean(formData.autoInvoice),
      autoCharge: isRetainer ? Boolean(formData.autoCharge) : false,

      color: formData.color,
      icon: formData.icon,

      progress: 0,
      status: "ACTIVE",

      milestones: projectMilestones,

      teamMembers: teamMembers.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email || undefined,
      })),
      members: teamMembers.length,
    };
  }, [
    formData,
    isHourly,
    isRetainer,
    isMilestone,
    recurringEnabled,
    calculatedNextBillingDate,
    milestones,
    selectedCurrency,
    teamMembers,
  ]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const createProject = useCallback(async () => {
    if (loading) return;
    if (!validateForm()) return;

    const token = getAuthToken();
    if (!token) {
      showErrorToast("Your session has expired. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const payload = buildPayload();
      console.log("CREATE PROJECT PAYLOAD:", payload);

      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
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

      const createdProject =
        data?.project || data?.data || data;

      showSuccessToast("Project created successfully");

      if (typeof onProjectCreated === "function") {
        await onProjectCreated(createdProject);
      }

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
    loading,
    validateForm,
    buildPayload,
    onProjectCreated,
    resetForm,
    onClose,
  ]);

  /* =======================================================
     FOOTER
  ======================================================= */

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

  /* =======================================================
     RENDER
  ======================================================= */

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
        {/* =================================================
            1. PROJECT BASICS
        ================================================= */}
        <section>
          <h4 className={sectionLabelClass}>
            <span className={stepBadgeClass}>1</span>
            Project Basics
          </h4>

          <div className="space-y-4">
            <FormInput
              label="Project Name *"
              value={formData.title}
              onChange={(event) =>
                handleChange("title", event.target.value)
              }
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
                    {clientsLoading
                      ? "Loading clients..."
                      : "Select Client"}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <SelectField
                label="Project Type"
                value={formData.projectType}
                onChange={(value) =>
                  handleChange("projectType", value)
                }
                options={PROJECT_TYPE_OPTIONS}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(event) =>
                  handleChange("startDate", event.target.value)
                }
                disabled={loading}
              />
              <FormInput
                label="End Date *"
                type="date"
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={(event) =>
                  handleChange("endDate", event.target.value)
                }
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
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                disabled={loading}
                placeholder="Describe the project..."
                className="
                  w-full px-3.5 py-2.5 border border-border rounded-lg
                  text-sm bg-[var(--input-background)] text-text
                  resize-none outline-none
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  disabled:bg-[var(--input-background-disabled)]
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
                    onClick={() => handleChange("color", color)}
                    aria-label={`Select ${color} project color`}
                    className={`
                      w-9 h-9 rounded-lg ${color} transition-transform
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

        {/* =================================================
            2. BILLING
        ================================================= */}
        <section className="pt-5 border-t border-border-light">
          <h4 className={sectionLabelClass}>
            <span className={stepBadgeClass}>2</span>
            Billing
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-text-secondary mb-2">
                Billing Method *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BILLING_OPTIONS.map((item) => {
                  const active =
                    formData.billingMethod === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleBillingMethod(item.label)
                      }
                      aria-pressed={active}
                      className={`
                        flex flex-col items-center justify-center gap-1
                        min-h-[92px] p-3 rounded-lg border-2 transition-colors
                        ${
                          active
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border text-text-secondary hover:border-primary/40"
                        }
                      `}
                    >
                      <span className="material-symbols-outlined">
                        {item.icon}
                      </span>
                      <span className="text-[11px] font-bold">
                        {item.label}
                      </span>
                      <span className="text-[9px] text-center text-text-light leading-4">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FIXED FEE */}
            {isFixedFee && (
              <div className="p-4 rounded-xl border border-border bg-surface-secondary">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
                    <span className="material-symbols-outlined">
                      request_quote
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text">
                      Fixed Fee Billing
                    </h5>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      One agreed amount covers the complete project.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <MoneyInput
                    id="project-amount"
                    label={`Project Amount (${
                      selectedCurrency?.code || "INR"
                    })`}
                    value={formData.budget}
                    onChange={(value) =>
                      handleChange("budget", value)
                    }
                    currencySymbol={currencySymbol}
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                  <p className="text-[10px] text-text-light -mt-2">
                    The single agreed price for the complete project.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectField
                      label="Payment Method"
                      value={formData.paymentMethod}
                      onChange={(value) =>
                        handleChange("paymentMethod", value)
                      }
                      options={PAYMENT_METHOD_OPTIONS}
                      disabled={loading}
                      required
                    />
                    <SelectField
                      label="Payment Terms"
                      value={formData.paymentTerms}
                      onChange={(value) =>
                        handleChange("paymentTerms", value)
                      }
                      options={PAYMENT_TERMS_OPTIONS}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MILESTONE */}
            {isMilestone && (
              <div className="p-4 rounded-xl border border-border bg-surface-secondary">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
                    <span className="material-symbols-outlined">
                      flag
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text">
                      Milestone Billing
                    </h5>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Divide the project budget into scheduled payments.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <MoneyInput
                    id="milestone-project-budget"
                    label={`Project Budget (${
                      selectedCurrency?.code || "INR"
                    })`}
                    value={formData.budget}
                    onChange={(value) =>
                      handleChange("budget", value)
                    }
                    currencySymbol={currencySymbol}
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                  <p className="text-[10px] text-text-light -mt-2">
                    Maximum project value that can be distributed across
                    milestones.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectField
                      label="Payment Method"
                      value={formData.paymentMethod}
                      onChange={(value) =>
                        handleChange("paymentMethod", value)
                      }
                      options={PAYMENT_METHOD_OPTIONS}
                      disabled={loading}
                      required
                    />
                    <SelectField
                      label="Payment Terms"
                      value={formData.paymentTerms}
                      onChange={(value) =>
                        handleChange("paymentTerms", value)
                      }
                      options={PAYMENT_TERMS_OPTIONS}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HOURLY */}
            {isHourly && (
              <div className="p-4 rounded-xl border border-border bg-surface-secondary">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0">
                    <span className="material-symbols-outlined">
                      schedule
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text">
                      Hourly Billing
                    </h5>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Charge based on tracked billable hours.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MoneyInput
                    id="hourly-project-budget"
                    label={`Project Budget (${
                      selectedCurrency?.code || "INR"
                    })`}
                    value={formData.budget}
                    onChange={(value) =>
                      handleChange("budget", value)
                    }
                    currencySymbol={currencySymbol}
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                  <MoneyInput
                    id="hourly-rate"
                    label={`Hourly Rate (${
                      selectedCurrency?.code || "INR"
                    })`}
                    value={formData.billingRate}
                    onChange={(value) =>
                      handleChange("billingRate", value)
                    }
                    currencySymbol={currencySymbol}
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                  <SelectField
                    label="Billing Cycle"
                    value={formData.billingCycle}
                    onChange={(value) =>
                      handleChange("billingCycle", value)
                    }
                    options={BILLING_CYCLE_OPTIONS}
                    disabled={loading}
                    required
                  />
                  <SelectField
                    label="Payment Method"
                    value={formData.paymentMethod}
                    onChange={(value) =>
                      handleChange("paymentMethod", value)
                    }
                    options={PAYMENT_METHOD_OPTIONS}
                    disabled={loading}
                    required
                  />
                  <SelectField
                    label="Payment Terms"
                    value={formData.paymentTerms}
                    onChange={(value) =>
                      handleChange("paymentTerms", value)
                    }
                    options={PAYMENT_TERMS_OPTIONS}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            {/* RETAINER */}
            {isRetainer && (
              <div className="p-4 rounded-xl border border-primary/20 bg-primary-soft/40">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary text-text-inverse grid place-items-center shrink-0">
                    <span className="material-symbols-outlined">
                      sync
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text">
                      Retainer Billing
                    </h5>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Recurring billing based on the selected cycle.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MoneyInput
                    id="retainer-amount"
                    label={`Retainer Amount (${
                      selectedCurrency?.code || "INR"
                    })`}
                    value={formData.recurringAmount}
                    onChange={(value) =>
                      handleChange("recurringAmount", value)
                    }
                    currencySymbol={currencySymbol}
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                  <SelectField
                    label="Billing Cycle"
                    value={formData.billingCycle}
                    onChange={(value) =>
                      handleChange("billingCycle", value)
                    }
                    options={BILLING_CYCLE_OPTIONS}
                    disabled={loading}
                    required
                  />
                  <SelectField
                    label="Payment Method"
                    value={formData.paymentMethod}
                    onChange={(value) =>
                      handleChange("paymentMethod", value)
                    }
                    options={PAYMENT_METHOD_OPTIONS}
                    disabled={loading}
                    required
                  />
                  <SelectField
                    label="Payment Terms"
                    value={formData.paymentTerms}
                    onChange={(value) =>
                      handleChange("paymentTerms", value)
                    }
                    options={PAYMENT_TERMS_OPTIONS}
                    disabled={loading}
                    required
                  />
                  <FormInput
                    label="Retainer Start Date *"
                    type="date"
                    value={formData.recurringStartDate}
                    min={formData.startDate || undefined}
                    max={formData.endDate || undefined}
                    onChange={(event) =>
                      handleChange(
                        "recurringStartDate",
                        event.target.value
                      )
                    }
                    disabled={loading}
                  />
                  <FormInput
                    label="Retainer End Date"
                    type="date"
                    value={formData.recurringEndDate}
                    min={
                      formData.recurringStartDate ||
                      formData.startDate ||
                      undefined
                    }
                    max={formData.endDate || undefined}
                    onChange={(event) =>
                      handleChange(
                        "recurringEndDate",
                        event.target.value
                      )
                    }
                    disabled={loading}
                  />

                  <div>
                    <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                      Next Billing Date
                    </label>
                    <div
                      className="
                        w-full px-3.5 py-2.5 border border-border
                        rounded-lg text-sm bg-surface text-text
                        min-h-[42px] flex items-center
                      "
                    >
                      {calculatedNextBillingDate
                        ? formatDisplayDate(calculatedNextBillingDate)
                        : "Select retainer start date"}
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-text-light">
                      Automatically calculated from the retainer start
                      date and billing cycle.
                    </p>
                  </div>

                  <SelectField
                    label="Retainer Status"
                    value={formData.recurringStatus}
                    onChange={(value) =>
                      handleChange("recurringStatus", value)
                    }
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "PAUSED", label: "Paused" },
                    ]}
                    disabled={loading}
                  />
                </div>

                <div className="mt-4 rounded-lg bg-surface p-3">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      event_repeat
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] leading-5 text-text-muted">
                        {calculatedNextBillingDate ? (
                          <>
                            The first recurring invoice will be
                            scheduled for{" "}
                            <strong className="text-text">
                              {formatDisplayDate(
                                calculatedNextBillingDate
                              )}
                            </strong>
                            .
                          </>
                        ) : (
                          <>
                            Select a retainer start date to calculate
                            the first billing date.
                          </>
                        )}
                      </p>
                      {calculatedNextBillingDate && (
                        <p className="mt-1 text-[10px] leading-4 text-text-light">
                          Future billing dates will continue
                          automatically every{" "}
                          <strong className="text-text-secondary">
                            {billingCycleLabel}
                          </strong>
                          .
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {calculatedNextBillingDate && (
                  <div className="mt-3 p-3 rounded-lg border border-border-light bg-surface">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-text-light">
                          Starts
                        </p>
                        <p className="mt-1 text-xs font-bold text-text">
                          {formatDisplayDate(
                            formData.recurringStartDate
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-text-light">
                          First Billing
                        </p>
                        <p className="mt-1 text-xs font-bold text-primary">
                          {formatDisplayDate(
                            calculatedNextBillingDate
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-text-light">
                          Amount
                        </p>
                        <p className="mt-1 text-xs font-bold text-text">
                          {currencySymbol || "₹"}
                          {Number(
                            formData.recurringAmount || 0
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AUTOMATION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 p-3 bg-surface-secondary rounded-lg">
                <div>
                  <div className="text-[13px] font-bold text-text">
                    Auto-generate invoices
                  </div>
                  <div className="text-[11.5px] text-text-muted">
                    Create invoices automatically when billing is due.
                  </div>
                </div>
                <Toggle
                  checked={formData.autoInvoice}
                  onChange={(value) =>
                    handleChange("autoInvoice", value)
                  }
                  disabled={loading}
                />
              </div>

              {isRetainer && (
                <div className="flex items-center justify-between gap-4 p-3 bg-surface-secondary rounded-lg">
                  <div>
                    <div className="text-[13px] font-bold text-text">
                      Auto-charge
                    </div>
                    <div className="text-[11.5px] text-text-muted">
                      Automatically attempt payment for eligible
                      recurring invoices.
                    </div>
                  </div>
                  <Toggle
                    checked={formData.autoCharge}
                    onChange={(value) =>
                      handleChange("autoCharge", value)
                    }
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            3. MILESTONES
        ================================================= */}
        {isMilestone && (
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
                    grid grid-cols-12 gap-2 items-start p-3
                    bg-surface-secondary rounded-lg border border-border-light
                  "
                >
                  <div className="col-span-12 sm:col-span-5">
                    <label className="text-[9px] uppercase text-text-light font-bold">
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
                      className="
                        w-full bg-transparent border-0 p-0
                        text-[13px] font-medium text-text outline-none
                      "
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[9px] uppercase text-text-light font-bold mb-1">
                      Due
                    </label>
                    <input
                      type="date"
                      min={formData.startDate || undefined}
                      max={formData.endDate || undefined}
                      value={item?.dueDate || ""}
                      onChange={(event) =>
                        updateMilestone(
                          index,
                          "dueDate",
                          event.target.value
                        )
                      }
                      disabled={loading}
                      className="
                        w-full min-w-0 bg-transparent border-0 p-0
                        text-[12px] text-text-secondary outline-none
                      "
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-3">
                    <label className="text-[9px] uppercase text-text-light font-bold">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-text-light text-xs">
                        {currencySymbol || "₹"}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item?.amount || ""}
                        onChange={(event) =>
                          updateMilestone(
                            index,
                            "amount",
                            event.target.value
                          )
                        }
                        disabled={loading}
                        placeholder="0.00"
                        className="
                          w-full pl-4 bg-transparent border-0 p-0
                          text-[13px] font-medium text-text outline-none
                        "
                      />
                    </div>
                  </div>

                  <div className="col-span-1 flex justify-center pt-5">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => deleteMilestone(index)}
                      className="text-danger hover:text-danger-hover disabled:opacity-40"
                      aria-label={`Delete milestone ${index + 1}`}
                    >
                      <span className="material-symbols-outlined">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                disabled={loading}
                onClick={addMilestone}
                className="
                  w-full py-2.5 border-2 border-dashed border-border
                  hover:border-primary/40 rounded-lg text-xs font-semibold
                  text-primary flex items-center justify-center gap-2
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
        )}

        {/* =================================================
            TEAM & ACCESS  (custom dropdown – project color)
        ================================================= */}
        <section className="pt-5 border-t border-border-light">
          <h4 className={sectionLabelClass}>
            <span className={stepBadgeClass}>
              {isMilestone ? "4" : "3"}
            </span>
            Team & Access
          </h4>

          {teamLoading ? (
            <p className="text-sm text-text-muted">
              Loading team members…
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {teamMembers.map((member) => (
                <span
                  key={member.id}
                  className="
                    inline-flex items-center gap-1.5
                    h-7 pl-1.5 pr-2
                    bg-primary-soft border border-primary/20
                    rounded-full text-[11px] font-semibold
                    text-primary-dark
                  "
                >
                  <span
                    className="
                      w-4 h-4 bg-primary text-text-inverse
                      rounded-full grid place-items-center
                      text-[9px] font-black shrink-0
                    "
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[120px] truncate">
                    {member.name}
                  </span>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removeMember(member.id)}
                    className="
                      ml-0.5 w-4 h-4 rounded-full
                      grid place-items-center
                      text-primary-dark/70 hover:text-danger
                      hover:bg-danger/10
                      disabled:opacity-40
                      transition-colors
                    "
                    aria-label={`Remove ${member.name}`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 12 }}
                    >
                      close
                    </span>
                  </button>
                </span>
              ))}

              {unselectedMembers.length > 0 && (
                <AddMemberDropdown
                  members={unselectedMembers}
                  onSelect={addMember}
                  disabled={loading}
                  projectColor={formData.color}
                />
              )}

              {!teamLoading && availableMembers.length === 0 && (
                <p className="text-[12px] text-text-muted">
                  No team members found. Invite people from{" "}
                  <strong className="text-text-secondary">
                    Team & Permissions
                  </strong>
                  .
                </p>
              )}
            </div>
          )}
        </section>

        {/* =================================================
            BILLING SUMMARY
        ================================================= */}
        <section className="pt-5 border-t border-border-light">
          <div className="p-4 rounded-xl border border-border bg-surface">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">
                summarize
              </span>
              <h4 className="text-sm font-bold text-text">
                Billing Summary
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[9px] uppercase font-bold text-text-light">
                  {isFixedFee
                    ? "Project Amount"
                    : isRetainer
                      ? "Retainer Amount"
                      : "Budget"}
                </p>
                <p className="mt-1 text-sm font-bold text-text">
                  {currencySymbol || "₹"}
                  {isRetainer
                    ? Number(formData.recurringAmount || 0).toFixed(2)
                    : Number(formData.budget || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold text-text-light">
                  Billing
                </p>
                <p className="mt-1 text-sm font-bold text-text">
                  {formData.billingMethod}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold text-text-light">
                  {isHourly
                    ? "Rate"
                    : isRetainer
                      ? "Recurring"
                      : isMilestone
                        ? "Milestones"
                        : "Payment"}
                </p>
                <p className="mt-1 text-sm font-bold text-text">
                  {isHourly && formData.billingRate && (
                    <>
                      {currencySymbol || "₹"}
                      {Number(formData.billingRate).toFixed(2)}/hr
                    </>
                  )}
                  {isRetainer && formData.recurringAmount && (
                    <>
                      {currencySymbol || "₹"}
                      {Number(formData.recurringAmount).toFixed(2)}/
                      {billingCycleLabel.toLowerCase()}
                    </>
                  )}
                  {isMilestone && (
                    <>
                      {currencySymbol || "₹"}
                      {Number(totalMilestoneAmount).toFixed(2)}
                    </>
                  )}
                  {isFixedFee && (
                    <>
                      {formData.paymentTerms
                        ? PAYMENT_TERMS_OPTIONS.find(
                            (item) =>
                              item.value === formData.paymentTerms
                          )?.label || "-"
                        : "-"}
                    </>
                  )}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold text-text-light">
                  {isRetainer ? "Next Billing" : "Cycle"}
                </p>
                <p className="mt-1 text-sm font-bold text-text">
                  {isRetainer
                    ? calculatedNextBillingDate
                      ? formatDisplayDate(calculatedNextBillingDate)
                      : "-"
                    : isHourly
                      ? billingCycleLabel
                      : isMilestone
                        ? "Milestone"
                        : "Project"}
                </p>
              </div>
            </div>

            {isRetainer && calculatedNextBillingDate && (
              <div className="mt-4 pt-3 border-t border-border-light flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[17px]">
                  autorenew
                </span>
                <p className="text-[10px] leading-4 text-text-muted">
                  Recurring billing starts on{" "}
                  <strong className="text-text">
                    {formatDisplayDate(formData.recurringStartDate)}
                  </strong>{" "}
                  and the first invoice is scheduled for{" "}
                  <strong className="text-text">
                    {formatDisplayDate(calculatedNextBillingDate)}
                  </strong>
                  . Future invoices follow the{" "}
                  <strong className="text-text">
                    {billingCycleLabel}
                  </strong>{" "}
                  cycle.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </RightDrawer>
  );
}