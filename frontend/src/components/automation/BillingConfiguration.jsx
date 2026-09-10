// import { useEffect, useState } from "react";
// import Card from "../ui/Card";
// import Button from "../ui/Button";
// import FrequencySelector from "./FrequencySelector";
// import AutomationToggle from "./AutomationToggle";
// import useCurrency from "../../hooks/useCurrency";
// import { showSuccessToast, showErrorToast } from "../ui/CustomToast";

// const selectClassName = `
//   w-full px-3 py-2.5
//   border border-border rounded-lg text-sm
//   bg-[var(--input-background)] text-text
//   focus:outline-none
//   focus:border-primary focus:ring-2 focus:ring-primary/20
//   disabled:bg-[var(--input-background-disabled)] disabled:cursor-not-allowed
//   transition-colors duration-fast
// `;

// const labelClass =
//   "block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5";

// export default function BillingConfiguration({ setPreviewData }) {
//   const { currencySymbol } = useCurrency();

//   const [frequency, setFrequency] = useState("Monthly");
//   const [clients, setClients] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [loadingClients, setLoadingClients] = useState(false);
//   const [loadingProjects, setLoadingProjects] = useState(false);
//   const [selectedClient, setSelectedClient] = useState("");
//   const [selectedProject, setSelectedProject] = useState("");
//   const [amount, setAmount] = useState(10000);
//   const [settings, setSettings] = useState({
//     autoSubmit: true,
//     autoCharge: false,
//   });

//   useEffect(() => {
//     const client =
//       clients.find((c) => c._id === selectedClient)?.name || "";

//     const selectedProj = projects.find((p) => p._id === selectedProject);

//     const project =
//       selectedProj?.title ||
//       selectedProj?.projectName ||
//       selectedProj?.name ||
//       "";

//     setPreviewData((prev) => ({
//       ...prev,
//       frequency,
//       amount: Number(amount) || 0,
//       clientName: client,
//       projectName: project,
//     }));
//   }, [
//     frequency,
//     amount,
//     selectedClient,
//     selectedProject,
//     clients,
//     projects,
//     setPreviewData,
//   ]);

//   const saveRecurringBilling = async () => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/recurring-billing`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             client: selectedClient,
//             project: selectedProject,
//             amount: Number(amount),
//             frequency,
//             autoSubmit: settings.autoSubmit,
//             autoCharge: settings.autoCharge,
//             nextRunDate: new Date(),
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to create recurring billing"
//         );
//       }

//       setPreviewData((prev) => ({
//         ...prev,
//         active: true,
//       }));

//       showSuccessToast(
//         "Automation Activated",
//         "Recurring billing engine created successfully"
//       );

//       setSelectedClient("");
//       setSelectedProject("");
//       setProjects([]);
//     } catch (error) {
//       showErrorToast(error.message || "Something went wrong");
//     }
//   };

//   const handleToggle = (key) => {
//     setSettings((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   // Fetch Clients
//   useEffect(() => {
//     const fetchClients = async () => {
//       setLoadingClients(true);

//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_API_URL}/clients`
//         );
//         const data = await response.json();

//         const clientList = Array.isArray(data) ? data : data.clients || [];
//         setClients(clientList);
//         setSelectedClient("");
//       } catch (error) {
//         console.error("Failed to fetch clients:", error);
//       } finally {
//         setLoadingClients(false);
//       }
//     };

//     fetchClients();
//   }, []);

//   // Fetch Projects By Client
//   useEffect(() => {
//     if (!selectedClient) {
//       setProjects([]);
//       setSelectedProject("");
//       return;
//     }

//     const fetchProjects = async () => {
//       setLoadingProjects(true);

//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_API_URL}/projects?clientId=${selectedClient}`
//         );
//         const data = await response.json();

//         const projectList = Array.isArray(data)
//           ? data
//           : data.projects || [];

//         setProjects(projectList);
//         setSelectedProject("");
//       } catch (error) {
//         console.error("Failed to fetch projects:", error);
//         setSelectedProject("");
//       } finally {
//         setLoadingProjects(false);
//       }
//     };

//     fetchProjects();
//   }, [selectedClient]);

//   return (
//     <Card padding="p-7">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-7">
//         <div className="w-10 h-10 rounded-lg bg-info-soft text-info grid place-items-center">
//           <span className="material-symbols-outlined">settings_suggest</span>
//         </div>

