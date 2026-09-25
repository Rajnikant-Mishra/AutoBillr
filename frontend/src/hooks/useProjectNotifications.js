import { useNotificationStore } from "../store/notificationStore";

export default function useProjectNotifications() {
  const { addNotification } = useNotificationStore();

  const safeFormat = (val, format) => {
    if (typeof format === "function") return format(val);
    return val ? `$${val}` : "$0";
  };


  const notifyProjectCreated = (project, format) => {
    if (!project) return;

    addNotification({
      type: "project",
      icon: "folder",
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-l-teal-500",
      title: `New Project Created: ${project.title}`,
      description: `Client: ${project.client?.name || "N/A"}\nProject: ${project.title}\nBudget: ${safeFormat(project.budget, format)}\nMilestones: ${project.milestones?.length || 0}`,
      clientId: project.client?._id || project.client?.id,
      clientName: project.client?.name,
      projectId: project._id || project.id,
      projectName: project.title,
    });
  };


  const notifyMilestoneCreated = (project, milestone, format) => {
    if (!project || !milestone) return;

    addNotification({
      type: "milestone",
      icon: "flag",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-l-amber-500",
      title: `${milestone.title} created`,
      description: `Project : ${project.title}\nClient : ${project.client?.name || "N/A"}\nAmount : ${safeFormat(milestone.amount, format)}`,
      clientId: project.client?._id || project.client?.id,
      clientName: project.client?.name,
      projectId: project._id || project.id,
      projectName: project.title,
      milestoneId: milestone._id || milestone.id,
      milestoneTitle: milestone.title,
      amount: milestone.amount,
      dueDate: milestone.dueDate,
      createdAt: new Date(),
    });
  };


  const notifyMilestonePaid = (project, milestone, format) => {
    if (!project || !milestone) return;

    addNotification({
      type: "payment",
      icon: "payments",
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      title: `${milestone.title} marked Paid`,
      description: `Project : ${project.title}\nClient : ${project.client?.name || "N/A"}\nAmount : ${safeFormat(milestone.amount, format)}`,
      clientId: project.client?._id || project.client?.id,
      clientName: project.client?.name,
      projectId: project._id || project.id,
      projectName: project.title,
      milestoneId: milestone._id || milestone.id,
      milestoneTitle: milestone.title,
      amount: milestone.amount,
      createdAt: new Date(),
    });
  };


  const notifyOverdue = (project, milestone) => {
    if (!project || !milestone) return;

    const milestoneId = String(milestone._id || milestone.id || milestone.title);
    const lockKey = `autobillr_overdue_notified_${milestoneId}`;

    if (sessionStorage.getItem(lockKey)) {
      return;
    }

    const currentNotifications = useNotificationStore.getState().notifications || [];
    const alreadyExists = currentNotifications.some(
      (n) =>
        n.type === "overdue" &&
        (n.milestoneId === milestoneId || n.title?.includes(milestone.title))
    );

    if (alreadyExists) {
      sessionStorage.setItem(lockKey, "true");
      return;
    }

    sessionStorage.setItem(lockKey, "true");

    addNotification({
      type: "overdue",
      icon: "warning",
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      title: `${milestone.title} is overdue`,
      description: `Project : ${project.title}\nClient : ${project.client?.name || "N/A"}\nDue : ${milestone.dueDate}`,
      clientId: project.client?._id || project.client?.id,
      clientName: project.client?.name,
      projectId: project._id || project.id,
      projectName: project.title,
      milestoneId: milestoneId,
      milestoneTitle: milestone.title,
      dueDate: milestone.dueDate,
      createdAt: new Date(),
    });
  };

  return {
    notifyProjectCreated,
    notifyMilestoneCreated,
    notifyMilestonePaid,
    notifyOverdue,
  };
}