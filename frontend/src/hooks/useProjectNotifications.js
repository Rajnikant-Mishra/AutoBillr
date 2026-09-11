import { useNotificationStore } from "../store/notificationStore";

export default function useProjectNotifications() {

    const { addNotification } = useNotificationStore();

   const notifyProjectCreated = (project, format) => {
    console.log("Project received:", project);
  addNotification({
    type: "project",
    icon: "folder",
    iconColor: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-l-teal-500",

    title: `New Project Created: ${project.title}`,

    description: `Client: ${project.client?.name}
Project: ${project.title}
Budget: ${format(project.budget)}
Milestones: ${project.milestones?.length || 0}`,

   clientId: project.client?._id,
clientName: project.client?.name,
    projectId: project._id,
    projectName: project.title,

  
  });
};

    const notifyMilestoneCreated = (project, milestone, format) => {

        addNotification({

            type: "milestone",

            icon: "flag",

            iconColor: "text-amber-600",

            bgColor: "bg-amber-50",

            borderColor: "border-l-amber-500",

            title: `${milestone.title} created`,

            description: `Project : ${project.title}
Client : ${project.client?.name}
Amount : ${format(milestone.amount)}`,

            clientId: project.client?._id,

            clientName: project.client?.name,

            projectId: project._id,

            projectName: project.title,

            milestoneId: milestone._id,

            milestoneTitle: milestone.title,

            amount: milestone.amount,

            dueDate: milestone.dueDate,

            createdAt: new Date(),
        });

    };

    const notifyMilestonePaid = (project, milestone, format) => {

        addNotification({

            type: "payment",

            icon: "payments",

            iconColor: "text-green-600",

            bgColor: "bg-green-50",

            title: `${milestone.title} marked Paid`,

            description: `Project : ${project.title}
Client : ${project.client?.name}
Amount : ${format(milestone.amount)}`,

            clientId: project.client?._id,

            clientName: project.client?.name,

            projectId: project._id,

            projectName: project.title,

            milestoneId: milestone._id,

            milestoneTitle: milestone.title,

            amount: milestone.amount,

            createdAt: new Date(),
        });

    };

    const notifyOverdue = (project, milestone) => {

        addNotification({

            type: "overdue",

            icon: "warning",

            iconColor: "text-red-600",

            bgColor: "bg-red-50",

            title: `${milestone.title} is overdue`,

            description: `Project : ${project.title}
Client : ${project.client?.name}
Due : ${milestone.dueDate}`,

            clientId: project.client?._id,

            clientName: project.client?.name,

            projectId: project._id,

            projectName: project.title,

            milestoneId: milestone._id,

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