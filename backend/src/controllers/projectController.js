const prisma = require("../../config/prisma");

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const toPositiveNumber = (value) => {
  const number = toNumber(value);

  return number !== null && number > 0 ? number : null;
};

const parseDateOnly = (value) => {
  if (!value) return null;

  const dateString = String(value).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const date = new Date(`${dateString}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeBillingMethod = (value) => {
  if (!value) return "FIXED_FEE";

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const aliases = {
    FIXED: "FIXED_FEE",
    FIXED_FEE: "FIXED_FEE",
    "FIXED FEE": "FIXED_FEE",

    MILESTONE: "MILESTONE",

    HOURLY: "HOURLY",

    RETAINER: "RETAINER",
  };

  return aliases[normalized] || null;
};

const normalizeBillingRateType = (value, billingMethod) => {
  if (value) {
    const normalized = String(value)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    if (["FIXED", "RECURRING"].includes(normalized)) {
      return normalized;
    }
  }

  return billingMethod === "RETAINER" ? "RECURRING" : "FIXED";
};

const normalizeBillingCycle = (value) => {
  if (!value) return null;

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const allowed = [
    "MONTHLY",
    "FORTNIGHTLY",
    "QUARTERLY",
    "ANNUAL",
  ];

  return allowed.includes(normalized) ? normalized : null;
};

const normalizePaymentTerms = (value) => {
  if (!value) return "NET_30";

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const allowed = [
    "DUE_ON_RECEIPT",
    "NET_15",
    "NET_30",
    "NET_60",
  ];

  return allowed.includes(normalized) ? normalized : "NET_30";
};

const normalizePaymentMethod = (value) => {
  if (!value) return null;

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const allowed = [
    "ACH",
    "CARD",
    "WIRE",
    "CHECK",
  ];

  return allowed.includes(normalized) ? normalized : null;
};

const normalizeRecurringStatus = (value) => {
  if (!value) return null;

  const normalized = String(value)
    .trim()
    .toUpperCase();

  return ["ACTIVE", "PAUSED"].includes(normalized)
    ? normalized
    : null;
};

const normalizeMilestoneStatus = (value) => {
  const normalized = String(value || "scheduled")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const allowed = [
    "scheduled",
    "in_progress",
    "paid",
    "overdue",
    "cancelled",
  ];

  return allowed.includes(normalized)
    ? normalized
    : "scheduled";
};

const clampProgress = (value) => {
  const number = toNumber(value);

  if (number === null) return 0;

  return Math.max(0, Math.min(100, Math.round(number)));
};

const getCompanyId = (req) => {
  return req.user?.companyId || req.user?.company?.id || null;
};

/* =========================================================
   INCLUDE
========================================================= */

const projectInclude = {
  client: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },

  milestones: {
    orderBy: {
      dueDate: "asc",
    },
  },
};

/* =========================================================
   RECALCULATE PROJECT BILLING
========================================================= */

const recalculateProjectBilling = async (projectId) => {
  const milestones = await prisma.milestone.findMany({
    where: {
      projectId,
    },
  });

  const paidMilestones = milestones.filter(
    (milestone) =>
      String(milestone.status).toLowerCase() === "paid"
  );

  const billed = paidMilestones.reduce(
    (sum, milestone) =>
      sum + Number(milestone.amount || 0),
    0
  );

  const progress =
    milestones.length === 0
      ? 0
      : Math.round(
          (paidMilestones.length / milestones.length) * 100
        );

  await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      billed,
      progress,
    },
  });

  return {
    billed,
    progress,
  };
};

/* =========================================================
   GET ALL PROJECTS
========================================================= */

const getProjects = async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const projects = await prisma.project.findMany({
      where: {
        companyId,
      },

      include: projectInclude,

      orderBy: {
        createdAt: "desc",
      },
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
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   GET PROJECT BY ID
========================================================= */

const getProjectById = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        companyId,
      },

      include: projectInclude,
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
    const companyId = getCompanyId(req);

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const {
      title,
      client,
      clientId,
      clientName,
      projectType,
      startDate,
      endDate,
      dueDate,
      description,
      currency,

      budget,
      billed,

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
      progress,
      status,

      milestones,
      teamMembers,
      members,
    } = req.body;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const selectedClientId = clientId || client;

    if (!selectedClientId) {
      return res.status(400).json({
        success: false,
        message: "Client is required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Project start and end dates are required",
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

    /* =====================================================
       OPTIONAL PROJECT DUE DATE
    ===================================================== */

    let projectDueDate = end;

    if (dueDate) {
      projectDueDate = parseDateOnly(dueDate);

      if (!projectDueDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid project due date",
        });
      }

      if (projectDueDate < start) {
        return res.status(400).json({
          success: false,
          message:
            "Project due date cannot be before project start date",
        });
      }
    }

    /* =====================================================
       CLIENT OWNERSHIP
    ===================================================== */

    const existingClient = await prisma.client.findFirst({
      where: {
        id: selectedClientId,
        companyId,
      },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    /* =====================================================
       BILLING METHOD
    ===================================================== */

    const method = normalizeBillingMethod(billingMethod);

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing method",
      });
    }

    const isFixedFee = method === "FIXED_FEE";
    const isMilestone = method === "MILESTONE";
    const isHourly = method === "HOURLY";
    const isRetainer = method === "RETAINER";

    /* =====================================================
       BILLING RATE TYPE
    ===================================================== */

    const normalizedRateType = normalizeBillingRateType(
      billingRateType,
      method
    );

    /* =====================================================
       MONEY
    ===================================================== */

    let projectBudget = null;
    let projectBillingRate = null;
    let projectRecurringAmount = null;

    if (isRetainer) {
      projectRecurringAmount =
        toPositiveNumber(recurringAmount);

      if (projectRecurringAmount === null) {
        return res.status(400).json({
          success: false,
          message:
            "Retainer amount must be greater than 0",
        });
      }

      if (!billingCycle) {
        return res.status(400).json({
          success: false,
          message:
            "Billing cycle is required for retainer billing",
        });
      }

      if (!normalizeBillingCycle(billingCycle)) {
        return res.status(400).json({
          success: false,
          message: "Invalid billing cycle",
        });
      }

      if (!recurringStartDate) {
        return res.status(400).json({
          success: false,
          message:
            "Retainer start date is required",
        });
      }

      const recurringStart =
        parseDateOnly(recurringStartDate);

      if (!recurringStart) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid retainer start date",
        });
      }

      if (recurringStart < start) {
        return res.status(400).json({
          success: false,
          message:
            "Retainer start date cannot be before project start date",
        });
      }

      if (recurringEndDate) {
        const recurringEnd =
          parseDateOnly(recurringEndDate);

        if (!recurringEnd) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid retainer end date",
          });
        }

        if (recurringEnd < recurringStart) {
          return res.status(400).json({
            success: false,
            message:
              "Retainer end date cannot be before retainer start date",
          });
        }

        if (recurringEnd > end) {
          return res.status(400).json({
            success: false,
            message:
              "Retainer end date cannot be after project end date",
          });
        }
      }
    } else {
      projectBudget = toPositiveNumber(budget);

      if (projectBudget === null) {
        return res.status(400).json({
          success: false,
          message:
            "Project budget must be greater than 0",
        });
      }
    }

    /* =====================================================
       HOURLY RATE
    ===================================================== */

    if (isHourly) {
      projectBillingRate =
        toPositiveNumber(billingRate);

      if (projectBillingRate === null) {
        return res.status(400).json({
          success: false,
          message:
            "Hourly billing rate must be greater than 0",
        });
      }

      if (!billingCycle) {
        return res.status(400).json({
          success: false,
          message:
            "Billing cycle is required for hourly billing",
        });
      }

      if (!normalizeBillingCycle(billingCycle)) {
        return res.status(400).json({
          success: false,
          message: "Invalid billing cycle",
        });
      }
    }

    /* =====================================================
       MILESTONES
    ===================================================== */

    let normalizedMilestones = [];

    if (isMilestone) {
      const sourceMilestones = Array.isArray(milestones)
        ? milestones
        : [];

      if (sourceMilestones.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Add at least one milestone",
        });
      }

      let milestoneTotal = 0;

      for (let index = 0; index < sourceMilestones.length; index++) {
        const milestone = sourceMilestones[index];

        if (!milestone?.title?.trim()) {
          return res.status(400).json({
            success: false,
            message:
              `Milestone ${index + 1} title is required`,
          });
        }

        if (!milestone?.dueDate) {
          return res.status(400).json({
            success: false,
            message:
              `Milestone ${index + 1} due date is required`,
          });
        }

        const amount = toPositiveNumber(
          milestone.amount
        );

        if (amount === null) {
          return res.status(400).json({
            success: false,
            message:
              `Milestone ${index + 1} amount must be greater than 0`,
          });
        }

        const milestoneDueDate =
          parseDateOnly(milestone.dueDate);

        if (!milestoneDueDate) {
          return res.status(400).json({
            success: false,
            message:
              `Milestone ${index + 1} has an invalid due date`,
          });
        }

        if (
          milestoneDueDate < start ||
          milestoneDueDate > end
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Milestone ${index + 1} due date must be within project dates`,
          });
        }

        milestoneTotal += amount;

        normalizedMilestones.push({
          title: milestone.title.trim(),
          dueDate: milestoneDueDate,
          amount,
          status: normalizeMilestoneStatus(
            milestone.status
          ),
        });
      }

      if (
        projectBudget !== null &&
        milestoneTotal > projectBudget
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Total milestone amount cannot exceed project budget",
        });
      }
    }

    /* =====================================================
       PAYMENT VALUES
    ===================================================== */

    const normalizedPaymentMethod =
      normalizePaymentMethod(paymentMethod);

    const normalizedPaymentTerms =
      normalizePaymentTerms(paymentTerms);

    /* =====================================================
       CREATE DATA
    ===================================================== */

    const team = Array.isArray(teamMembers)
      ? teamMembers
      : [];

    const createData = {
      companyId,
      clientId: existingClient.id,

      title: String(title).trim(),

      clientName:
        clientName &&
        String(clientName).trim()
          ? String(clientName).trim()
          : existingClient.name,

      projectType:
        projectType
          ? String(projectType).trim()
          : method,

      description:
        description !== undefined &&
        description !== null &&
        String(description).trim()
          ? String(description).trim()
          : null,

      startDate: start,
      endDate: end,
      dueDate: projectDueDate,

      currency:
        currency
          ? String(currency).trim().toUpperCase()
          : "INR",

      budget: projectBudget,

      billed:
        toNumber(billed) !== null &&
        toNumber(billed) >= 0
          ? toNumber(billed)
          : 0,

      billingMethod: method,

      billingRateType: normalizedRateType,

      billingRate: projectBillingRate,

      billingCycle:
        isHourly || isRetainer
          ? normalizeBillingCycle(billingCycle)
          : null,

      paymentTerms: normalizedPaymentTerms,

      paymentMethod: normalizedPaymentMethod,

      isRecurring:
        isRetainer || Boolean(isRecurring),

      recurringAmount:
        isRetainer
          ? projectRecurringAmount
          : null,

      recurringStartDate:
        isRetainer
          ? parseDateOnly(recurringStartDate)
          : null,

      recurringEndDate:
        isRetainer
          ? parseDateOnly(recurringEndDate)
          : null,

      nextBillingDate:
        isRetainer
          ? parseDateOnly(nextBillingDate)
          : null,

      recurringStatus:
        isRetainer
          ? normalizeRecurringStatus(
              recurringStatus || "ACTIVE"
            )
          : null,

      autoInvoice:
        autoInvoice !== undefined
          ? Boolean(autoInvoice)
          : true,

      autoCharge:
        isRetainer
          ? Boolean(autoCharge)
          : false,

      progress:
        isMilestone
          ? 0
          : clampProgress(progress),

      status:
        status
          ? String(status).trim().toUpperCase()
          : "ACTIVE",

      icon:
        icon
          ? String(icon).trim()
          : "folder",

      color:
        color
          ? String(color).trim()
          : "bg-primary",

      teamMembers: team,

      members:
        members !== undefined
          ? Math.max(0, Math.round(Number(members) || 0))
          : team.length,
    };

    if (isMilestone && normalizedMilestones.length) {
      createData.milestones = {
        create: normalizedMilestones.map(
          (milestone) => ({
            title: milestone.title,
            dueDate: milestone.dueDate,
            amount: milestone.amount,
            status: milestone.status,
            paidAt:
              milestone.status === "paid"
                ? new Date()
                : null,
          })
        ),
      };
    }

    /* =====================================================
       CREATE
    ===================================================== */

    const project = await prisma.project.create({
      data: createData,
      include: projectInclude,
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
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to create project",
    });
  }
};

