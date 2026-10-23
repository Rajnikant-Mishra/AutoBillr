const prisma = require("../../config/prisma");
const teamService = require("../services/teamService");
const {
  DEFAULT_ROLE_PERMISSIONS,
} = require("../constants/permissions");

const SYSTEM_ROLES = [
  {
    name: "Owner",
    description: "Full access to the company",
  },
  {
    name: "Admin",
    description: "Administrative access",
  },
  {
    name: "Manager",
    description: "Management access",
  },
  {
    name: "Analyst",
    description: "Analytics and read access",
  },
  {
    name: "Viewer",
    description: "Read-only access",
  },
];

async function ensureSystemRoles(companyId) {
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: {
        companyId_name: {
          companyId,
          name: role.name,
        },
      },
      update: {},
      create: {
        companyId,
        name: role.name,
        description: role.description,
        permissions:
          DEFAULT_ROLE_PERMISSIONS[role.name] || [],
        isSystem: true,
      },
    });
  }
}

function createError(message, statusCode = 400) {
  return Object.assign(new Error(message), {
    statusCode,
  });
}

async function getCompanyContext(req) {
  const userId = req.user?.userId || req.user?.id;
  const companyId = req.user?.companyId;

  if (!userId) {
    throw createError(
      "Authenticated user not found. Please log in again.",
      401
    );
  }

  if (!companyId) {
    throw createError(
      "No active company selected for this account.",
      400
    );
  }

  const [user, company] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    }),

    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        ownerId: true,
      },
    }),
  ]);

  if (!user) {
    throw createError("User account was not found.", 401);
  }

  if (!company) {
    throw createError("Company was not found.", 404);
  }

  const isOwner = company.ownerId === user.id;

  let membership = null;

  if (!isOwner) {
    membership = await prisma.teamMember.findFirst({
      where: {
        companyId,
        status: "ACTIVE",
        OR: [
          { userId: user.id },
          {
            email: {
              equals: user.email,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        roleRef: true,
      },
    });

    if (!membership) {
      throw createError(
        "You do not have an active membership in this company.",
        403
      );
    }
  }

  return {
    companyId,
    userId: user.id,
    user,
    role: isOwner
      ? "Owner"
      : membership.roleRef?.name ||
        membership.role ||
        "Viewer",
    roleId: membership?.roleId || null,
    isOwner,
    membershipId: membership?.id || null,
  };
}

function sendError(
  res,
  error,
  fallback,
  defaultStatus = 500
) {
  console.error(fallback, error);

  return res.status(
    error.statusCode || defaultStatus
  ).json({
    success: false,
    message: error.message || fallback,
  });
}

/*
|--------------------------------------------------------------------------
| GET TEAM MEMBERS
| GET /api/v1/team
|--------------------------------------------------------------------------
*/

const getTeamMembers = async (req, res) => {
  try {
    const { companyId, userId } =
      await getCompanyContext(req);

    const [company, members] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          ownerId: true,
        },
      }),

      teamService.listMembers(companyId),
    ]);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found.",
      });
    }

    let data = Array.isArray(members)
      ? members
      : [];

    const owner = company.ownerId
      ? await prisma.user.findUnique({
          where: { id: company.ownerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        })
      : null;

    data = data.map((member) => {
      const isWorkspaceOwner =
        Boolean(owner) &&
        (
          member.userId === owner.id ||
          String(member.email || "").toLowerCase() ===
            String(owner.email || "").toLowerCase()
        );

      return {
        ...member,
        role: isWorkspaceOwner
          ? "Owner"
          : member.roleRef?.name ||
            member.role ||
            "Viewer",
        isWorkspaceOwner,
      };
    });

    /*
     * If registration has not created an owner TeamMember
     * record, return a display-only owner row.
     *
     * Its id is null intentionally. It cannot be edited
     * or deleted as a normal TeamMember.
     */
    const ownerAlreadyListed =
      owner &&
      data.some(
        (member) =>
          member.userId === owner.id ||
          String(member.email || "").toLowerCase() ===
            String(owner.email || "").toLowerCase()
      );

    if (owner && !ownerAlreadyListed) {
      data.unshift({
        id: null,
        userId: owner.id,
        name:
          [owner.firstName, owner.lastName]
            .filter(Boolean)
            .join(" ") ||
          owner.email ||
          "Company Owner",
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        avatar: owner.avatar || null,
        role: "Owner",
        roleId: null,
        roleRef: null,
        extraPermissions: [],
        status: "active",
        lastActivityAt: null,
        isWorkspaceOwner: true,
        isDisplayOnly: true,
      });
    }

    console.log("GET TEAM MEMBERS", {
      companyId,
      userId,
      ownerFound: Boolean(owner),
      count: data.length,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to fetch team members"
    );
  }
};

