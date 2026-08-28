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

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};