/* =========================================================
   UPDATE PROJECT
========================================================= */

const updateProject = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const existingProject =
      await prisma.project.findFirst({
        where: {
          id,
          companyId,
        },
      });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const body = req.body || {};

    const data = {};

    /* =====================================================
       BASIC
    ===================================================== */

    if (body.title !== undefined) {
      const title = String(body.title).trim();

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Project name cannot be empty",
        });
      }

      data.title = title;
    }

    if (body.client !== undefined || body.clientId !== undefined) {
      const clientId =
        body.clientId || body.client;

      const client =
        await prisma.client.findFirst({
          where: {
            id: clientId,
            companyId,
          },
        });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found",
        });
      }

      data.clientId = client.id;

      if (body.clientName === undefined) {
        data.clientName = client.name;
      }
    }

    if (body.clientName !== undefined) {
      data.clientName =
        body.clientName
          ? String(body.clientName).trim()
          : null;
    }

    if (body.projectType !== undefined) {
      data.projectType =
        body.projectType
          ? String(body.projectType).trim()
          : null;
    }

    if (body.description !== undefined) {
      data.description =
        body.description
          ? String(body.description).trim()
          : null;
    }

    /* =====================================================
       DATES
    ===================================================== */

    const newStart =
      body.startDate !== undefined
        ? parseDateOnly(body.startDate)
        : existingProject.startDate;

    const newEnd =
      body.endDate !== undefined
        ? parseDateOnly(body.endDate)
        : existingProject.endDate;

    if (
      body.startDate !== undefined &&
      !newStart
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (
      body.endDate !== undefined &&
      !newEnd
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date",
      });
    }

    if (newEnd < newStart) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    if (body.startDate !== undefined) {
      data.startDate = newStart;
    }

    if (body.endDate !== undefined) {
      data.endDate = newEnd;
    }

    if (body.dueDate !== undefined) {
      const dueDate = body.dueDate
        ? parseDateOnly(body.dueDate)
        : null;

      if (body.dueDate && !dueDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }

      if (dueDate && dueDate < newStart) {
        return res.status(400).json({
          success: false,
          message:
            "Due date cannot be before project start date",
        });
      }

      data.dueDate = dueDate;
    }

    /* =====================================================
       CURRENCY / BUDGET
    ===================================================== */

    if (body.currency !== undefined) {
      data.currency =
        String(body.currency)
          .trim()
          .toUpperCase();
    }

    if (body.budget !== undefined) {
      const budget = toPositiveNumber(body.budget);

      if (budget === null) {
        return res.status(400).json({
          success: false,
          message:
            "Project budget must be greater than 0",
        });
      }

      data.budget = budget;
    }

    /* =====================================================
       BILLING
    ===================================================== */

    let billingMethod =
      existingProject.billingMethod;

    if (body.billingMethod !== undefined) {
      billingMethod =
        normalizeBillingMethod(
          body.billingMethod
        );

      if (!billingMethod) {
        return res.status(400).json({
          success: false,
          message: "Invalid billing method",
        });
      }

      data.billingMethod = billingMethod;
    }

    if (body.billingRateType !== undefined) {
      data.billingRateType =
        normalizeBillingRateType(
          body.billingRateType,
          billingMethod
        );
    }

    if (body.billingRate !== undefined) {
      data.billingRate =
        body.billingRate === null ||
        body.billingRate === ""
          ? null
          : toPositiveNumber(body.billingRate);

      if (
        body.billingRate !== null &&
        body.billingRate !== "" &&
        data.billingRate === null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Billing rate must be greater than 0",
        });
      }
    }

    if (body.billingCycle !== undefined) {
      data.billingCycle =
        body.billingCycle
          ? normalizeBillingCycle(
              body.billingCycle
            )
          : null;

      if (
        body.billingCycle &&
        !data.billingCycle
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid billing cycle",
        });
      }
    }

    if (body.paymentTerms !== undefined) {
      data.paymentTerms =
        normalizePaymentTerms(
          body.paymentTerms
        );
    }

    if (body.paymentMethod !== undefined) {
      data.paymentMethod =
        normalizePaymentMethod(
          body.paymentMethod
        );
    }

    /* =====================================================
       RECURRING
    ===================================================== */

    if (body.isRecurring !== undefined) {
      data.isRecurring =
        Boolean(body.isRecurring);
    }

    if (body.recurringAmount !== undefined) {
      data.recurringAmount =
        body.recurringAmount === null ||
        body.recurringAmount === ""
          ? null
          : toPositiveNumber(
              body.recurringAmount
            );
    }

    if (body.recurringStartDate !== undefined) {
      data.recurringStartDate =
        body.recurringStartDate
          ? parseDateOnly(
              body.recurringStartDate
            )
          : null;
    }

    if (body.recurringEndDate !== undefined) {
      data.recurringEndDate =
        body.recurringEndDate
          ? parseDateOnly(
              body.recurringEndDate
            )
          : null;
    }

    if (body.nextBillingDate !== undefined) {
      data.nextBillingDate =
        body.nextBillingDate
          ? parseDateOnly(
              body.nextBillingDate
            )
          : null;
    }

    if (body.recurringStatus !== undefined) {
      data.recurringStatus =
        normalizeRecurringStatus(
          body.recurringStatus
        );
    }

    /* =====================================================
       AUTOMATION
    ===================================================== */

    if (body.autoInvoice !== undefined) {
      data.autoInvoice =
        Boolean(body.autoInvoice);
    }

    if (body.autoCharge !== undefined) {
      data.autoCharge =
        Boolean(body.autoCharge);
    }

    /* =====================================================
       DISPLAY
    ===================================================== */

    if (body.color !== undefined) {
      data.color = body.color || null;
    }

    if (body.icon !== undefined) {
      data.icon = body.icon || null;
    }

    if (body.status !== undefined) {
      data.status =
        String(body.status)
          .trim()
          .toUpperCase();
    }

    if (body.progress !== undefined) {
      data.progress =
        clampProgress(body.progress);
    }

    /* =====================================================
       TEAM
    ===================================================== */

    if (body.teamMembers !== undefined) {
      const team = Array.isArray(body.teamMembers)
        ? body.teamMembers
        : [];

      data.teamMembers = team;
      data.members = team.length;
    }

    if (body.members !== undefined) {
      data.members = Math.max(
        0,
        Math.round(Number(body.members) || 0)
      );
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    const project = await prisma.project.update({
      where: {
        id,
      },

      data,

      include: projectInclude,
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
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to update project",
    });
  }
};