/*
|--------------------------------------------------------------------------
| GET TEAM STATISTICS
| GET /api/v1/team/stats
|--------------------------------------------------------------------------
*/

const getTeamStats = async (req, res) => {
  try {
    const { companyId } =
      await getCompanyContext(req);

    const stats =
      await teamService.getStats(companyId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to fetch team statistics"
    );
  }
};

/*
|--------------------------------------------------------------------------
| INVITE TEAM MEMBER
| POST /api/v1/team
|--------------------------------------------------------------------------
*/

const inviteTeamMember = async (req, res) => {
  try {
    const { companyId, userId, isOwner } =
      await getCompanyContext(req);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Only the workspace owner can invite team members.",
      });
    }

    const member =
      await teamService.inviteMember(
        companyId,
        userId,
        req.body || {}
      );

    return res.status(201).json({
      success: true,
      message: "Team member invited successfully.",
      data: member,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to invite team member",
      400
    );
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE TEAM MEMBER ROLE
| PATCH /api/v1/team/:id/role
|--------------------------------------------------------------------------
*/

const updateTeamMemberRole = async (req, res) => {
  try {
    const { companyId, isOwner } =
      await getCompanyContext(req);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Only the workspace owner can change team roles.",
      });
    }

    const memberId = req.params.id;
    const { role } = req.body || {};

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Team member ID is required.",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required.",
      });
    }

    const target =
      await prisma.teamMember.findFirst({
        where: {
          id: memberId,
          companyId,
        },
        select: {
          id: true,
          userId: true,
          email: true,
        },
      });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const company =
      await prisma.company.findUnique({
        where: { id: companyId },
        select: { ownerId: true },
      });

    if (
      target.userId &&
      target.userId === company?.ownerId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The workspace owner's role cannot be changed.",
      });
    }

    const member = await teamService.updateRole(
      companyId,
      memberId,
      role
    );

    return res.status(200).json({
      success: true,
      message:
        "Team member role updated successfully.",
      data: member,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to update team member role",
      400
    );
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MEMBER-SPECIFIC PERMISSIONS
| PATCH /api/v1/team/:id/permissions
|--------------------------------------------------------------------------
*/

const updateTeamMemberPermissions = async (
  req,
  res
) => {
  try {
    const { companyId, isOwner } =
      await getCompanyContext(req);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Only the workspace owner can update member permissions.",
      });
    }

    const memberId = req.params.id;
    const { extraPermissions } = req.body || {};

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Team member ID is required.",
      });
    }

    if (!Array.isArray(extraPermissions)) {
      return res.status(400).json({
        success: false,
        message:
          "extraPermissions must be an array.",
      });
    }

    const member =
      await teamService.updateMemberExtraPermissions(
        companyId,
        memberId,
        extraPermissions
      );

    return res.status(200).json({
      success: true,
      message:
        "Member permissions updated successfully.",
      data: member,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to update member permissions"
    );
  }
};

/*
|--------------------------------------------------------------------------
| DELETE TEAM MEMBER
| DELETE /api/v1/team/:id
|--------------------------------------------------------------------------
*/

