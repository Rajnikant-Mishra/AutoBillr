import { useState, useEffect, useCallback } from "react";
import AutomationFlow from "../../components/automation/AutomationFlow";
import BillingConfiguration from "../../components/automation/BillingConfiguration";
import SchedulePreview from "../../components/automation/SchedulePreview";
import Badge from "../../components/ui/Badge";
import SectionHeader from "../../components/ui/SectionHeader";
import { getAuthToken } from "../../utils/auth";

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

  /* =========================================================
     API BASE URL
  ========================================================= */
  const API_BASE = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api/v1"
  ).replace(/\/$/, "");

  /* =========================================================
     NORMALIZE CLIENT (same as Composer.jsx)
  ========================================================= */
  const normalizeClient = (client) => {
    if (!client) return null;

    const clientId =
      client.id ?? client._id ?? client.clientId ?? null;

    const clientName =
      client.name ??
      client.clientName ??
      client.companyName ??
      client.fullName ??
      "Unnamed Client";

    return {
      ...client,
      id: clientId,
      name: clientName,
    };
  };

  /* =========================================================
     FETCH OVERVIEW
  ========================================================= */
  const fetchOverview = useCallback(async () => {
    try {
      const token =
        getAuthToken() ||
        localStorage.getItem("autobiller-auth") ||
        localStorage.getItem("token") ||
        "";

      const res = await fetch(`${API_BASE}/automation/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (data.success || res.ok) {
        let list = [];

        if (Array.isArray(data.clients)) {
          list = data.clients;
        } else if (Array.isArray(data.data?.clients)) {
          list = data.data.clients;
        } else if (Array.isArray(data.data)) {
          list = data.data;
        } else if (Array.isArray(data)) {
          list = data;
        }

        const normalizedClients = list
          .map(normalizeClient)
          .filter((c) => c && c.id !== null && c.id !== undefined);

        setClients(normalizedClients);
        setActiveEngines(
          data.activeEngines ?? data.data?.activeEngines ?? 0
        );

        // Pre-select first client if none selected
        if (normalizedClients.length > 0) {
          setPreviewData((prev) => {
            if (prev.clientId) return prev;

            return {
              ...prev,
              clientId: String(normalizedClients[0].id),
              clientName: normalizedClients[0].name,
            };
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch automation overview:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const token =
          getAuthToken() ||
          localStorage.getItem("autobiller-auth") ||
          localStorage.getItem("token") ||
          "";

        const res = await fetch(`${API_BASE}/automation/overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!isMounted) return;

        if (data.success || res.ok) {
          let list = [];

          if (Array.isArray(data.clients)) {
            list = data.clients;
          } else if (Array.isArray(data.data?.clients)) {
            list = data.data.clients;
          } else if (Array.isArray(data.data)) {
            list = data.data;
          } else if (Array.isArray(data)) {
            list = data;
          }

          const normalizedClients = list
            .map(normalizeClient)
            .filter((c) => c && c.id !== null && c.id !== undefined);

          setClients(normalizedClients);
          setActiveEngines(
            data.activeEngines ?? data.data?.activeEngines ?? 0
          );

          if (normalizedClients.length > 0) {
            setPreviewData((prev) => {
              if (prev.clientId) return prev;

              return {
                ...prev,
                clientId: String(normalizedClients[0].id),
                clientName: normalizedClients[0].name,
              };
            });
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

    load();

    return () => {
      isMounted = false;
    };
  }, [API_BASE]);

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