//         <div>
//           <h2 className="text-lg font-bold text-text">
//             Billing Configuration
//           </h2>
//           <p className="text-xs text-text-muted">
//             Define the logic for this subscription engine.
//           </p>
//         </div>
//       </div>

//       <div className="space-y-6">
//         {/* Client + Project */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Client */}
//           <div>
//             <label className={labelClass}>
//               <span className="flex items-center gap-1.5">
//                 <span className="material-symbols-outlined text-text-light text-[14px]">
//                   person
//                 </span>
//                 Target Client
//               </span>
//             </label>

//             <select
//               value={selectedClient}
//               onChange={(e) => setSelectedClient(e.target.value)}
//               disabled={loadingClients}
//               className={selectClassName}
//             >
//               <option value="">
//                 {loadingClients ? "Loading clients..." : "Select Client"}
//               </option>
//               {clients.map((client) => (
//                 <option key={client._id} value={client._id}>
//                   {client.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Project */}
//           <div>
//             <label className={labelClass}>
//               <span className="flex items-center gap-1.5">
//                 <span className="material-symbols-outlined text-text-light text-[14px]">
//                   folder_special
//                 </span>
//                 Link to Project
//               </span>
//             </label>

//             <select
//               value={selectedProject}
//               onChange={(e) => setSelectedProject(e.target.value)}
//               disabled={!selectedClient || loadingProjects}
//               className={selectClassName}
//             >
//               <option value="">
//                 {loadingProjects ? "Loading Projects..." : "Select Project"}
//               </option>
//               {projects.map((project) => (
//                 <option key={project._id} value={project._id}>
//                   {project.title || project.projectName || project.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Frequency */}
//         <FrequencySelector value={frequency} onChange={setFrequency} />

//         {/* Amount */}
//         <div>
//           <label className={labelClass}>Amount Per Cycle</label>

//           <div className="relative">
//             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light font-bold">
//               {currencySymbol}
//             </span>

//             <input
//               type="number"
//               min="0"
//               value={amount}
//               onChange={(e) => setAmount(Number(e.target.value) || 0)}
//               className="
//                 w-full pl-9 pr-4 py-3
//                 border border-border rounded-xl text-sm
//                 bg-[var(--input-background)] text-text
//                 focus:outline-none
//                 focus:border-primary focus:ring-2 focus:ring-primary/20
//                 transition-colors duration-fast
//               "
//             />
//           </div>
//         </div>

//         {/* Toggles */}
//         <div className="bg-surface-secondary rounded-xl p-5 space-y-5">
//           <AutomationToggle
//             title="Auto-Submit Invoice"
//             description="Generate and dispatch on schedule"
//             icon="auto_awesome"
//             enabled={settings.autoSubmit}
//             onToggle={() => handleToggle("autoSubmit")}
//           />

//           <AutomationToggle
//             title="Auto-Charge Method"
//             description="Charge stored payment method on due date"
//             icon="payments"
//             enabled={settings.autoCharge}
//             onToggle={() => handleToggle("autoCharge")}
//           />
//         </div>

//         {/* CTA */}
//         <Button
//           fullWidth
//           icon="sync"
//           className="h-12"
//           onClick={saveRecurringBilling}
//         >
//           Activate Automation Engine
//         </Button>
//       </div>
//     </Card>
//   );
// }

import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import FrequencySelector from "./FrequencySelector";
import AutomationToggle from "./AutomationToggle";
import useCurrency from "../../hooks/useCurrency";
import { showSuccessToast, showErrorToast } from "../ui/CustomToast";

const selectClassName = `
  w-full px-3 py-2.5
  border border-border rounded-lg text-sm
  bg-[var(--input-background)] text-text
  focus:outline-none
  focus:border-primary focus:ring-2 focus:ring-primary/20
  disabled:bg-[var(--input-background-disabled)] disabled:cursor-not-allowed
  transition-colors duration-fast
`;

const labelClass =
  "block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5";