const deleteTeamMember = async (req, res) => {
  try {
    const { companyId, isOwner } =
      await getCompanyContext(req);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Only the workspace owner can remove team members.",
      });
    }

    const memberId = req.params.id;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Team member ID is required.",
      });
    }

    const target =
      await prisma.teamMember.findFirst({
        where: {
          id: memberId,
          companyId,
        },
        select: {
          id: true,
          userId: true,
        },
      });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const company =
      await prisma.company.findUnique({
        where: { id: companyId },
        select: { ownerId: true },
      });

    if (
      target.userId &&
      target.userId === company?.ownerId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The workspace owner cannot be removed.",
      });
    }

    await teamService.removeMember(
      companyId,
      memberId
    );

    return res.status(200).json({
      success: true,
      message: "Team member removed successfully.",
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to remove team member",
      400
    );
  }
};

/*
|--------------------------------------------------------------------------
| LIST ROLES
| GET /api/v1/team/roles
|--------------------------------------------------------------------------
*/

const listCustomRoles = async (req, res) => {
  try {
    const { companyId } =
      await getCompanyContext(req);

    await ensureSystemRoles(companyId);

    const roles = await prisma.role.findMany({
      where: { companyId },
      orderBy: [
        { isSystem: "desc" },
        { name: "asc" },
      ],
    });

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to fetch team roles"
    );
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ROLE PERMISSIONS
| PATCH /api/v1/team/roles/:id
|--------------------------------------------------------------------------
*/

const updateRolePermissions = async (
  req,
  res
) => {
  try {
    const { companyId, isOwner } =
      await getCompanyContext(req);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Only the workspace owner can update role permissions.",
      });
    }

    const roleId = req.params.id;
    const { permissions } = req.body || {};

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Permissions must be an array.",
      });
    }

    const role = await prisma.role.findFirst({
      where: {
        id: roleId,
        companyId,
      },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    const normalizedPermissions = [
      ...new Set(
        permissions
          .map((permission) =>
            String(permission).trim()
          )
          .filter(Boolean)
      ),
    ];

    const updatedRole =
      await prisma.role.update({
        where: { id: roleId },
        data: {
          permissions: normalizedPermissions,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        `${updatedRole.name} permissions updated successfully.`,
      data: updatedRole,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to update role permissions"
    );
  }
};

/*
|--------------------------------------------------------------------------
| CREATE CUSTOM ROLE
| POST /api/v1/team/roles
|--------------------------------------------------------------------------
*/

const createCustomRole = async (req, res) => {
  try {
    const { companyId, isOwner } =
      await getCompanyContext(req);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Only the workspace owner can create roles.",
      });
    }

    const role =
      await teamService.createCustomRole(
        companyId,
        req.body || {}
      );

    return res.status(201).json({
      success: true,
      message: "Custom role created successfully.",
      data: role,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to create custom role",
      400
    );
  }
};

/*
|--------------------------------------------------------------------------
| ACCEPT TEAM INVITATION
| POST /api/v1/team/accept-invitation
|--------------------------------------------------------------------------
*/

const acceptTeamInvitation = async (
  req,
  res
) => {
  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required.",
      });
    }

    const member =
      await teamService.acceptInvitation(token);

    return res.status(200).json({
      success: true,
      message:
        "Invitation accepted successfully.",
      data: member,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to accept invitation.",
      400
    );
  }
};

/*
|--------------------------------------------------------------------------
| DELETE CUSTOM ROLE
| DELETE /api/v1/team/roles/:id
|--------------------------------------------------------------------------
*/

const deleteCustomRole = async (req, res) => {
  try {
    const { companyId, isOwner } =
      await getCompanyContext(req);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Only the workspace owner can delete roles.",
      });
    }

    const roleId = req.params.id;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required.",
      });
    }

    await teamService.deleteCustomRole(
      companyId,
      roleId
    );

    return res.status(200).json({
      success: true,
      message: "Custom role removed successfully.",
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Failed to remove custom role",
      400
    );
  }
};

module.exports = {
  getTeamMembers,
  getTeamStats,
  inviteTeamMember,
  acceptTeamInvitation,
  updateTeamMemberRole,
  updateTeamMemberPermissions,
  deleteTeamMember,
  listCustomRoles,
  createCustomRole,
  updateRolePermissions,
  deleteCustomRole,
};