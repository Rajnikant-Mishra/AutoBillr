const prisma = require("../../config/prisma");

/* =========================================================
   HELPER – recalculate billed + progress
========================================================= */
const recalculateProjectBilling = async (projectId) => {
  const milestones = await prisma.milestone.findMany({
    where: { projectId },
  });

  const billed = milestones
    .filter((m) => String(m.status).toLowerCase() === "paid")
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);

  const progress =
    milestones.length === 0
      ? 0
      : Math.round(
          (milestones.filter(
            (m) => String(m.status).toLowerCase() === "paid"
          ).length /
            milestones.length) *
            100
        );

  await prisma.project.update({
    where: { id: projectId },
    data: { billed, progress },
  });

  return { billed, progress };
};

/* =========================================================
   GET ALL PROJECTS
========================================================= */
const getProjects = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const projects = await prisma.project.findMany({
      where: { companyId },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* =========================================================
   GET PROJECT BY ID
========================================================= */
const getProjectById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project = await prisma.project.findFirst({
      where: { id, companyId },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("GET PROJECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};

/* =========================================================
   CREATE PROJECT
========================================================= */
const createProject = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const {
      title,
      client,
      clientName,
      projectType,
      startDate,
      endDate,
      description,
      budget,
      billingMethod,
      autoInvoice,
      color,
      milestones,
      teamMembers,
    } = req.body;

    // Validation
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Client is required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Project dates are required",
      });
    }

    const projectBudget = Number(budget);
    if (!Number.isFinite(projectBudget) || projectBudget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Budget must be greater than 0",
      });
    }

    // Verify client belongs to company
    const existingClient = await prisma.client.findFirst({
      where: { id: client, companyId },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Validate milestones
    const projectMilestones = Array.isArray(milestones) ? milestones : [];
    let milestoneTotal = 0;

    const normalizedMilestones = projectMilestones.map((milestone, index) => {
      const amount = Number(milestone?.amount);

      if (!milestone?.title?.trim()) {
        throw new Error(`Milestone ${index + 1} title is required`);
      }
      if (!milestone?.dueDate) {
        throw new Error(`Milestone ${index + 1} due date is required`);
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(
          `Milestone ${index + 1} amount must be greater than 0`
        );
      }

      milestoneTotal += amount;

      return {
        title: milestone.title.trim(),
        dueDate: new Date(`${milestone.dueDate}T00:00:00`),
        amount,
        status: String(milestone?.status || "scheduled").toLowerCase(),
      };
    });

    if (milestoneTotal > projectBudget) {
      return res.status(400).json({
        success: false,
        message: "Total milestone amount cannot exceed project budget",
      });
    }

    // Create project + milestones
    const project = await prisma.project.create({
      data: {
        companyId,
        clientId: existingClient.id,
        title: title.trim(),
        clientName: clientName?.trim() || existingClient.name,
        projectType: projectType || "Fixed Fee",
        startDate: new Date(`${startDate}T00:00:00`),
        endDate: new Date(`${endDate}T00:00:00`),
        description: description?.trim() || null,
        budget: projectBudget,
        billed: 0,
        billingMethod: billingMethod || "Milestone",
        autoInvoice: Boolean(autoInvoice),
        color: color || "bg-primary",
        progress: 0,
        status: "ACTIVE",
        icon: "folder",
        teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
        members: Array.isArray(teamMembers) ? teamMembers.length : 0,
        milestones: {
          create: normalizedMilestones,
        },
      },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create project",
    });
  }
};

/* =========================================================
   UPDATE PROJECT
========================================================= */
const updateProject = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const existingProject = await prisma.project.findFirst({
      where: { id, companyId },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const {
      title,
      client,
      clientName,
      projectType,
      startDate,
      endDate,
      description,
      budget,
      billingMethod,
      autoInvoice,
      color,
      teamMembers,
      progress,
      status,
    } = req.body;

    let clientId;
    if (client !== undefined) {
      const existingClient = await prisma.client.findFirst({
        where: { id: client, companyId },
      });
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Client not found",
        });
      }
      clientId = existingClient.id;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(clientId !== undefined && { clientId }),
        ...(clientName !== undefined && {
          clientName: clientName?.trim() || null,
        }),
        ...(projectType !== undefined && { projectType }),
        ...(startDate !== undefined && {
          startDate: new Date(`${startDate}T00:00:00`),
        }),
        ...(endDate !== undefined && {
          endDate: new Date(`${endDate}T00:00:00`),
        }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(budget !== undefined && { budget: Number(budget) }),
        ...(billingMethod !== undefined && { billingMethod }),
        ...(autoInvoice !== undefined && {
          autoInvoice: Boolean(autoInvoice),
        }),
        ...(color !== undefined && { color }),
        ...(teamMembers !== undefined && {
          teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
          members: Array.isArray(teamMembers) ? teamMembers.length : 0,
        }),
        ...(progress !== undefined && { progress: Number(progress) }),
        ...(status !== undefined && { status }),
      },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

