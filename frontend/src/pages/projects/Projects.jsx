import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ProjectCard from "../../components/projects/ProjectCard";
import ProjectDetailPanel from "../../components/projects/ProjectDetailPanel";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import ProjectDrawer from "../../components/projects/ProjectDrawer";
import ProjectFilterDrawer from "../../components/projects/ProjectFilterDrawer";
import MilestoneModal from "../../components/projects/MilestoneModal";
import DataTable from "../../components/ui/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import useCurrency from "../../hooks/useCurrency";
import { getAuthToken } from "../../utils/auth";
import useProjectNotifications from "../../hooks/useProjectNotifications";
const API_URL =
  `${import.meta.env.VITE_API_URL}/projects`;

const DEFAULT_FILTERS = {
  projectStatus: [],
  milestoneStatus: [],
  budgetRange: [0, 0],
  minBilled: "",
  maxBilled: "",
  sortBy: "newest",
};

const MILESTONE_STATUSES = [
  "scheduled",
  "pending",
  "paid",
];

export default function Projects() {
  const { format } = useCurrency();

  const {
    notifyProjectCreated,
    notifyMilestoneCreated,
    notifyMilestonePaid,
    notifyOverdue,
  } = useProjectNotifications();

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [activeFilter, setActiveFilter] = useState("all");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [showFilterDrawer, setShowFilterDrawer] =
    useState(false);

  const [projectDrawer, setProjectDrawer] =
    useState(false);
    // --------------------------------------------------
  // PROJECT STATUS
  // --------------------------------------------------

  const getProjectStatus = useCallback((project) => {
    const milestones = Array.isArray(project?.milestones)
      ? project.milestones
      : [];

    const budget = Number(project?.budget || 0);
    const billed = Number(project?.billed || 0);

    // Budget exceeded
    if (budget > 0 && billed > budget) {
      return "risk";
    }

    // No milestones = active
    if (milestones.length === 0) {
      return "active";
    }

    const statuses = milestones.map((milestone) =>
      String(milestone?.status || "").toLowerCase()
    );

    // All milestones paid
    if (
      statuses.length > 0 &&
      statuses.every((status) => status === "paid")
    ) {
      return "paid";
    }

    // Has pending/scheduled milestones
    if (
      statuses.some((status) =>
        ["pending", "scheduled"].includes(status)
      )
    ) {
      return "pending";
    }

    return "active";
  }, []);
const columnHelper = createColumnHelper();
const columns = useMemo(
  () => [
    columnHelper.accessor("title", {
      header: "Project",
      cell: ({ row }) => (
        <div className="font-semibold text-slate-900">
          {row.original.title || "Untitled"}
        </div>
      ),
    }),
    columnHelper.accessor((row) => row.clientName || row.client?.name, {
      id: "client",
      header: "Client",
    }),
    columnHelper.accessor("budget", {
      header: "Budget",
      cell: ({ getValue }) => format(Number(getValue()) || 0),
    }),
    columnHelper.accessor("billed", {
      header: "Billed",
      cell: ({ getValue }) => format(Number(getValue()) || 0),
    }),
    columnHelper.accessor("progress", {
      header: "Progress",
      cell: ({ getValue }) => `${Number(getValue()) || 0}%`,
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: ({ row }) => getProjectStatus(row.original),
    }),
  ],
  [format, getProjectStatus]
);
  const [showMilestoneModal, setShowMilestoneModal] =
    useState(false);

  const [editingMilestone, setEditingMilestone] =
    useState(null);

  

  // --------------------------------------------------
  // FETCH PROJECTS
  // --------------------------------------------------

 const fetchProjects = useCallback(async () => {
 try {
    const token = getAuthToken();

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }

    const data = await response.json();
    console.log("Projects API response:", data);

    let projectList = [];
    if (Array.isArray(data)) {
      projectList = data;
    } else if (Array.isArray(data?.projects)) {
      projectList = data.projects;
    } else if (Array.isArray(data?.data)) {
      projectList = data.data;
    }

    const normalizedProjects = projectList.map((project) => ({
      ...project,
      // normalize id so table / selection works whether backend sends id or _id
      id: project?.id ?? project?._id,
      milestones: Array.isArray(project?.milestones) ? project.milestones : [],
      budget: Number(project?.budget || 0),
      billed: Number(project?.billed || 0),
      progress: Number(project?.progress || 0),
    }));

    setProjects(normalizedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    setProjects([]);
  }
}, []);

  // --------------------------------------------------
  // INITIAL FETCH
  // --------------------------------------------------

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // --------------------------------------------------
  // PROJECT CREATED EVENT
  // --------------------------------------------------

  useEffect(() => {
    const handleProjectCreated = (event) => {
      fetchProjects();

      if (event.detail?.project) {
        notifyProjectCreated(
          event.detail.project,
          format
        );
      }
    };

    window.addEventListener(
      "project-created",
      handleProjectCreated
    );

    return () => {
      window.removeEventListener(
        "project-created",
        handleProjectCreated
      );
    };
  }, [
    fetchProjects,
    notifyProjectCreated,
    format,
  ]);

  // --------------------------------------------------
  // INITIALIZE BUDGET RANGE
  // --------------------------------------------------

  const maxBudgetAvailable = useMemo(() => {
    if (!projects.length) {
      return 0;
    }

    return Math.max(
      ...projects.map((project) =>
        Number(project?.budget || 0)
      )
    );
  }, [projects]);

  useEffect(() => {
    if (!projects.length) {
      return;
    }

    setFilters((previousFilters) => {
      const currentMax = Number(
        previousFilters?.budgetRange?.[1] || 0
      );

      /*
       * Only initialize the maximum budget when it has
       * not already been initialized.
       */
      if (currentMax > 0) {
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
  }, [projects, maxBudgetAvailable]);

  // --------------------------------------------------
  // FILTERED PROJECTS
  // --------------------------------------------------

  const filteredProjects = useMemo(() => {
    /*
     * IMPORTANT:
     * Always create an array.
     */
    const projectList = Array.isArray(projects)
      ? projects
      : [];

    let result = [...projectList];

    // -----------------------------------------------
    // TOP STATUS FILTER
    // -----------------------------------------------

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

    // -----------------------------------------------
    // PROJECT STATUS FILTER
    // -----------------------------------------------

    if (filters.projectStatus.length > 0) {
      result = result.filter((project) =>
        filters.projectStatus.includes(
          getProjectStatus(project)
        )
      );
    }

    // -----------------------------------------------
    // MILESTONE STATUS FILTER
    // -----------------------------------------------

    if (
      Array.isArray(filters.milestoneStatus) &&
      filters.milestoneStatus.length > 0
    ) {
      result = result.filter((project) => {
        const milestones = Array.isArray(
          project?.milestones
        )
          ? project.milestones
          : [];

        return milestones.some((milestone) =>
          filters.milestoneStatus.includes(
            String(
              milestone?.status || ""
            ).toLowerCase()
          )
        );
      });
    }

    // -----------------------------------------------
    // BUDGET FILTER
    // -----------------------------------------------

    const minBudget = Number(
      filters.budgetRange?.[0] || 0
    );

    const maxBudget =
      filters.budgetRange?.[1] !== undefined &&
      filters.budgetRange?.[1] !== null
        ? Number(filters.budgetRange[1])
        : Infinity;

    /*
     * Don't accidentally hide projects while the
     * budget range is still [0, 0].
     */
    if (maxBudget > 0) {
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

    // -----------------------------------------------
    // MIN BILLED
    // -----------------------------------------------

    if (
      filters.minBilled !== "" &&
      filters.minBilled !== null &&
      filters.minBilled !== undefined
    ) {
      const minBilled = Number(
        filters.minBilled
      );

      result = result.filter(
        (project) =>
          Number(project?.billed || 0) >=
          minBilled
      );
    }

    // -----------------------------------------------
    // MAX BILLED
    // -----------------------------------------------

    if (
      filters.maxBilled !== "" &&
      filters.maxBilled !== null &&
      filters.maxBilled !== undefined
    ) {
      const maxBilled = Number(
        filters.maxBilled
      );

      result = result.filter(
        (project) =>
          Number(project?.billed || 0) <=
          maxBilled
      );
    }

    // -----------------------------------------------
    // SORT
    // -----------------------------------------------

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
    getProjectStatus,
  ]);

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const stats = useMemo(() => {
    const projectList = Array.isArray(projects)
      ? projects
      : [];

    const totalProjects = projectList.length;

    let totalMilestones = 0;
    let totalRevenue = 0;
    let overdueAmount = 0;
    let overdueCount = 0;
    let pendingMilestones = 0;

    projectList.forEach((project) => {
      const milestones = Array.isArray(
        project?.milestones
      )
        ? project.milestones
        : [];

      totalMilestones += milestones.length;

      milestones.forEach((milestone) => {
        const amount = Number(
          milestone?.amount || 0
        );

        const status = String(
          milestone?.status || ""
        ).toLowerCase();

        totalRevenue += amount;

        // Pending/scheduled
        if (
          status === "pending" ||
          status === "scheduled"
        ) {
          pendingMilestones++;
        }

        // Overdue
        if (
          milestone?.dueDate &&
          status !== "paid"
        ) {
          const dueDate = new Date(
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
        change: `${totalMilestones} milestones`,
        icon: "folder",
        iconColor: "text-teal-600",
        changeColor: "text-slate-600",
        type: "progress",
      },

      {
        title: "TOTAL REVENUE",
        value: format(totalRevenue),
        change: "From all milestones",
        icon: "payments",
        iconColor: "text-indigo-600",
        changeColor: "text-slate-500",
        type: "bars",
      },

      {
        title: "OVERDUE",
        value: format(overdueAmount),
        change: `${overdueCount} overdue milestones`,
        icon: "warning",
        iconColor: "text-rose-600",
        changeColor: "text-rose-600",
        type: "danger",
      },

      {
        title: "PENDING MILESTONES",
        value: pendingMilestones,
        change: "Awaiting payment",
        icon: "schedule",
        iconColor: "text-amber-600",
        changeColor: "text-amber-700",
        type: "bars",
      },
    ];
  }, [projects, format]);

  // --------------------------------------------------
  // SELECTED PROJECT
  // --------------------------------------------------

  useEffect(() => {
    if (!filteredProjects.length) {
      setSelectedProjectId(null);
      return;
    }

    if (!selectedProjectId) {
      setSelectedProjectId(
        filteredProjects[0]?.id || null
      );
      return;
    }

    const exists = filteredProjects.some(
      (project) =>
        project?._id === selectedProjectId
    );

    if (!exists) {
      setSelectedProjectId(
        filteredProjects[0]?.id || null
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

  if (!selectedProjectId) {
    return filteredProjects[0];
  }

  return (
    filteredProjects.find(
      (project) =>
        String(project?.id) === String(selectedProjectId)
    ) || filteredProjects[0]
  );
}, [filteredProjects, selectedProjectId]);

  // --------------------------------------------------
  // OVERDUE NOTIFICATIONS
  // --------------------------------------------------

  useEffect(() => {
    if (!Array.isArray(projects)) {
      return;
    }

    projects.forEach((project) => {
      const milestones = Array.isArray(
        project?.milestones
      )
        ? project.milestones
        : [];

      milestones.forEach((milestone) => {
        if (
          milestone?.status === "paid" ||
          !milestone?.dueDate
        ) {
          return;
        }

        const dueDate = new Date(
          milestone.dueDate
        );

        if (
          !Number.isNaN(dueDate.getTime()) &&
          dueDate < new Date()
        ) {
          notifyOverdue(
            project,
            milestone
          );
        }
      });
    });
  }, [projects, notifyOverdue]);

  // --------------------------------------------------
  // ADD MILESTONE
  // --------------------------------------------------

  const addMilestone = useCallback(() => {
    setEditingMilestone({
      title: "",
      amount: 0,
      dueDate: "",
      status: "scheduled",
    });

    setShowMilestoneModal(true);
  }, []);

  // --------------------------------------------------
  // MILESTONE STATUS UPDATE
  // --------------------------------------------------

  const updateMilestoneStatus = useCallback(
    (milestoneIndex) => {
      if (!selectedProjectId) {
        return;
      }

      setProjects((previousProjects) =>
        previousProjects.map((project) => {
          if (
            project?._id !==
            selectedProjectId
          ) {
            return project;
          }

          const milestones = Array.isArray(
            project?.milestones
          )
            ? project.milestones
            : [];

          return {
            ...project,

            milestones: milestones.map(
              (milestone, index) => {
                if (
                  index !== milestoneIndex
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
                  nextStatus === "paid" &&
                  currentStatus !== "paid"
                ) {
                  notifyMilestonePaid(
                    project,
                    milestone,
                    format
                  );
                }

                return {
                  ...milestone,
                  status: nextStatus,
                };
              }
            ),
          };
        })
      );
    },
    [
      selectedProjectId,
      notifyMilestonePaid,
      format,
    ]
  );

  // --------------------------------------------------
  // SAVE MILESTONE
  // --------------------------------------------------

  const saveMilestone = useCallback(
    async () => {
      try {
        await fetchProjects();

        /*
         * No index means this is a newly created
         * milestone.
         */
        if (
          editingMilestone &&
          typeof editingMilestone.index !==
            "number"
        ) {
          if (selectedProject) {
            notifyMilestoneCreated(
              selectedProject,
              editingMilestone,
              format
            );
          }
        }

        setShowMilestoneModal(false);
        setEditingMilestone(null);
      } catch (error) {
        console.error(
          "Error saving milestone:",
          error
        );
      }
    },
    [
      fetchProjects,
      editingMilestone,
      selectedProject,
      notifyMilestoneCreated,
      format,
    ]
  );

  // --------------------------------------------------
  // STATUS COUNTS
  // --------------------------------------------------

  const statusCounts = useMemo(() => {
    const projectList = Array.isArray(projects)
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

  // --------------------------------------------------
  // TOP FILTER COUNTS
  // --------------------------------------------------

  const counts = useMemo(() => {
    const projectList = Array.isArray(projects)
      ? projects
      : [];

    return {
      all: projectList.length,

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

  // Prevent unused-variable warnings if counts are
  // consumed by another component later.
  void counts;
  void updateMilestoneStatus;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">

        {/* HEADER */}
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

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
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

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-5">

          {/* LEFT SIDE */}
          <div className="col-span-12 lg:col-span-7 space-y-4">

            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-slate-500">
                No Projects Found
              </div>
            ) : (
              filteredProjects.map(
                (project, index) => (
                  <ProjectCard
                    key={
                      project?._id ||
                      `project-${index}`
                    }
                    {...project}
                    isSelected={
                      selectedProjectId ===
                      project?._id
                    }
                    onClick={() =>
                      setSelectedProjectId(
                        project?._id
                      )
                    }
                  />
                )
              )
            )}

          </div>

          {/* RIGHT SIDE */}
          <div className="col-span-12 lg:col-span-5">

            {selectedProject && (
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

                  if (!selectedMilestone) {
                    return;
                  }

                  setEditingMilestone({
                    ...selectedMilestone,
                    index,
                  });

                  setShowMilestoneModal(
                    true
                  );
                }}
              />
            )}

          </div>
        </div>
      </div>

      {/* PROJECT DRAWER */}
      <ProjectDrawer
        isOpen={projectDrawer}
        onClose={() =>
          setProjectDrawer(false)
        }
      />

      {/* FILTER DRAWER */}
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
      />

      {/* MILESTONE MODAL */}
      {showMilestoneModal && (
        <MilestoneModal
          isOpen={showMilestoneModal}
          onClose={() => {
            setShowMilestoneModal(false);
            setEditingMilestone(null);
          }}
          milestone={editingMilestone}
          setMilestone={
            setEditingMilestone
          }
          onSave={saveMilestone}
          projectId={
            selectedProject?._id
          }
          project={selectedProject}
          milestoneIndex={
            typeof editingMilestone?.index ===
            "number"
              ? editingMilestone.index
              : undefined
          }
        />
      )}
    </main>
  );
}