const prisma = require("../../config/prisma");

// =====================================================
// GET ALL PROJECTS
// =====================================================

const getProjects = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Company ID not found in authenticated user",
      });
    }

    console.log("COMPANY ID:", companyId);

    const projects = await prisma.project.findMany({
      where: {
        companyId,
      },

      include: {
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
      },

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

// =====================================================
// GET PROJECT BY ID
// =====================================================

const getProjectById = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        companyId,
      },

      include: {
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

// =====================================================
// CREATE PROJECT
// =====================================================

const createProject = async (req, res) => {
  try {
    const companyId = req.user.companyId;

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

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

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

    if (
      !Number.isFinite(projectBudget) ||
      projectBudget <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Budget must be greater than 0",
      });
    }

    // -------------------------------------------------
    // VERIFY CLIENT
    // -------------------------------------------------

    const existingClient =
      await prisma.client.findFirst({
        where: {
          id: client,
          companyId,
        },
      });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // -------------------------------------------------
    // VALIDATE MILESTONES
    // -------------------------------------------------

    const projectMilestones =
      Array.isArray(milestones)
        ? milestones
        : [];

    let milestoneTotal = 0;

    const normalizedMilestones =
      projectMilestones.map((milestone, index) => {
        const amount = Number(milestone?.amount);

        if (!milestone?.title?.trim()) {
          throw new Error(
            `Milestone ${index + 1} title is required`
          );
        }

        if (!milestone?.dueDate) {
          throw new Error(
            `Milestone ${index + 1} due date is required`
          );
        }

        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          throw new Error(
            `Milestone ${index + 1} amount must be greater than 0`
          );
        }

        milestoneTotal += amount;

        return {
          title: milestone.title.trim(),

          dueDate: new Date(
            `${milestone.dueDate}T00:00:00`
          ),

          amount,

          status:
            String(
              milestone?.status || "scheduled"
            ).toLowerCase(),
        };
      });

    if (milestoneTotal > projectBudget) {
      return res.status(400).json({
        success: false,
        message:
          "Total milestone amount cannot exceed project budget",
      });
    }

    // -------------------------------------------------
    // CREATE PROJECT + MILESTONES
    // -------------------------------------------------

    const project =
      await prisma.project.create({
        data: {
          companyId,

          clientId: existingClient.id,

          title: title.trim(),

          clientName:
            clientName?.trim() ||
            existingClient.name,

          projectType:
            projectType || "Fixed Fee",

          startDate: new Date(
            `${startDate}T00:00:00`
          ),

          endDate: new Date(
            `${endDate}T00:00:00`
          ),

          description:
            description?.trim() || null,

          budget: projectBudget,

          billed: 0,

          billingMethod:
            billingMethod || "Milestone",

          autoInvoice:
            Boolean(autoInvoice),

          color:
            color || "bg-cyan-500",

          progress: 0,

          status: "ACTIVE",

          icon: "folder",

          teamMembers:
            Array.isArray(teamMembers)
              ? teamMembers
              : [],

          members:
            Array.isArray(teamMembers)
              ? teamMembers.length
              : 0,

          milestones: {
            create: normalizedMilestones,
          },
        },

        include: {
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
        },
      });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error(
      "CREATE PROJECT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to create project",
    });
  }
};

// =====================================================
// UPDATE PROJECT
// =====================================================