/* =========================================================
   DELETE PROJECT
========================================================= */

const deleteProject = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project =
      await prisma.project.findFirst({
        where: {
          id,
          companyId,
        },
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await prisma.project.delete({
      where: {
        id,
      },
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
    const companyId = getCompanyId(req);
    const { projectId } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project =
      await prisma.project.findFirst({
        where: {
          id: projectId,
          companyId,
        },

        include: {
          milestones: true,
        },
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (
      project.billingMethod !==
      "MILESTONE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Milestones are only allowed for milestone billing projects",
      });
    }

    const {
      title,
      amount,
      dueDate,
      status,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Milestone name is required",
      });
    }

    const milestoneAmount =
      toPositiveNumber(amount);

    if (milestoneAmount === null) {
      return res.status(400).json({
        success: false,
        message:
          "Milestone amount must be greater than 0",
      });
    }

    const milestoneDueDate =
      parseDateOnly(dueDate);

    if (!milestoneDueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Valid milestone due date is required",
      });
    }

    if (
      milestoneDueDate < project.startDate ||
      milestoneDueDate > project.endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Milestone due date must be within project dates",
      });
    }

    const existingTotal =
      project.milestones.reduce(
        (sum, milestone) =>
          sum + Number(milestone.amount || 0),
        0
      );

    const projectBudget =
      Number(project.budget || 0);

    if (
      projectBudget > 0 &&
      existingTotal + milestoneAmount >
        projectBudget
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total milestone amount cannot exceed project budget",
      });
    }

    const normalizedStatus =
      normalizeMilestoneStatus(status);

    const milestone =
      await prisma.milestone.create({
        data: {
          projectId,

          title: String(title).trim(),

          amount: milestoneAmount,

          dueDate: milestoneDueDate,

          status: normalizedStatus,

          paidAt:
            normalizedStatus === "paid"
              ? new Date()
              : null,
        },
      });

    const {
      billed,
      progress,
    } = await recalculateProjectBilling(
      projectId
    );

    return res.status(201).json({
      success: true,
      message:
        "Milestone created successfully",
      milestone,
      projectBilled: billed,
      projectProgress: progress,
    });
  } catch (error) {
    console.error(
      "CREATE MILESTONE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to create milestone",
    });
  }
};

