// import { useState } from "react";
// import AutomationFlow from "../../components/automation/AutomationFlow";
// import BillingConfiguration from "../../components/automation/BillingConfiguration";
// import SchedulePreview from "../../components/automation/SchedulePreview";
// import Badge from "../../components/ui/Badge";
// import SectionHeader from "../../components/ui/SectionHeader";
// import useCurrency from "../../hooks/useCurrency";

// export default function RecurringBilling() {
//   const [previewData, setPreviewData] = useState({
//     frequency: "Quarterly",
//     amount: 10000,
//     clientName: "",
//     projectName: "",
//     active: false,
//   });

//   return (
//     <div className="page-in">
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
//         <SectionHeader
//           title="Recurring Billing"
//           description="Configure autonomous payment cycles for your enterprise clients. Automation ensures zero-leakage revenue collection."
//         />

//         <div className="flex items-center gap-3">
//           <div className="text-right">
//             <Badge label="Active Engines" variant="active" />
//             <div className="text-xl font-black text-text">142</div>
//           </div>

//           <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
//             <span className="material-symbols-outlined">bolt</span>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
//         <div className="lg:col-span-7">
//           <BillingConfiguration
//             previewData={previewData}
//             setPreviewData={setPreviewData}
//           />
//         </div>

//         <div className="lg:col-span-5">
//           <SchedulePreview previewData={previewData} />
//         </div>
//       </div>

//       <AutomationFlow />
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import AutomationFlow from "../../components/automation/AutomationFlow";
import BillingConfiguration from "../../components/automation/BillingConfiguration";
import SchedulePreview from "../../components/automation/SchedulePreview";
import Badge from "../../components/ui/Badge";
import SectionHeader from "../../components/ui/SectionHeader";

export default function RecurringBilling() {
  const [clients, setClients] = useState([]);
  const [activeEngines, setActiveEngines] = useState(0);
  const [loading, setLoading] = useState(true);

  const [previewData, setPreviewData] = useState({
    frequency: "Monthly",
    amount: 10000,
    clientId: "",
    clientName: "",
    projectId: "",
    projectName: "",
    autoSubmit: true,
    autoCharge: false,
    active: false,
  });

  const fetchOverview = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:5000/api/v1/automation/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setClients(data.clients || []);
        setActiveEngines(data.activeEngines || 0);

        if (data.clients?.length > 0) {
          setPreviewData((prev) => ({
            ...prev,
            clientId: prev.clientId || data.clients[0].id,
            clientName: prev.clientName || data.clients[0].name,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch automation overview:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount (no synchronous setState inside effect)
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch("http://localhost:5000/api/v1/automation/overview", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (isMounted && data.success) {
          setClients(data.clients || []);
          setActiveEngines(data.activeEngines || 0);

          if (data.clients?.length > 0) {
            setPreviewData((prev) => ({
              ...prev,
              clientId: prev.clientId || data.clients[0].id,
              clientName: prev.clientName || data.clients[0].name,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch automation overview:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <SectionHeader
          title="Recurring Billing"
          description="Configure autonomous payment cycles for your enterprise clients. Automation ensures zero-leakage revenue collection."
        />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <Badge label="Active Engines" variant="active" />
            <div className="text-xl font-black text-text">
              {loading ? "..." : activeEngines}
            </div>
          </div>

          <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <span className="material-symbols-outlined">bolt</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <BillingConfiguration
            previewData={previewData}
            setPreviewData={setPreviewData}
            clients={clients}
            onRefresh={fetchOverview}
          />
        </div>

        <div className="lg:col-span-5">
          <SchedulePreview previewData={previewData} />
        </div>
      </div>

      <AutomationFlow previewData={previewData} />
    </div>
  );
}