const updateProject = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

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
      const existingClient =
        await prisma.client.findFirst({
          where: {
            id: client,
            companyId,
          },
        });

      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Client not found",
        });
      }

      clientId = existingClient.id;
    }

    const project =
      await prisma.project.update({
        where: {
          id,
        },

        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),

          ...(clientId !== undefined && {
            clientId,
          }),

          ...(clientName !== undefined && {
            clientName:
              clientName?.trim() || null,
          }),

          ...(projectType !== undefined && {
            projectType,
          }),

          ...(startDate !== undefined && {
            startDate: new Date(
              `${startDate}T00:00:00`
            ),
          }),

          ...(endDate !== undefined && {
            endDate: new Date(
              `${endDate}T00:00:00`
            ),
          }),

          ...(description !== undefined && {
            description:
              description?.trim() || null,
          }),

          ...(budget !== undefined && {
            budget: Number(budget),
          }),

          ...(billingMethod !== undefined && {
            billingMethod,
          }),

          ...(autoInvoice !== undefined && {
            autoInvoice:
              Boolean(autoInvoice),
          }),

          ...(color !== undefined && {
            color,
          }),

          ...(teamMembers !== undefined && {
            teamMembers:
              Array.isArray(teamMembers)
                ? teamMembers
                : [],

            members:
              Array.isArray(teamMembers)
                ? teamMembers.length
                : 0,
          }),

          ...(progress !== undefined && {
            progress: Number(progress),
          }),

          ...(status !== undefined && {
            status,
          }),
        },

        include: {
          client: true,
          milestones: {
            orderBy: {
              dueDate: "asc",
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error(
      "UPDATE PROJECT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

// =====================================================
// DELETE PROJECT
// =====================================================

const deleteProject = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { id } = req.params;

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
    console.error(
      "DELETE PROJECT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};

// =====================================================
// CREATE MILESTONE
// =====================================================

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

    // -------------------------------------------------
    // VERIFY PROJECT
    // -------------------------------------------------

    const project = await prisma.project.findFirst({
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

    const {
      title,
      amount,
      dueDate,
      status,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

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

    if (
      !Number.isFinite(milestoneAmount) ||
      milestoneAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // -------------------------------------------------
    // CHECK EXISTING MILESTONES AGAINST BUDGET
    // -------------------------------------------------

    const existingMilestones =
      await prisma.milestone.findMany({
        where: {
          projectId,
        },
      });

    const existingTotal = existingMilestones.reduce(
      (total, milestone) =>
        total + Number(milestone.amount || 0),
      0
    );

    if (
      existingTotal + milestoneAmount >
      Number(project.budget || 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total milestone amount cannot exceed project budget",
      });
    }

    // -------------------------------------------------
    // CREATE
    // -------------------------------------------------

    const milestone =
      await prisma.milestone.create({
        data: {
          projectId,

          title: title.trim(),

          amount: milestoneAmount,

          dueDate: new Date(
            `${dueDate}T00:00:00`
          ),

          status: String(
            status || "scheduled"
          ).toLowerCase(),
        },
      });

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      milestone,
    });
  } catch (error) {
    console.error(
      "CREATE MILESTONE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to create milestone",
    });
  }
};


// =====================================================
// UPDATE MILESTONE
// =====================================================

const updateMilestone = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

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

    // -------------------------------------------------
    // VERIFY PROJECT
    // -------------------------------------------------

    const project = await prisma.project.findFirst({
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

    // -------------------------------------------------
    // VERIFY MILESTONE
    // -------------------------------------------------

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

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      title !== undefined &&
      !title?.trim()
    ) {
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

      if (
        !Number.isFinite(milestoneAmount) ||
        milestoneAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }
    }

    // -------------------------------------------------
    // CHECK BUDGET
    // -------------------------------------------------

    if (milestoneAmount !== undefined) {
      const otherMilestones =
        await prisma.milestone.findMany({
          where: {
            projectId,
            NOT: {
              id: milestoneId,
            },
          },
        });

      const otherTotal =
        otherMilestones.reduce(
          (total, milestone) =>
            total +
            Number(milestone.amount || 0),
          0
        );

      if (
        otherTotal + milestoneAmount >
        Number(project.budget || 0)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Total milestone amount cannot exceed project budget",
        });
      }
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const milestone =
      await prisma.milestone.update({
        where: {
          id: milestoneId,
        },

        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),

          ...(milestoneAmount !== undefined && {
            amount: milestoneAmount,
          }),

          ...(dueDate !== undefined && {
            dueDate: new Date(
              `${dueDate}T00:00:00`
            ),
          }),

          ...(status !== undefined && {
            status: String(
              status
            ).toLowerCase(),
          }),
        },
      });

    return res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      milestone,
    });
  } catch (error) {
    console.error(
      "UPDATE MILESTONE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to update milestone",
    });
  }
};


// =====================================================
// DELETE MILESTONE
// =====================================================

const deleteMilestone = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

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

    // -------------------------------------------------
    // VERIFY PROJECT
    // -------------------------------------------------

    const project = await prisma.project.findFirst({
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

    // -------------------------------------------------
    // VERIFY MILESTONE
    // -------------------------------------------------

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

    // -------------------------------------------------
    // DELETE
    // -------------------------------------------------

    await prisma.milestone.delete({
      where: {
        id: milestoneId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Milestone deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE MILESTONE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to delete milestone",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,

  // MILESTONES
  createMilestone,
  updateMilestone,
  deleteMilestone,
};

