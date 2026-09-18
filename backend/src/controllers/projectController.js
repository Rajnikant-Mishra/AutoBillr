const prisma = require("../../config/prisma");

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const parseDateOnly = (dateString) => {
  if (!dateString) return null;
  // Accept "YYYY-MM-DD" from the form
  const d = new Date(`${String(dateString).slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

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
   CREATE PROJECT  (supports Fixed Fee / Milestone / Hourly / Retainer)
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
      client, // clientId from frontend
      clientName,
      projectType,
      startDate,
      endDate,
      dueDate,
      description,
      currency,

      // Money
      budget,
      billed,

      // Billing
      billingMethod,
      billingRateType,
      billingRate,
      billingCycle,
      paymentMethod,
      paymentTerms,

      // Retainer / recurring
      isRecurring,
      recurringAmount,
      recurringStartDate,
      recurringEndDate,
      nextBillingDate,
      recurringStatus,

      // Automation
      autoInvoice,
      autoCharge,

      // Display / state
      color,
      icon,
      progress,
      status,

      // Nested
      milestones,
      teamMembers,
      members,
    } = req.body;

    /* ---------- Basics validation ---------- */
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

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Invalid project dates",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    /* ---------- Client ownership ---------- */
    const existingClient = await prisma.client.findFirst({
      where: { id: client, companyId },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const method = billingMethod || "Fixed Fee";
    const isRetainer = method === "Retainer";
    const isMilestone = method === "Milestone";
    const isHourly = method === "Hourly";
    const isFixedFee = method === "Fixed Fee";

    /* ---------- Money by billing method ---------- */
    let projectBudget = null;
    let projectBillingRate = null;
    let projectRecurringAmount = null;

    if (isRetainer) {
      projectRecurringAmount = toNumber(recurringAmount);
      if (
        projectRecurringAmount === null ||
        projectRecurringAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Retainer amount must be greater than 0",
        });
      }

      if (!billingCycle) {
        return res.status(400).json({
          success: false,
          message: "Billing cycle is required for retainer",
        });
      }

      if (!recurringStartDate) {
        return res.status(400).json({
          success: false,
          message: "Retainer start date is required",
        });
      }

      const recStart = parseDateOnly(recurringStartDate);
      if (!recStart) {
        return res.status(400).json({
          success: false,
          message: "Invalid retainer start date",
        });
      }

      if (recStart < start) {
        return res.status(400).json({
          success: false,
          message:
            "Retainer start date cannot be before project start date",
        });
      }

      if (recurringEndDate) {
        const recEnd = parseDateOnly(recurringEndDate);
        if (recEnd && end && recEnd > end) {
          return res.status(400).json({
            success: false,
            message:
              "Retainer end date cannot be after project end date",
          });
        }
        if (recEnd && recEnd < recStart) {
          return res.status(400).json({
            success: false,
            message:
              "Retainer end date cannot be before retainer start date",
          });
        }
      }
    } else {
      // Fixed Fee / Milestone / Hourly all require budget
      projectBudget = toNumber(budget);
      if (projectBudget === null || projectBudget <= 0) {
        return res.status(400).json({
          success: false,
          message: "Project budget / amount must be greater than 0",
        });
      }
    }

    if (isHourly) {
      projectBillingRate = toNumber(billingRate);
      if (
        projectBillingRate === null ||
        projectBillingRate <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Hourly rate must be greater than 0",
        });
      }
      if (!billingCycle) {
        return res.status(400).json({
          success: false,
          message: "Billing cycle is required for hourly billing",
        });
      }
    }

    /* ---------- Milestones (only for Milestone method) ---------- */
    let normalizedMilestones = [];

    if (isMilestone) {
      const projectMilestones = Array.isArray(milestones)
        ? milestones
        : [];

      if (projectMilestones.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Add at least one milestone",
        });
      }

      let milestoneTotal = 0;

      normalizedMilestones = projectMilestones.map((m, index) => {
        const amount = toNumber(m?.amount);

        if (!m?.title?.trim()) {
          throw new Error(`Milestone ${index + 1} title is required`);
        }
        if (!m?.dueDate) {
          throw new Error(
            `Milestone ${index + 1} due date is required`
          );
        }
        if (amount === null || amount <= 0) {
          throw new Error(
            `Milestone ${index + 1} amount must be greater than 0`
          );
        }

        const due = parseDateOnly(m.dueDate);
        if (!due) {
          throw new Error(
            `Milestone ${index + 1} has an invalid due date`
          );
        }
        if (due < start || due > end) {
          throw new Error(
            `Milestone ${index + 1} due date must be within project dates`
          );
        }

        milestoneTotal += amount;

        return {
          title: m.title.trim(),
          dueDate: due,
          amount,
          status: String(m?.status || "scheduled").toLowerCase(),
        };
      });

      if (milestoneTotal > projectBudget) {
        return res.status(400).json({
          success: false,
          message:
            "Total milestone amount cannot exceed project budget",
        });
      }
    }

    /* ---------- Build create data ---------- */
    const createData = {
      companyId,
      clientId: existingClient.id,

      title: title.trim(),
      clientName:
        (clientName && String(clientName).trim()) ||
        existingClient.name,
      projectType: projectType || method || "Fixed Fee",
      description:
        description != null ? String(description).trim() || null : null,

      startDate: start,
      endDate: end,
      dueDate: parseDateOnly(dueDate) || end,

      currency: currency || "INR",

      // Money – budget is null for retainer
      budget: projectBudget,
      billed: toNumber(billed) ?? 0,

      // Billing
      billingMethod: method,
      billingRateType:
        billingRateType ||
        (isRetainer ? "RECURRING" : "FIXED"),
      billingRate: projectBillingRate,
      billingCycle:
        isHourly || isRetainer ? billingCycle || null : null,
      paymentMethod: paymentMethod || null,
      paymentTerms: paymentTerms || "NET_30",

      // Recurring / retainer
      isRecurring: Boolean(isRecurring) || isRetainer,
      recurringAmount: projectRecurringAmount,
      recurringStartDate: isRetainer
        ? parseDateOnly(recurringStartDate)
        : null,
      recurringEndDate: isRetainer
        ? parseDateOnly(recurringEndDate)
        : null,
      nextBillingDate: isRetainer
        ? parseDateOnly(nextBillingDate)
        : null,
      recurringStatus: isRetainer
        ? recurringStatus || "ACTIVE"
        : null,

      // Automation
      autoInvoice:
        autoInvoice !== undefined ? Boolean(autoInvoice) : true,
      autoCharge: isRetainer ? Boolean(autoCharge) : false,

      // Display / state
      color: color || "bg-primary",
      icon: icon || "folder",
      progress: toNumber(progress) ?? 0,
      status: status || "ACTIVE",

      // Team (stored as Json of names for now)
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      members:
        toNumber(members) ??
        (Array.isArray(teamMembers) ? teamMembers.length : 0),
    };

    // Nested milestones only when method is Milestone
    if (isMilestone && normalizedMilestones.length > 0) {
      createData.milestones = {
        create: normalizedMilestones,
      };
    }

    const project = await prisma.project.create({
      data: createData,
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
      dueDate,
      description,
      currency,
      budget,
      billingMethod,
      billingRateType,
      billingRate,
      billingCycle,
      paymentMethod,
      paymentTerms,
      isRecurring,
      recurringAmount,
      recurringStartDate,
      recurringEndDate,
      nextBillingDate,
      recurringStatus,
      autoInvoice,
      autoCharge,
      color,
      icon,
      teamMembers,
      members,
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

    const data = {
      ...(title !== undefined && { title: String(title).trim() }),
      ...(clientId !== undefined && { clientId }),
      ...(clientName !== undefined && {
        clientName: clientName ? String(clientName).trim() : null,
      }),
      ...(projectType !== undefined && { projectType }),
      ...(startDate !== undefined && {
        startDate: parseDateOnly(startDate),
      }),
      ...(endDate !== undefined && {
        endDate: parseDateOnly(endDate),
      }),
      ...(dueDate !== undefined && {
        dueDate: parseDateOnly(dueDate),
      }),
      ...(description !== undefined && {
        description: description
          ? String(description).trim()
          : null,
      }),
      ...(currency !== undefined && { currency }),
      ...(budget !== undefined && { budget: toNumber(budget) }),
      ...(billingMethod !== undefined && { billingMethod }),
      ...(billingRateType !== undefined && { billingRateType }),
      ...(billingRate !== undefined && {
        billingRate: toNumber(billingRate),
      }),
      ...(billingCycle !== undefined && { billingCycle }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(paymentTerms !== undefined && { paymentTerms }),
      ...(isRecurring !== undefined && {
        isRecurring: Boolean(isRecurring),
      }),
      ...(recurringAmount !== undefined && {
        recurringAmount: toNumber(recurringAmount),
      }),
      ...(recurringStartDate !== undefined && {
        recurringStartDate: parseDateOnly(recurringStartDate),
      }),
      ...(recurringEndDate !== undefined && {
        recurringEndDate: parseDateOnly(recurringEndDate),
      }),
      ...(nextBillingDate !== undefined && {
        nextBillingDate: parseDateOnly(nextBillingDate),
      }),
      ...(recurringStatus !== undefined && { recurringStatus }),
      ...(autoInvoice !== undefined && {
        autoInvoice: Boolean(autoInvoice),
      }),
      ...(autoCharge !== undefined && {
        autoCharge: Boolean(autoCharge),
      }),
      ...(color !== undefined && { color }),
      ...(icon !== undefined && { icon }),
      ...(teamMembers !== undefined && {
        teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
        members: Array.isArray(teamMembers)
          ? teamMembers.length
          : 0,
      }),
      ...(members !== undefined && { members: toNumber(members) }),
      ...(progress !== undefined && {
        progress: toNumber(progress) ?? 0,
      }),
      ...(status !== undefined && { status }),
    };

    const project = await prisma.project.update({
      where: { id },
      data,
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

    // Only Milestone projects should have milestones
    if (project.billingMethod && project.billingMethod !== "Milestone") {
      return res.status(400).json({
        success: false,
        message: "Milestones are only allowed for Milestone billing projects",
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

    const milestoneAmount = toNumber(amount);
    if (milestoneAmount === null || milestoneAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const existingMilestones = await prisma.milestone.findMany({
      where: { projectId },
    });

    const existingTotal = existingMilestones.reduce(
      (total, m) => total + Number(m.amount || 0),
      0
    );

    const budget = Number(project.budget || 0);
    if (budget > 0 && existingTotal + milestoneAmount > budget) {
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
        dueDate: parseDateOnly(dueDate),
        status: String(status || "scheduled").toLowerCase(),
      },
    });

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
   UPDATE MILESTONE
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
      milestoneAmount = toNumber(amount);
      if (milestoneAmount === null || milestoneAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }
    }

    if (milestoneAmount !== undefined) {
      const otherTotal = project.milestones
        .filter((m) => m.id !== milestoneId)
        .reduce((sum, m) => sum + Number(m.amount || 0), 0);

      const budget = Number(project.budget || 0);
      if (budget > 0 && otherTotal + milestoneAmount > budget) {
        return res.status(400).json({
          success: false,
          message:
            "Total milestone amount cannot exceed project budget",
        });
      }
    }

    const oldStatus = String(existingMilestone.status || "").toLowerCase();
    const newStatus =
      status !== undefined ? String(status).toLowerCase() : oldStatus;

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(milestoneAmount !== undefined && { amount: milestoneAmount }),
        ...(dueDate !== undefined && {
          dueDate: parseDateOnly(dueDate),
        }),
        ...(status !== undefined && { status: newStatus }),
        ...(newStatus === "paid" && oldStatus !== "paid"
          ? { paidAt: new Date() }
          : {}),
        ...(oldStatus === "paid" && newStatus !== "paid"
          ? { paidAt: null }
          : {}),
      },
    });

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