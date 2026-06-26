import React, { useState, useEffect } from "react";
import ProjectCard from "../../components/projects/ProjectCard";
import ProjectDetailPanel from "../../components/projects/ProjectDetailPanel";
import { useNotificationStore } from "../../store/notificationStore";
import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../../src/components/ui/StatCard";
import ProjectDrawer from "../../components/projects/ProjectDrawer";
import ProjectFilterDrawer from "../../components/projects/ProjectFilterDrawer";
import MilestoneModal from "../../components/projects/MilestoneModal";
import useCurrency from "../../hooks/useCurrency";
export default function Projects() {
const { format } = useCurrency();
const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(null);
const [milestone, setMilestone] = useState(null);
 const [projects, setProjects] = useState([]);
 const [activeFilter, setActiveFilter] =
  useState("all");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
const { addNotification } = useNotificationStore();
const [filters, setFilters] = useState({
  projectStatus: [],
  milestoneStatus: [],
  budgetRange: [0, 0],
  minBilled: "",
  maxBilled: "",
  sortBy: "newest",
});
useEffect(() => {
  if (projects.length > 0) {
    const maxBudget = Math.max(
      ...projects.map((p) => Number(p.budget || 0))
    );

    setFilters((prev) => ({
      ...prev,
      budgetRange: [0, maxBudget],
    }));
  }
}, [projects]);
 const getProjectStatus = (project) => {
  const milestones = project.milestones || [];

  // Budget exceeded
  if (Number(project.billed || 0) > Number(project.budget || 0)) {
    return "risk";
  }

  // No milestone yet
  if (milestones.length === 0) {
    return "active";
  }

  // All milestones paid
  if (
    milestones.every(
      (m) => m.status?.toLowerCase() === "paid"
    )
  ) {
    return "paid";
  }

  // Any pending/scheduled milestone
  if (
    milestones.some((m) =>
      ["pending", "scheduled"].includes(
        m.status?.toLowerCase()
      )
    )
  ) {
    return "pending";
  }

  return "active";
};
const filteredProjects = React.useMemo(() => {
  let result = [...projects];

  // Top Filter Buttons
 if (
  activeFilter !== "all" &&
  filters.projectStatus.length === 0
) {
  result = result.filter(
    (project) =>
      getProjectStatus(project) === activeFilter
  );
}

  // Drawer Project Status Filter
  if (filters.projectStatus.length > 0) {
    result = result.filter((project) =>
      filters.projectStatus.includes(
        getProjectStatus(project)
      )
    );
  }

  // Budget Range Filter
  result = result.filter((project) => {
    const budget = Number(project.budget || 0);

    return (
      budget >= filters.budgetRange[0] &&
      budget <= filters.budgetRange[1]
    );
  });

  // Min Billed
  if (filters.minBilled) {
    result = result.filter(
      (project) =>
        Number(project.billed || 0) >=
        Number(filters.minBilled)
    );
  }

  // Max Billed
  if (filters.maxBilled) {
    result = result.filter(
      (project) =>
        Number(project.billed || 0) <=
        Number(filters.maxBilled)
    );
  }

  // Sorting
  switch (filters.sortBy) {
    case "budgetHigh":
      result.sort(
        (a, b) =>
          Number(b.budget || 0) -
          Number(a.budget || 0)
      );
      break;

    case "budgetLow":
      result.sort(
        (a, b) =>
          Number(a.budget || 0) -
          Number(b.budget || 0)
      );
      break;

    case "newest":
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
      break;

    case "oldest":
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
      );
      break;

    default:
      break;
  }

  return result;
}, [projects, activeFilter, filters]);
const stats = React.useMemo(() => {
  const totalProjects = projects.length;

  let totalMilestones = 0;
  let totalRevenue = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let pendingMilestones = 0; // ✅ ADD THIS

  projects.forEach((project) => {
    const milestones = project.milestones || [];

    totalMilestones += milestones.length;

    milestones.forEach((m) => {
      totalRevenue += Number(m.amount || 0);

      // Count pending milestones
      if (
        m.status === "pending" ||
        m.status === "scheduled"
      ) {
        pendingMilestones++;
      }

      const due = new Date(m.dueDate);
      const today = new Date();

      if (m.status !== "paid" && due < today) {
        overdueAmount += Number(m.amount || 0);
        overdueCount += 1;
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
}, [projects]);

  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);

 const selectedProject =
  projects[selectedProjectIndex] || null;
  const [projectDrawer, setProjectDrawer] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

 const addMilestone = () => {
  setEditingMilestone({
    title: "",
    amount: 0,
    dueDate: "",
    status: "scheduled",
  });

  setShowMilestoneModal(true);
};
useEffect(() => {
  fetchProjects();
}, []);
useEffect(() => {
    const handleProjectCreated = (e) => {
      fetchProjects();
      
      // Add Notification
      if (e.detail?.project) {
        addNotification({
          type: "project",
          icon: "assignment",
          iconColor: "text-teal-600",
          bgColor: "bg-teal-50",
          title: `New Project Created: ${e.detail.project.name || "Untitled"}`,
          description: `${e.detail.project.milestones?.length || 0} milestones added`,
          borderColor: "border-l-teal-500",
        });
      } else {
        addNotification({
          type: "project",
          icon: "assignment",
          iconColor: "text-teal-600",
          bgColor: "bg-teal-50",
          title: "New Project Created",
          description: "Project has been successfully added",
          borderColor: "border-l-teal-500",
        });
      }
    };

    window.addEventListener("project-created", handleProjectCreated);
    return () => window.removeEventListener("project-created", handleProjectCreated);
  }, [addNotification]);
  useEffect(() => {
    const checkOverdue = () => {
      projects.forEach((project) => {
        const milestones = project.milestones || [];
        milestones.forEach((milestone, idx) => {
          if (milestone.status !== "paid") {
            const due = new Date(milestone.dueDate);
            const today = new Date();
            
            if (due < today) {
              addNotification({
                type: "overdue",
                icon: "warning",
                iconColor: "text-rose-600",
                bgColor: "bg-rose-50",
                title: `Overdue Milestone: ${milestone.title}`,
                description: `${project.name} • ${format(Number(milestone.amount || 0))}`,
                borderColor: "border-l-rose-500",
                time: "Overdue",
              });
            }
          }
        });
      });
    };

    if (projects.length > 0) {
      checkOverdue();
    }
  }, [projects, addNotification]);

const fetchProjects = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/projects");
    const text = await response.text();
  

    const data = JSON.parse(text);
   

    setProjects(data.projects || data || []);
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

const updateMilestoneStatus = (milestoneIndex) => {
  const statuses = [
    "scheduled",
    "pending",
    "paid",
  ];

  setProjects((prevProjects) =>
    prevProjects.map((project, projectIndex) => {
      if (projectIndex !== selectedProjectIndex) {
        return project;
      }

      return {
        ...project,
        milestones: project.milestones.map(
          (milestone, index) => {
            if (index !== milestoneIndex) {
              return milestone;
            }

            const currentIndex = statuses.indexOf(
              milestone.status
            );

            const nextStatus =
              statuses[
              (currentIndex + 1) %
              statuses.length
              ];
addNotification({
              type: "milestone",
              icon: "schedule",
              iconColor: "text-amber-600",
              bgColor: "bg-amber-50",
              title: `Milestone Status Changed`,
              description: `${milestone.title} → ${nextStatus.toUpperCase()}`,
              borderColor: "border-l-amber-500",
            });
            return {
              ...milestone,
              status: nextStatus,
            };
          }
        ),
      };
    })
  );
};

const counts = {
  all: filteredProjects.length,
  active: filteredProjects.filter(
    (p) => getProjectStatus(p) === "active"
  ).length,
  pending: filteredProjects.filter(
    (p) => getProjectStatus(p) === "pending"
  ).length,
  paid: filteredProjects.filter(
    (p) => getProjectStatus(p) === "paid"
  ).length,
  risk: filteredProjects.filter(
    (p) => getProjectStatus(p) === "risk"
  ).length,
};
const saveMilestone = async () => {
  try {
    await fetchProjects();   
    addNotification({
        type: "automation",
        icon: "bolt",
        iconColor: "text-indigo-600",
        bgColor: "bg-indigo-50",
        title: "Milestone Updated",
        description: `${editingMilestone?.title} has been saved successfully`,
        borderColor: "border-l-indigo-500",
      });     // Refresh from backend
    setShowMilestoneModal(false);
    setEditingMilestone(null);
    showSuccessToast(
  isEditing
    ? "Milestone updated successfully"
    : "Milestone created successfully"
);
  } catch (error) {
    console.error("Refresh failed:", error);
    showErrorToast("Milestone saved, but list refresh failed");
  }
};

const maxBudgetAvailable = React.useMemo(() => {
  return projects.length
    ? Math.max(
        ...projects.map((p) => Number(p.budget || 0))
      )
    : 0;
}, [projects]);
const statusCounts = {
  active: projects.filter(
    (p) => getProjectStatus(p) === "active"
  ).length,

  pending: projects.filter(
    (p) => getProjectStatus(p) === "pending"
  ).length,

  paid: projects.filter(
    (p) => getProjectStatus(p) === "paid"
  ).length,

  risk: projects.filter(
    (p) => getProjectStatus(p) === "risk"
  ).length,
};
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
    onClick: () => setShowFilterDrawer(true),
  }}
  primaryAction={{
    label: "New Project",
    icon: "add",
    onClick: () => setProjectDrawer(true),
  }}
/>

      {/* ✅ ADD THIS STATS SECTION (MISSING IN YOUR CODE) */}
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
        {stats.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={item.icon}
            iconColor={item.iconColor}
            changeColor={item.changeColor}
            variant="dashboard"
            showProgress={item.type === "progress"}
            progressValue={
  item.title === "ACTIVE PROJECTS"
    ? Math.min(projects.length * 10, 100)
    : item.type === "progress"
    ? 70
    : 0
} // Adjust as needed
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
  filteredProjects.map((project, index) => (
    <ProjectCard
      key={project._id || index}
      {...project}
      isSelected={selectedProjectIndex === index}
      onClick={() => setSelectedProjectIndex(index)}
    />
  ))
)}

        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-12 lg:col-span-5">
        {selectedProject && (
  <ProjectDetailPanel
    project={selectedProject}
    onAddMilestone={addMilestone}
    onMilestoneClick={(index) => {
  setEditingMilestone({
    ...selectedProject.milestones[index],
    index,                    // Keep this
  });
  setShowMilestoneModal(true);
}}
  />
)}
        </div>

      </div>
    </div>
    <ProjectDrawer
  isOpen={projectDrawer}
  onClose={() => setProjectDrawer(false)}
/>
 <ProjectFilterDrawer
  isOpen={showFilterDrawer}
  onClose={() => setShowFilterDrawer(false)}
  filters={filters}
  setFilters={setFilters}
  minBudgetAvailable={0}
 maxBudgetAvailable={maxBudgetAvailable}
 statusCounts={statusCounts}
/>

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
    projectId={selectedProject?._id}
     project={selectedProject}
     milestoneIndex={
    typeof editingMilestone?.index === "number"
      ? editingMilestone.index
      : undefined
  }
  />
)}
  </main>
);

};