/* =========================================================
   UPDATE MILESTONE
========================================================= */

const updateMilestone = async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const {
      projectId,
      milestoneId,
    } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project =
      await prisma.project.findFirst({
        where: {
          id: projectId,
          companyId,
        },

        include: {
          milestones: true,
        },
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const existingMilestone =
      await prisma.milestone.findFirst({
        where: {
          id: milestoneId,
          projectId,
        },
      });

    if (!existingMilestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    const {
      title,
      amount,
      dueDate,
      status,
    } = req.body;

    const data = {};

    if (title !== undefined) {
      const normalizedTitle =
        String(title).trim();

      if (!normalizedTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Milestone name is required",
        });
      }

      data.title = normalizedTitle;
    }

    if (amount !== undefined) {
      const normalizedAmount =
        toPositiveNumber(amount);

      if (normalizedAmount === null) {
        return res.status(400).json({
          success: false,
          message:
            "Milestone amount must be greater than 0",
        });
      }

      const otherTotal =
        project.milestones
          .filter(
            (milestone) =>
              milestone.id !== milestoneId
          )
          .reduce(
            (sum, milestone) =>
              sum +
              Number(milestone.amount || 0),
            0
          );

      const projectBudget =
        Number(project.budget || 0);

      if (
        projectBudget > 0 &&
        otherTotal + normalizedAmount >
          projectBudget
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Total milestone amount cannot exceed project budget",
        });
      }

      data.amount = normalizedAmount;
    }

    if (dueDate !== undefined) {
      const normalizedDueDate =
        parseDateOnly(dueDate);

      if (!normalizedDueDate) {
        return res.status(400).json({
          success: false,
          message:
            "Valid milestone due date is required",
        });
      }

      if (
        normalizedDueDate < project.startDate ||
        normalizedDueDate > project.endDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Milestone due date must be within project dates",
        });
      }

      data.dueDate = normalizedDueDate;
    }

    const oldStatus =
      normalizeMilestoneStatus(
        existingMilestone.status
      );

    const newStatus =
      status !== undefined
        ? normalizeMilestoneStatus(status)
        : oldStatus;

    if (status !== undefined) {
      data.status = newStatus;

      if (
        newStatus === "paid" &&
        oldStatus !== "paid"
      ) {
        data.paidAt = new Date();
      }

      if (
        oldStatus === "paid" &&
        newStatus !== "paid"
      ) {
        data.paidAt = null;
      }
    }

    const milestone =
      await prisma.milestone.update({
        where: {
          id: milestoneId,
        },

        data,
      });

    const {
      billed,
      progress,
    } = await recalculateProjectBilling(
      projectId
    );

    return res.status(200).json({
      success: true,
      message:
        "Milestone updated successfully",
      milestone,
      projectBilled: billed,
      projectProgress: progress,
    });
  } catch (error) {
    console.error(
      "UPDATE MILESTONE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to update milestone",
    });
  }
};

/* =========================================================
   DELETE MILESTONE
========================================================= */

const deleteMilestone = async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const {
      projectId,
      milestoneId,
    } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    const project =
      await prisma.project.findFirst({
        where: {
          id: projectId,
          companyId,
        },
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const milestone =
      await prisma.milestone.findFirst({
        where: {
          id: milestoneId,
          projectId,
        },
      });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found",
      });
    }

    await prisma.milestone.delete({
      where: {
        id: milestoneId,
      },
    });

    const {
      billed,
      progress,
    } = await recalculateProjectBilling(
      projectId
    );

    return res.status(200).json({
      success: true,
      message:
        "Milestone deleted successfully",
      projectBilled: billed,
      projectProgress: progress,
    });
  } catch (error) {
    console.error(
      "DELETE MILESTONE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to delete milestone",
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