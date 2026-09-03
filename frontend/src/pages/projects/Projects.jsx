import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ProjectCard from "../../components/projects/ProjectCard";
import ProjectDetailPanel from "../../components/projects/ProjectDetailPanel";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import ProjectDrawer from "../../components/projects/ProjectDrawer";
import ProjectFilterDrawer from "../../components/projects/ProjectFilterDrawer";
import MilestoneModal from "../../components/projects/MilestoneModal";

import { createColumnHelper } from "@tanstack/react-table";

import useCurrency from "../../hooks/useCurrency";
import { getAuthToken } from "../../utils/auth";
import useProjectNotifications from "../../hooks/useProjectNotifications";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const API_URL = `${API_BASE_URL.replace(/\/$/, "")}/projects`;

const DEFAULT_FILTERS = {
  projectStatus: [],
  milestoneStatus: [],
  budgetRange: [0, 0],
  minBilled: "",
  maxBilled: "",
  sortBy: "newest",
};

const MILESTONE_STATUSES = ["scheduled", "pending", "paid"];

/* =========================================================
   HELPERS
========================================================= */

const normalizeProject = (project) => {
  if (!project) return null;

  return {
    ...project,

    id: project?.id,

    title:
      project?.title ||
      project?.name ||
      "Untitled Project",

    clientName:
      project?.clientName ||
      project?.client?.name ||
      "No Client",

    budget: Number(project?.budget || 0),

    billed: Number(project?.billed || 0),

    progress: Math.min(
      Math.max(Number(project?.progress || 0), 0),
      100
    ),

    milestones: Array.isArray(project?.milestones)
      ? project.milestones.map((milestone) => ({
          ...milestone,

          id: milestone?.id,

          title: milestone?.title || "",

          amount: Number(milestone?.amount || 0),

          status: String(
            milestone?.status || "scheduled"
          ).toLowerCase(),

          dueDate: milestone?.dueDate || "",
        }))
      : [],
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Projects() {
  const { format } = useCurrency();

  const {
    notifyProjectCreated,
    notifyMilestoneCreated,
    notifyMilestonePaid,
    notifyOverdue,
  } = useProjectNotifications();

  /* =======================================================
     STATE
  ======================================================= */

  const [projects, setProjects] = useState([]);

  const [selectedProjectId, setSelectedProjectId] =
    useState(null);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [filters, setFilters] =
    useState(DEFAULT_FILTERS);

  const [showFilterDrawer, setShowFilterDrawer] =
    useState(false);

  const [projectDrawer, setProjectDrawer] =
    useState(false);

  const [showMilestoneModal, setShowMilestoneModal] =
    useState(false);

  const [editingMilestone, setEditingMilestone] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const notifiedOverdueRef =
    useRef(new Set());

  /* =======================================================
     PROJECT STATUS
  ======================================================= */

  const getProjectStatus = useCallback((project) => {
    const milestones = Array.isArray(project?.milestones)
      ? project.milestones
      : [];

    const budget = Number(project?.budget || 0);

    const billed = Number(project?.billed || 0);

    if (budget > 0 && billed > budget) {
      return "risk";
    }

    if (milestones.length === 0) {
      return "active";
    }

    const statuses = milestones.map((milestone) =>
      String(
        milestone?.status || ""
      ).toLowerCase()
    );

    if (
      statuses.length > 0 &&
      statuses.every((status) => status === "paid")
    ) {
      return "paid";
    }

    if (
      statuses.some((status) =>
        ["pending", "scheduled"].includes(status)
      )
    ) {
      return "pending";
    }

    return "active";
  }, []);

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columnHelper = useMemo(
    () => createColumnHelper(),
    []
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Project",

        cell: ({ row }) => (
          <div className="font-semibold text-text">
            {row.original.title || "Untitled"}
          </div>
        ),
      }),

      columnHelper.accessor(
        (row) =>
          row.clientName ||
          row.client?.name ||
          "No Client",
        {
          id: "client",
          header: "Client",
        }
      ),

      columnHelper.accessor("budget", {
        header: "Budget",

        cell: ({ getValue }) =>
          format(Number(getValue()) || 0),
      }),

      columnHelper.accessor("billed", {
        header: "Billed",

        cell: ({ getValue }) =>
          format(Number(getValue()) || 0),
      }),

      columnHelper.accessor("progress", {
        header: "Progress",

        cell: ({ getValue }) =>
          `${Number(getValue()) || 0}%`,
      }),

      columnHelper.display({
        id: "status",

        header: "Status",

        cell: ({ row }) =>
          getProjectStatus(row.original),
      }),
    ],
    [
      columnHelper,
      format,
      getProjectStatus,
    ]
  );

  void columns;

  /* =======================================================
     FETCH PROJECTS
  ======================================================= */

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const response = await fetch(API_URL, {
        method: "GET",

        headers: {
          Accept: "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      if (!response.ok) {
        let message =
          `Failed to fetch projects: ${response.status}`;

        try {
          const errorData =
            await response.json();

          if (errorData?.message) {
            message = errorData.message;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      const data = await response.json();

      let projectList = [];

      if (Array.isArray(data)) {
        projectList = data;
      } else if (Array.isArray(data?.projects)) {
        projectList = data.projects;
      } else if (Array.isArray(data?.data)) {
        projectList = data.data;
      }

      const normalizedProjects =
        projectList
          .map(normalizeProject)
          .filter(Boolean);

      setProjects(normalizedProjects);

      return normalizedProjects;
    } catch (err) {
      console.error(
        "Error fetching projects:",
        err
      );

      setError(
        err?.message ||
          "Unable to load projects."
      );

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* =======================================================
     PROJECT CREATED
     
     IMPORTANT:
     This is the only project-created handler.
  ======================================================= */

  const handleProjectCreated = useCallback(
    async (createdProject) => {
      console.log(
        "NEW PROJECT CREATED:",
        createdProject
      );

      if (!createdProject) {
        console.warn(
          "Project created but no project data returned."
        );

        await fetchProjects();

        setProjectDrawer(false);

        return;
      }

      const normalizedProject =
        normalizeProject(createdProject);

      if (!normalizedProject?.id) {
        console.warn(
          "Created project has no ID:",
          normalizedProject
        );

        await fetchProjects();

        setProjectDrawer(false);

        return;
      }

      /* -----------------------------------------------
         STEP 1
         Immediately add project to UI
      ------------------------------------------------ */

      setProjects((previousProjects) => {
        const alreadyExists =
          previousProjects.some(
            (project) =>
              String(project?.id) ===
              String(normalizedProject.id)
          );

        if (alreadyExists) {
          return previousProjects.map(
            (project) =>
              String(project?.id) ===
              String(normalizedProject.id)
                ? normalizedProject
                : project
          );
        }

        return [
          normalizedProject,
          ...previousProjects,
        ];
      });

      /* -----------------------------------------------
         STEP 2
         Remove filters so the new project is visible
      ------------------------------------------------ */

      setActiveFilter("all");

      setFilters({
        ...DEFAULT_FILTERS,
        budgetRange: [0, 0],
      });

      /* -----------------------------------------------
         STEP 3
         Select newly created project
      ------------------------------------------------ */

      setSelectedProjectId(
        normalizedProject.id
      );

      /* -----------------------------------------------
         STEP 4
         Show notification
      ------------------------------------------------ */

      notifyProjectCreated(
        normalizedProject,
        format
      );

      /* -----------------------------------------------
         STEP 5
         Refresh from database
         
         This makes sure the UI is synchronized
         with PostgreSQL.
      ------------------------------------------------ */

      await fetchProjects();

      /* -----------------------------------------------
         STEP 6
         Keep the newly created project selected
      ------------------------------------------------ */

      setSelectedProjectId(
        normalizedProject.id
      );

      /* -----------------------------------------------
         STEP 7
         Close drawer
      ------------------------------------------------ */

      setProjectDrawer(false);
    },
    [
      fetchProjects,
      notifyProjectCreated,
      format,
    ]
  );

  /* =======================================================
     MAX BUDGET
  ======================================================= */

  const maxBudgetAvailable = useMemo(() => {
    if (!projects.length) {
      return 0;
    }

    return Math.max(
      0,
      ...projects.map((project) =>
        Number(project?.budget || 0)
      )
    );
  }, [projects]);

  /* =======================================================
     INITIALIZE BUDGET RANGE
  ======================================================= */

  useEffect(() => {
    if (!projects.length) {
      return;
    }

    setFilters((previousFilters) => {
      const currentMax = Number(
        previousFilters?.budgetRange?.[1] || 0
      );

      if (
        currentMax > 0 ||
        maxBudgetAvailable === 0
      ) {
        return previousFilters;
      }

      return {
        ...previousFilters,

        budgetRange: [
          0,
          maxBudgetAvailable,
        ],
      };
    });
  }, [
    projects,
    maxBudgetAvailable,
  ]);

  /* =======================================================
     FILTERED PROJECTS
  ======================================================= */

  const filteredProjects = useMemo(() => {
    const projectList =
      Array.isArray(projects)
        ? projects
        : [];

    let result = [...projectList];

    /* -----------------------------------------------
       ACTIVE FILTER
    ------------------------------------------------ */

    if (
      activeFilter !== "all" &&
      filters.projectStatus.length === 0
    ) {
      result = result.filter(
        (project) =>
          getProjectStatus(project) ===
          activeFilter
      );
    }

    /* -----------------------------------------------
       PROJECT STATUS
    ------------------------------------------------ */

    if (
      Array.isArray(filters.projectStatus) &&
      filters.projectStatus.length > 0
    ) {
      result = result.filter((project) =>
        filters.projectStatus.includes(
          getProjectStatus(project)
        )
      );
    }

    /* -----------------------------------------------
       MILESTONE STATUS
    ------------------------------------------------ */

    if (
      Array.isArray(
        filters.milestoneStatus
      ) &&
      filters.milestoneStatus.length > 0
    ) {
      result = result.filter((project) => {
        const milestones =
          Array.isArray(project?.milestones)
            ? project.milestones
            : [];

        return milestones.some(
          (milestone) =>
            filters.milestoneStatus.includes(
              String(
                milestone?.status || ""
              ).toLowerCase()
            )
        );
      });
    }

    /* -----------------------------------------------
       BUDGET FILTER
    ------------------------------------------------ */

    const minBudget = Number(
      filters.budgetRange?.[0] || 0
    );

    const maxBudget =
      filters.budgetRange?.[1] !== undefined &&
      filters.budgetRange?.[1] !== null
        ? Number(filters.budgetRange[1])
        : Infinity;

    /*
      Only apply budget filtering when the user
      actually has a budget range selected.
    */

    if (
      maxBudget > 0 ||
      maxBudgetAvailable === 0
    ) {
      result = result.filter((project) => {
        const budget = Number(
          project?.budget || 0
        );

        return (
          budget >= minBudget &&
          budget <= maxBudget
        );
      });
    }

    /* -----------------------------------------------
       MIN BILLED
    ------------------------------------------------ */

    if (
      filters.minBilled !== "" &&
      filters.minBilled != null
    ) {
      const minBilled =
        Number(filters.minBilled);

      if (!Number.isNaN(minBilled)) {
        result = result.filter(
          (project) =>
            Number(project?.billed || 0) >=
            minBilled
        );
      }
    }

    /* -----------------------------------------------
       MAX BILLED
    ------------------------------------------------ */

    if (
      filters.maxBilled !== "" &&
      filters.maxBilled != null
    ) {
      const maxBilled =
        Number(filters.maxBilled);

      if (!Number.isNaN(maxBilled)) {
        result = result.filter(
          (project) =>
            Number(project?.billed || 0) <=
            maxBilled
        );
      }
    }

    /* -----------------------------------------------
       SORT
    ------------------------------------------------ */

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "budgetHigh":
          return (
            Number(b?.budget || 0) -
            Number(a?.budget || 0)
          );

        case "budgetLow":
          return (
            Number(a?.budget || 0) -
            Number(b?.budget || 0)
          );

        case "progressHigh":
          return (
            Number(b?.progress || 0) -
            Number(a?.progress || 0)
          );

        case "progressLow":
          return (
            Number(a?.progress || 0) -
            Number(b?.progress || 0)
          );

        case "oldest":
          return (
            new Date(
              a?.createdAt || 0
            ).getTime() -
            new Date(
              b?.createdAt || 0
            ).getTime()
          );

        case "newest":
        default:
          return (
            new Date(
              b?.createdAt || 0
            ).getTime() -
            new Date(
              a?.createdAt || 0
            ).getTime()
          );
      }
    });

    return result;
  }, [
    projects,
    activeFilter,
    filters,
    maxBudgetAvailable,
    getProjectStatus,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const projectList =
      Array.isArray(projects)
        ? projects
        : [];

    const totalProjects =
      projectList.length;

    let totalMilestones = 0;

    let totalRevenue = 0;

    let overdueAmount = 0;

    let overdueCount = 0;

    let pendingMilestones = 0;

    projectList.forEach((project) => {
      const milestones =
        Array.isArray(project?.milestones)
          ? project.milestones
          : [];

      totalMilestones +=
        milestones.length;

      milestones.forEach((milestone) => {
        const amount = Number(
          milestone?.amount || 0
        );

        const status = String(
          milestone?.status || ""
        ).toLowerCase();

        totalRevenue += amount;

        if (
          status === "pending" ||
          status === "scheduled"
        ) {
          pendingMilestones++;
        }

        if (
          milestone?.dueDate &&
          status !== "paid"
        ) {
          const dueDate =
            new Date(
              milestone.dueDate
            );

          if (
            !Number.isNaN(
              dueDate.getTime()
            ) &&
            dueDate < new Date()
          ) {
            overdueAmount += amount;
            overdueCount++;
          }
        }
      });
    });

    return [
      {
        title: "TOTAL PROJECTS",

        value: totalProjects,

        change:
          `${totalMilestones} milestones`,

        icon: "folder",

        iconColor: "text-primary",

        changeColor:
          "text-text-secondary",

        type: "progress",
      },

      {
        title: "TOTAL REVENUE",

        value:
          format(totalRevenue),

        change:
          "From all milestones",

        icon: "payments",

        iconColor: "text-info",

        changeColor:
          "text-text-muted",

        type: "bars",
      },

      {
        title: "OVERDUE",

        value:
          format(overdueAmount),

        change:
          `${overdueCount} overdue milestones`,

        icon: "warning",

        iconColor: "text-danger",

        changeColor:
          "text-danger",

        type: "danger",
      },

      {
        title:
          "PENDING MILESTONES",

        value:
          pendingMilestones,

        change:
          "Awaiting payment",

        icon: "schedule",

        iconColor:
          "text-warning",

        changeColor:
          "text-warning",

        type: "bars",
      },
    ];
  }, [projects, format]);

  /* =======================================================
     STATUS COUNTS
  ======================================================= */

  const statusCounts = useMemo(() => {
    const projectList =
      Array.isArray(projects)
        ? projects
        : [];

    return {
      active: projectList.filter(
        (project) =>
          getProjectStatus(project) ===
          "active"
      ).length,

      pending: projectList.filter(
        (project) =>
          getProjectStatus(project) ===
          "pending"
      ).length,

      paid: projectList.filter(
        (project) =>
          getProjectStatus(project) ===
          "paid"
      ).length,

      risk: projectList.filter(
        (project) =>
          getProjectStatus(project) ===
          "risk"
      ).length,
    };
  }, [
    projects,
    getProjectStatus,
  ]);

  /* =======================================================
     SELECTED PROJECT
  ======================================================= */

  useEffect(() => {
    if (!filteredProjects.length) {
      setSelectedProjectId(null);
      return;
    }

    if (
      selectedProjectId === null ||
      selectedProjectId === undefined
    ) {
      setSelectedProjectId(
        filteredProjects[0]?.id ?? null
      );

      return;
    }

    const exists =
      filteredProjects.some(
        (project) =>
          String(project?.id) ===
          String(selectedProjectId)
      );

    if (!exists) {
      setSelectedProjectId(
        filteredProjects[0]?.id ?? null
      );
    }
  }, [
    filteredProjects,
    selectedProjectId,
  ]);

  const selectedProject = useMemo(() => {
    if (!filteredProjects.length) {
      return null;
    }

    if (
      selectedProjectId === null ||
      selectedProjectId === undefined
    ) {
      return filteredProjects[0];
    }

    return (
      filteredProjects.find(
        (project) =>
          String(project?.id) ===
          String(selectedProjectId)
      ) ||
      filteredProjects[0]
    );
  }, [
    filteredProjects,
    selectedProjectId,
  ]);

  /* =======================================================
     OVERDUE NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    if (!Array.isArray(projects)) {
      return;
    }

    projects.forEach((project) => {
      const milestones =
        Array.isArray(project?.milestones)
          ? project.milestones
          : [];

      milestones.forEach((milestone) => {
        if (
          milestone?.status === "paid" ||
          !milestone?.dueDate
        ) {
          return;
        }

        const dueDate =
          new Date(
            milestone.dueDate
          );

        if (
          Number.isNaN(
            dueDate.getTime()
          ) ||
          dueDate >= new Date()
        ) {
          return;
        }

        const notificationKey =
          `${project?.id}-${
            milestone?.id ||
            milestone?.index ||
            milestone?.title
          }`;

        if (
          notifiedOverdueRef.current.has(
            notificationKey
          )
        ) {
          return;
        }

        notifiedOverdueRef.current.add(
          notificationKey
        );

        notifyOverdue(
          project,
          milestone
        );
      });
    });
  }, [
    projects,
    notifyOverdue,
  ]);

  /* =======================================================
     ADD MILESTONE
  ======================================================= */

  const addMilestone = useCallback(() => {
    setEditingMilestone({
      title: "",
      amount: 0,
      dueDate: "",
      status: "scheduled",
    });

    setShowMilestoneModal(true);
  }, []);

  /* =======================================================
     UPDATE MILESTONE STATUS
  ======================================================= */

  const updateMilestoneStatus =
    useCallback(
      (milestoneIndex) => {
        if (
          selectedProjectId === null ||
          selectedProjectId === undefined
        ) {
          return;
        }

        setProjects(
          (previousProjects) =>
            previousProjects.map(
              (project) => {
                if (
                  String(project?.id) !==
                  String(selectedProjectId)
                ) {
                  return project;
                }

                const milestones =
                  Array.isArray(
                    project?.milestones
                  )
                    ? project.milestones
                    : [];

                return {
                  ...project,

                  milestones:
                    milestones.map(
                      (
                        milestone,
                        index
                      ) => {
                        if (
                          index !==
                          milestoneIndex
                        ) {
                          return milestone;
                        }

                        const currentStatus =
                          String(
                            milestone?.status ||
                              "scheduled"
                          ).toLowerCase();

                        const currentIndex =
                          MILESTONE_STATUSES.indexOf(
                            currentStatus
                          );

                        const safeIndex =
                          currentIndex >= 0
                            ? currentIndex
                            : 0;

                        const nextStatus =
                          MILESTONE_STATUSES[
                            (safeIndex + 1) %
                              MILESTONE_STATUSES.length
                          ];

                        if (
                          nextStatus ===
                            "paid" &&
                          currentStatus !==
                            "paid"
                        ) {
                          notifyMilestonePaid(
                            project,
                            milestone,
                            format
                          );
                        }

                        return {
                          ...milestone,
                          status:
                            nextStatus,
                        };
                      }
                    ),
                };
              }
            )
        );
      },
      [
        selectedProjectId,
        notifyMilestonePaid,
        format,
      ]
    );

  void updateMilestoneStatus;

  /* =======================================================
     SAVE MILESTONE
  ======================================================= */

  const saveMilestone =
    useCallback(async () => {
      try {
        await fetchProjects();

        if (
          editingMilestone &&
          !editingMilestone.id &&
          selectedProject
        ) {
          notifyMilestoneCreated(
            selectedProject,
            editingMilestone,
            format
          );
        }

        setShowMilestoneModal(false);

        setEditingMilestone(null);
      } catch (error) {
        console.error(
          "Error refreshing milestones:",
          error
        );
      }
    }, [
      fetchProjects,
      editingMilestone,
      selectedProject,
      notifyMilestoneCreated,
      format,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">

        {/* =================================================
            HEADER
        ================================================= */}

        <SectionHeader
          title="Projects & Milestones"
          description="Track project budgets, milestones and milestone-based billing."
          secondaryAction={{
            label: "Filter",
            icon: "filter_list",
            onClick: () =>
              setShowFilterDrawer(true),
          }}
          primaryAction={{
            label: "New Project",
            icon: "add",
            onClick: () =>
              setProjectDrawer(true),
          }}
        />

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
          {stats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              change={item.change}
              icon={item.icon}
              iconColor={item.iconColor}
              changeColor={item.changeColor}
              variant="dashboard"
              showProgress={
                item.type === "progress"
              }
              progressValue={
                item.type === "progress"
                  ? Math.min(
                      projects.length * 10,
                      100
                    )
                  : 0
              }
            />
          ))}
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-12 gap-5">

          {/* =================================================
              LEFT - PROJECT LIST
          ================================================= */}

          <div className="col-span-12 lg:col-span-7 space-y-4">

            {loading &&
            projects.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-10 text-center text-text-muted">
                Loading projects...
              </div>
            ) : filteredProjects.length ===
              0 ? (
              <div className="bg-surface border border-border rounded-xl p-10 text-center">
                <div className="text-text font-semibold mb-1">
                  No Projects Found
                </div>

                <div className="text-sm text-text-muted">
                  Try changing your filters
                  or create a new project.
                </div>
              </div>
            ) : (
              filteredProjects.map(
                (project, index) => (
                  <ProjectCard
                    key={
                      project?.id ??
                      `project-${index}`
                    }
                    {...project}
                    isSelected={
                      String(
                        selectedProjectId
                      ) ===
                      String(project?.id)
                    }
                    onClick={() =>
                      setSelectedProjectId(
                        project?.id
                      )
                    }
                  />
                )
              )
            )}
          </div>

          {/* =================================================
              RIGHT - PROJECT DETAILS
          ================================================= */}

          <div className="col-span-12 lg:col-span-5">
            {selectedProject ? (
              <ProjectDetailPanel
                project={selectedProject}

                onAddMilestone={
                  addMilestone
                }

                onMilestoneClick={(
                  index
                ) => {
                  const milestones =
                    Array.isArray(
                      selectedProject?.milestones
                    )
                      ? selectedProject.milestones
                      : [];

                  const selectedMilestone =
                    milestones[index];

                  if (
                    !selectedMilestone
                  ) {
                    return;
                  }

                  setEditingMilestone({
                    ...selectedMilestone,
                  });

                  setShowMilestoneModal(
                    true
                  );
                }}
              />
            ) : (
              <div className="bg-surface border border-border rounded-xl p-10 text-center text-text-muted">
                Select a project to view
                details.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          PROJECT DRAWER
      ===================================================== */}

      <ProjectDrawer
        isOpen={projectDrawer}
        onClose={() =>
          setProjectDrawer(false)
        }
        onProjectCreated={
          handleProjectCreated
        }
      />

      {/* =====================================================
          FILTER DRAWER
      ===================================================== */}

      <ProjectFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() =>
          setShowFilterDrawer(false)
        }
        filters={filters}
        setFilters={setFilters}
        minBudgetAvailable={0}
        maxBudgetAvailable={
          maxBudgetAvailable
        }
        statusCounts={statusCounts}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* =====================================================
          MILESTONE MODAL
      ===================================================== */}

      {showMilestoneModal && (
        <MilestoneModal
          isOpen={showMilestoneModal}
          onClose={() => {
            setShowMilestoneModal(false);
            setEditingMilestone(null);
          }}
          milestone={editingMilestone}
          setMilestone={setEditingMilestone}
          onSave={saveMilestone}
          projectId={selectedProject?.id}
          project={selectedProject}
        />
      )}
    </main>
  );
}