export default function BillingConfiguration({
  setPreviewData,
  clients = [],
  onRefresh,
}) {
  const { currencySymbol } = useCurrency();

  const [frequency, setFrequency] = useState("Monthly");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [amount, setAmount] = useState(10000);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoSubmit: true,
    autoCharge: false,
  });

  // Selected client ke projects nikalna
  const currentClientObj = clients.find(
    (c) => (c.id || c._id) === selectedClient
  );
  const projects = currentClientObj?.projects || [];

  // Update Schedule Preview safely without infinite loop
  useEffect(() => {
    const client = clients.find((c) => (c.id || c._id) === selectedClient);
    const clientName = client?.name || "";
    const proj = client?.projects?.find(
      (p) => (p.id || p._id) === selectedProject
    );
    const projectName = proj?.title || proj?.name || "";
    const numericAmount = Number(amount) || 0;

    setPreviewData((prev) => {
      // Loop protection: Agar data same hai toh state update mat karo
      if (
        prev.frequency === frequency &&
        prev.amount === numericAmount &&
        prev.clientId === selectedClient &&
        prev.clientName === clientName &&
        prev.projectId === selectedProject &&
        prev.projectName === projectName &&
        prev.autoSubmit === settings.autoSubmit &&
        prev.autoCharge === settings.autoCharge
      ) {
        return prev;
      }

      return {
        ...prev,
        frequency,
        amount: numericAmount,
        clientId: selectedClient,
        clientName,
        projectId: selectedProject,
        projectName,
        autoSubmit: settings.autoSubmit,
        autoCharge: settings.autoCharge,
      };
    });
  }, [
    frequency,
    amount,
    selectedClient,
    selectedProject,
    clients,
    settings,
    setPreviewData,
  ]);

  // Activate & Save Automation Engine
  const saveRecurringBilling = async () => {
    if (!selectedClient) {
      showErrorToast("Please select a target client first");
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token") || "";
      const apiBase =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

      const response = await fetch(`${apiBase.replace(/\/$/, "")}/automation/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: selectedClient,
          projectId: selectedProject || null,
          amount: Number(amount),
          frequency,
          autoSubmit: settings.autoSubmit,
          autoCharge: settings.autoCharge,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to activate recurring billing");
      }

      setPreviewData((prev) => ({
        ...prev,
        active: true,
      }));

      showSuccessToast(
        "Automation Activated",
        `Recurring billing engine enabled for ${currentClientObj?.name || "client"}`
      );

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Save Automation Error:", error);
      showErrorToast(error.message || "Something went wrong while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Card padding="p-7">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-lg bg-info-soft text-info grid place-items-center">
          <span className="material-symbols-outlined">settings_suggest</span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-text">
            Billing Configuration
          </h2>
          <p className="text-xs text-text-muted">
            Define the logic for this subscription engine.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Client + Project */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Client Dropdown */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-text-light text-[14px]">
                  person
                </span>
                Target Client
              </span>
            </label>

            <select
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                setSelectedProject("");
              }}
              className={selectClassName}
            >
              <option value="">
                {clients.length === 0 ? "No clients found" : "Select Client"}
              </option>
              {clients.map((client) => {
                const clientId = client.id || client._id;
                const isConfigured = client.automation?.isActive;
                return (
                  <option key={clientId} value={clientId}>
                    {client.name} {isConfigured ? "• (Active)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Link to Project Dropdown */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-text-light text-[14px]">
                  folder_special
                </span>
                Link to Project
              </span>
            </label>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={!selectedClient}
              className={selectClassName}
            >
              <option value="">
                {projects.length === 0
                  ? "No linked project (Client Level)"
                  : "Select Project (Optional)"}
              </option>
              {projects.map((project) => {
                const projId = project.id || project._id;
                return (
                  <option key={projId} value={projId}>
                    {project.title || project.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Frequency */}
        <FrequencySelector value={frequency} onChange={setFrequency} />

        {/* Amount */}
        <div>
          <label className={labelClass}>Amount Per Cycle</label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light font-bold">
              {currencySymbol}
            </span>

            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="
                w-full pl-9 pr-4 py-3
                border border-border rounded-xl text-sm
                bg-[var(--input-background)] text-text
                focus:outline-none
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-colors duration-fast
              "
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-surface-secondary rounded-xl p-5 space-y-5">
          <AutomationToggle
            title="Auto-Submit Invoice"
            description="Generate and dispatch on schedule"
            icon="auto_awesome"
            enabled={settings.autoSubmit}
            onToggle={() => handleToggle("autoSubmit")}
          />

          <AutomationToggle
            title="Auto-Charge Method"
            description="Charge stored payment method on due date"
            icon="payments"
            enabled={settings.autoCharge}
            onToggle={() => handleToggle("autoCharge")}
          />
        </div>

        {/* CTA */}
        <Button
          fullWidth
          icon="sync"
          className="h-12"
          onClick={saveRecurringBilling}
          disabled={isSaving || clients.length === 0}
        >
          {isSaving ? "Activating Engine..." : "Activate Automation Engine"}
        </Button>
      </div>
    </Card>
  );
}