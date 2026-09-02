import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import FrequencySelector from "./FrequencySelector";
import AutomationToggle from "./AutomationToggle";
import useCurrency from "../../hooks/useCurrency";
import {
  showSuccessToast,
  showErrorToast,
} from "../ui/CustomToast";
export default function BillingConfiguration({  setPreviewData,}) {
  const { format, currencySymbol } = useCurrency();
  const [frequency, setFrequency] = useState("Monthly");

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
const [amount, setAmount] = useState(10000);
  const [settings, setSettings] = useState({
    autoSubmit: true,
    autoCharge: false,
  });
useEffect(() => {
  const client =
    clients.find((c) => c._id === selectedClient)?.name || "";

  const selectedProj = projects.find(
    (p) => p._id === selectedProject
  );

  const project =
    selectedProj?.title ||
    selectedProj?.projectName ||
    selectedProj?.name ||
    "";

  setPreviewData((prev) => ({
    ...prev,
    frequency,
    amount: Number(amount) || 0,
    clientName: client,
    projectName: project,
  }));
}, [
  frequency,
  amount,
  selectedClient,
  selectedProject,
  clients,
  projects,
  setPreviewData,
]);

const saveRecurringBilling = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/recurring-billing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client: selectedClient,
          project: selectedProject,
          amount: Number(amount),
          frequency,
          autoSubmit: settings.autoSubmit,
          autoCharge: settings.autoCharge,
          nextRunDate: new Date(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to create recurring billing"
      );
    }

    // Activate Preview
  setPreviewData((prev) => ({
  ...prev,
  active: true,
}));

    showSuccessToast(
  "Automation Activated",
  "Recurring billing engine created successfully"
);

    // ==========================
    // RESET FORM
    // ==========================
    // Keep preview active
setPreviewData((prev) => ({
  ...prev,
  active: true,
}));

// Optional: reset form only
setSelectedClient("");
setSelectedProject("");
setProjects([]);

  } catch (error) {
    showErrorToast(
      error.message ||
        "Something went wrong"
    );
  }
};
  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ==========================
  // Fetch Clients
  // ==========================
 useEffect(() => {
  const fetchClients = async () => {
    setLoadingClients(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/clients`
      );

      const data = await response.json();

      const clientList = Array.isArray(data)
        ? data
        : data.clients || [];

      setClients(clientList);

  setSelectedClient("");
    } catch (error) {
      console.error(
        "Failed to fetch clients:",
        error
      );
    } finally {
      setLoadingClients(false);
    }
  };

  fetchClients();
}, []);

  // ==========================
  // Fetch Projects By Client
  // ==========================
 useEffect(() => {
  if (!selectedClient) {
    setProjects([]);
    setSelectedProject("");
    return;
  }

  const fetchProjects = async () => {
    setLoadingProjects(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/projects?clientId=${selectedClient}`
      );

      const data = await response.json();

      console.log("Projects API:", data);

      const projectList = Array.isArray(data)
        ? data
        : data.projects || [];

      setProjects(projectList);

      // Auto select first project
     setSelectedProject("");
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setSelectedProject("");
    } finally {
      setLoadingProjects(false);
    }
  };

  fetchProjects();
}, [selectedClient]);

  return (
    <Card padding="p-7">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 grid place-items-center">
          <span className="material-symbols-outlined">
            settings_suggest
          </span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Billing Configuration
          </h2>

          <p className="text-xs text-slate-500">
            Define the logic for this subscription engine.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Client + Project */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-slate-400"
                  style={{ fontSize: "14px" }}
                >
                  person
                </span>

                Target Client
              </span>
            </label>

            <select
  value={selectedClient}
  onChange={(e) =>
    setSelectedClient(e.target.value)
  }
  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
>
  <option value="">
    Select Client
  </option>

  {clients.map((client) => (
    <option
      key={client._id}
      value={client._id}
    >
      {client.name}
    </option>
  ))}
</select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-slate-400"
                  style={{ fontSize: "14px" }}
                >
                  folder_special
                </span>

                Link to Project
              </span>
            </label>

         <select
  value={selectedProject}
  onChange={(e) =>
    setSelectedProject(e.target.value)
  }
  disabled={!selectedClient || loadingProjects}
  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
>
  <option value="">
    {loadingProjects
      ? "Loading Projects..."
      : "Select Project"}
  </option>

  {projects.map((project) => (
    <option
      key={project._id}
      value={project._id}
    >
      {project.title ||
        project.projectName ||
        project.name}
    </option>
  ))}
</select>
          </div>
        </div>

        {/* Frequency */}
        <FrequencySelector
          value={frequency}
          onChange={setFrequency}
        />

        {/* Amount */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Amount Per Cycle
          </label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
             {currencySymbol}
            </span>

 <input
  type="number"
  min="0"
  value={amount}
  onChange={(e) =>
    setAmount(Number(e.target.value) || 0)
  }
  className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl"
/>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-slate-50 rounded-xl p-5 space-y-5">
          <AutomationToggle
            title="Auto-Submit Invoice"
            description="Generate and dispatch on schedule"
            icon="auto_awesome"
            enabled={settings.autoSubmit}
            onToggle={() =>
              handleToggle("autoSubmit")
            }
          />

          <AutomationToggle
            title="Auto-Charge Method"
            description="Charge stored payment method on due date"
            icon="payments"
            enabled={settings.autoCharge}
            onToggle={() =>
              handleToggle("autoCharge")
            }
          />
        </div>

        {/* Button */}
       <Button
  fullWidth
  icon="sync"
  className="h-12"
  onClick={saveRecurringBilling}
>
  Activate Automation Engine
</Button>
      </div>
    </Card>
  );
}