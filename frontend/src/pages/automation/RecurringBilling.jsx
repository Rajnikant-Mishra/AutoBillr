
import { useState, useEffect, useCallback } from "react";

import AutomationFlow from "../../components/automation/AutomationFlow";
import BillingConfiguration from "../../components/automation/BillingConfiguration";
import SchedulePreview from "../../components/automation/SchedulePreview";
import Badge from "../../components/ui/Badge";
import SectionHeader from "../../components/ui/SectionHeader";
import { getAuthToken } from "../../utils/auth";

export default function RecurringBilling() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const [activeEngines, setActiveEngines] = useState(0);

  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(true);

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
     TOKEN
  ========================================================= */

  const getToken = () => {
    return (
      getAuthToken() ||
      localStorage.getItem("autobiller-auth") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  /* =========================================================
     NORMALIZE CLIENT
  ========================================================= */

  const normalizeClient = (client) => {
    if (!client) return null;

    const clientId =
      client.id ??
      client._id ??
      client.clientId ??
      null;

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
     NORMALIZE PROJECT
  ========================================================= */

  const normalizeProject = (project) => {
    if (!project) return null;

    const projectId =
      project.id ??
      project._id ??
      project.projectId ??
      null;

    const projectName =
      project.title ??
      project.name ??
      project.projectName ??
      project.projectTitle ??
      "Untitled Project";

    const clientId =
      project.clientId ??
      project.client_id ??
      project.client?.id ??
      project.client?._id ??
      project.client?.clientId ??
      project.Client?.id ??
      project.Client?._id ??
      project.Client?.clientId ??
      null;

    return {
      ...project,
      id: projectId,
      title: projectName,
      name: projectName,
      clientId,
    };
  };

  /* =========================================================
     NORMALIZE CLIENT RESPONSE
  ========================================================= */

  const normalizeClientsResponse = (data) => {
    let list = [];

    if (Array.isArray(data)) {
      list = data;
    } else if (Array.isArray(data?.clients)) {
      list = data.clients;
    } else if (Array.isArray(data?.Clients)) {
      list = data.Clients;
    } else if (Array.isArray(data?.data?.clients)) {
      list = data.data.clients;
    } else if (Array.isArray(data?.data)) {
      list = data.data;
    } else if (Array.isArray(data?.result)) {
      list = data.result;
    }

    return list
      .map(normalizeClient)
      .filter(
        (client) =>
          client &&
          client.id !== null &&
          client.id !== undefined
      );
  };

  /* =========================================================
     NORMALIZE PROJECT RESPONSE
  ========================================================= */

  const normalizeProjectsResponse = (data) => {
    let list = [];

    if (Array.isArray(data)) {
      list = data;
    } else if (Array.isArray(data?.projects)) {
      list = data.projects;
    } else if (Array.isArray(data?.Projects)) {
      list = data.Projects;
    } else if (Array.isArray(data?.data?.projects)) {
      list = data.data.projects;
    } else if (Array.isArray(data?.data)) {
      list = data.data;
    } else if (Array.isArray(data?.result)) {
      list = data.result;
    }

    return list
      .map(normalizeProject)
      .filter(
        (project) =>
          project &&
          project.id !== null &&
          project.id !== undefined
      );
  };

  /* =========================================================
     FETCH OVERVIEW
     Only fetch automation information here.
  ========================================================= */

  const fetchOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);

      const token = getToken();

      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response = await fetch(
        `${API_BASE}/automation/overview`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load automation overview (${response.status})`
        );
      }

      setActiveEngines(
        data.activeEngines ??
          data.data?.activeEngines ??
          0
      );
    } catch (error) {
      console.error(
        "Failed to fetch automation overview:",
        error
      );

      setActiveEngines(0);
    } finally {
      setLoadingOverview(false);
    }
  }, [API_BASE]);

  /* =========================================================
     FETCH CLIENTS
     Same endpoint/pattern as Composer.jsx
  ========================================================= */

  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);

      const token = getToken();

      if (!token) {
        console.error("No authentication token found.");
        setClients([]);
        return;
      }

      const response = await fetch(
        `${API_BASE}/clients`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load clients (${response.status})`
        );
      }

      const normalizedClients =
        normalizeClientsResponse(data);

      console.log(
        "RECURRING BILLING → CLIENTS:",
        normalizedClients
      );

      setClients(normalizedClients);

      /*
       * Select first client automatically.
       */
      if (normalizedClients.length > 0) {
        setPreviewData((prev) => {
          if (prev.clientId) {
            return prev;
          }

          return {
            ...prev,
            clientId: String(normalizedClients[0].id),
            clientName: normalizedClients[0].name,
            projectId: "",
            projectName: "",
          };
        });
      }
    } catch (error) {
      console.error(
        "Failed to fetch clients:",
        error
      );

      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, [API_BASE]);

  /* =========================================================
     FETCH PROJECTS FOR SELECTED CLIENT
     Same logic as Composer.jsx
  ========================================================= */

  const fetchProjects = useCallback(
    async (clientId) => {
      if (!clientId) {
        setProjects([]);
        setLoadingProjects(false);
        return;
      }

      try {
        setLoadingProjects(true);

        const token = getToken();

        if (!token) {
          console.error("No authentication token found.");
          setProjects([]);
          return;
        }

        const url =
          `${API_BASE}/projects?clientId=` +
          encodeURIComponent(clientId);

        console.log(
          "RECURRING BILLING → FETCH PROJECTS:",
          url
        );

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Failed to load projects (${response.status})`
          );
        }

        const normalizedProjects =
          normalizeProjectsResponse(data);

        console.log(
          "RECURRING BILLING → PROJECTS FROM API:",
          normalizedProjects
        );

        /*
         * The endpoint already receives clientId.
         *
         * Still verify client relationship when
         * project response contains client information.
         */

        const projectsWithClientInfo =
          normalizedProjects.filter(
            (project) =>
              project.clientId !== null &&
              project.clientId !== undefined &&
              project.clientId !== ""
          );

        let filteredProjects = normalizedProjects;

        if (projectsWithClientInfo.length > 0) {
          const selectedClientId = String(clientId);

          filteredProjects =
            normalizedProjects.filter(
              (project) =>
                String(project.clientId) ===
                selectedClientId
            );
        }

        console.log(
          "RECURRING BILLING → FILTERED PROJECTS:",
          filteredProjects
        );

        setProjects(filteredProjects);

        /*
         * If current project no longer belongs to
         * selected client, clear it.
         */

        setPreviewData((prev) => {
          const currentProjectExists =
            filteredProjects.some(
              (project) =>
                String(project.id) ===
                String(prev.projectId)
            );

          if (currentProjectExists) {
            const selectedProject =
              filteredProjects.find(
                (project) =>
                  String(project.id) ===
                  String(prev.projectId)
              );

            return {
              ...prev,
              projectName:
                selectedProject?.title ||
                selectedProject?.name ||
                "",
            };
          }

          return {
            ...prev,
            projectId: "",
            projectName: "",
          };
        });
      } catch (error) {
        console.error(
          "Failed to fetch projects:",
          error
        );

        setProjects([]);

        setPreviewData((prev) => ({
          ...prev,
          projectId: "",
          projectName: "",
        }));
      } finally {
        setLoadingProjects(false);
      }
    },
    [API_BASE]
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchOverview();
    fetchClients();
  }, [fetchOverview, fetchClients]);

  /* =========================================================
     CLIENT CHANGE → FETCH PROJECTS
  ========================================================= */

  useEffect(() => {
    if (!previewData.clientId) {
      setProjects([]);
      return;
    }

    fetchProjects(previewData.clientId);
  }, [
    previewData.clientId,
    fetchProjects,
  ]);

  /* =========================================================
     CLIENT SELECT HANDLER
  ========================================================= */

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(
      (client) =>
        String(client.id) === String(clientId)
    );

    setPreviewData((prev) => ({
      ...prev,

      clientId: clientId
        ? String(clientId)
        : "",

      clientName:
        selectedClient?.name || "",
      projectId: "",
      projectName: "",
    })
  )
  };

  /* =========================================================
     PROJECT SELECT HANDLER
  ========================================================= */

  const handleProjectChange = (projectId) => {
    const selectedProject = projects.find(
      (project) =>
        String(project.id) === String(projectId)
    );

    setPreviewData((prev) => ({
      ...prev,

      projectId: projectId
        ? String(projectId)
        : "",

      projectName:
        selectedProject?.title ||
        selectedProject?.name ||
        "",
    }));
  };

  /* =========================================================
     PASS SELECT HANDLERS TO BILLING CONFIGURATION
  ========================================================= */

  return (
    <div className="page-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <SectionHeader
          title="Recurring Billing"
          description="Configure autonomous payment cycles for your enterprise clients. Automation ensures zero-leakage revenue collection."
        />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <Badge
              label="Active Engines"
              variant="active"
            />

            <div className="text-xl font-black text-text">
              {loadingOverview
                ? "..."
                : activeEngines}
            </div>
          </div>

          <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <span className="material-symbols-outlined">
              bolt
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <BillingConfiguration
            previewData={previewData}
            setPreviewData={setPreviewData}

            clients={clients}
            projects={projects}

            loadingClients={loadingClients}
            loadingProjects={loadingProjects}

            onClientChange={handleClientChange}
            onProjectChange={handleProjectChange}

            onRefresh={async () => {
              await fetchOverview();
              await fetchClients();

              if (previewData.clientId) {
                await fetchProjects(
                  previewData.clientId
                );
              }
            }}
          />
        </div>

        <div className="lg:col-span-5">
          <SchedulePreview
            previewData={previewData}
          />
        </div>
      </div>

      <AutomationFlow
        previewData={previewData}
      />
    </div>
  );
}