/* =========================================================
   DELETE PROJECT
========================================================= */
const deleteProject = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project = await prisma.project.findFirst({
      where: { id, companyId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};

/* =========================================================
   CREATE MILESTONE
========================================================= */
const createMilestone = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { projectId } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const { title, amount, dueDate, status } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Milestone name is required",
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: "Due date is required",
      });
    }

    const milestoneAmount = Number(amount);
    if (!Number.isFinite(milestoneAmount) || milestoneAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Budget check
    const existingMilestones = await prisma.milestone.findMany({
      where: { projectId },
    });

    const existingTotal = existingMilestones.reduce(
      (total, m) => total + Number(m.amount || 0),
      0
    );

    if (existingTotal + milestoneAmount > Number(project.budget || 0)) {
      return res.status(400).json({
        success: false,
        message: "Total milestone amount cannot exceed project budget",
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        title: title.trim(),
        amount: milestoneAmount,
        dueDate: new Date(`${dueDate}T00:00:00`),
        status: String(status || "scheduled").toLowerCase(),
      },
    });

    // Recalculate progress (billed only changes on paid)
    const { progress } = await recalculateProjectBilling(projectId);

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      milestone,
      projectProgress: progress,
    });
  } catch (error) {
    console.error("CREATE MILESTONE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create milestone",
    });
  }
};

/* =========================================================
   UPDATE MILESTONE  (PRODUCTION – updates billed + progress)
========================================================= */
const updateMilestone = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { projectId, milestoneId } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
      include: { milestones: true },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const existingMilestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
    });

    if (!existingMilestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    const { title, amount, dueDate, status } = req.body;

    // Validation
    if (title !== undefined && !title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Milestone name is required",
      });
    }

    if (dueDate !== undefined && !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Due date is required",
      });
    }

    let milestoneAmount;
    if (amount !== undefined) {
      milestoneAmount = Number(amount);
      if (!Number.isFinite(milestoneAmount) || milestoneAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }
    }

    // Budget check when amount changes
    if (milestoneAmount !== undefined) {
      const otherTotal = project.milestones
        .filter((m) => m.id !== milestoneId)
        .reduce((sum, m) => sum + Number(m.amount || 0), 0);

      if (otherTotal + milestoneAmount > Number(project.budget || 0)) {
        return res.status(400).json({
          success: false,
          message: "Total milestone amount cannot exceed project budget",
        });
      }
    }

    const oldStatus = String(existingMilestone.status || "").toLowerCase();
    const newStatus =
      status !== undefined ? String(status).toLowerCase() : oldStatus;

    // Update the milestone
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(milestoneAmount !== undefined && { amount: milestoneAmount }),
        ...(dueDate !== undefined && {
          dueDate: new Date(`${dueDate}T00:00:00`),
        }),
        ...(status !== undefined && { status: newStatus }),
        // Set paidAt when becoming paid
        ...(newStatus === "paid" && oldStatus !== "paid"
          ? { paidAt: new Date() }
          : {}),
        // Clear paidAt if moved away from paid
        ...(oldStatus === "paid" && newStatus !== "paid"
          ? { paidAt: null }
          : {}),
      },
    });

    // =====================================================
    // PRODUCTION: Recalculate project.billed + progress
    // =====================================================
    const { billed, progress } = await recalculateProjectBilling(projectId);

    return res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      milestone,
      projectBilled: billed,
      projectProgress: progress,
    });
  } catch (error) {
    console.error("UPDATE MILESTONE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update milestone",
    });
  }
};

/* =========================================================
   DELETE MILESTONE
========================================================= */
const deleteMilestone = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { projectId, milestoneId } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const milestone = await prisma.milestone.findFirst({
      where: { id: milestoneId, projectId },
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    // Recalculate billed + progress after delete
    const { billed, progress } = await recalculateProjectBilling(projectId);

    return res.status(200).json({
      success: true,
      message: "Milestone deleted successfully",
      projectBilled: billed,
      projectProgress: progress,
    });
  } catch (error) {
    console.error("DELETE MILESTONE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete milestone",
    });
  }
};

/* =========================================================
   EXPORT
========================================================= */
module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createMilestone,
  updateMilestone,
  deleteMilestone,
};