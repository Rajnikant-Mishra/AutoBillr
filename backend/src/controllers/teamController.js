
const prisma = require("../../config/prisma");
const teamService = require("../services/teamService");

const {
  DEFAULT_ROLE_PERMISSIONS,
} = require("../constants/permissions");

/*
|--------------------------------------------------------------------------
| SYSTEM ROLES
|--------------------------------------------------------------------------
| These roles are stored in the Role table for each company.
|
| IMPORTANT:
| We use upsert with update: {} so existing customized permissions
| are NOT overwritten.
|--------------------------------------------------------------------------
*/

const SYSTEM_ROLES = [
  {
    name: "Owner",
    description: "Full access to the company",
    permissions: DEFAULT_ROLE_PERMISSIONS.Owner,
  },
  {
    name: "Admin",
    description: "Administrative access",
    permissions: DEFAULT_ROLE_PERMISSIONS.Admin,
  },
  {
    name: "Manager",
    description: "Management access",
    permissions: DEFAULT_ROLE_PERMISSIONS.Manager,
  },
  {
    name: "Analyst",
    description: "Analytics and read access",
    permissions: DEFAULT_ROLE_PERMISSIONS.Analyst,
  },
  {
    name: "Viewer",
    description: "Read-only access",
    permissions: DEFAULT_ROLE_PERMISSIONS.Viewer,
  },
];

/*
|--------------------------------------------------------------------------
| ENSURE SYSTEM ROLES
|--------------------------------------------------------------------------
| Creates the standard roles if they do not already exist.
|
| Existing role permissions are preserved.
|--------------------------------------------------------------------------
*/

const ensureSystemRoles = async (companyId) => {
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: {
        companyId_name: {
          companyId,
          name: role.name,
        },
      },

      /*
       * DO NOT update existing permissions here.
       *
       * The administrator may have customized the role.
       */
      update: {},

      create: {
        companyId,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: true,
      },
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET AUTHENTICATED USER / COMPANY CONTEXT
|--------------------------------------------------------------------------
| Never trust a hard-coded companyId or companyId from the frontend.
|
| The authentication middleware should provide req.user.id.
| We then fetch the current User record from PostgreSQL and use the
| companyId stored on that User.
|--------------------------------------------------------------------------
*/

const getCompanyContext = async (req) => {
  /*
   * Different auth implementations sometimes use:
   * req.user.id
   * req.user.userId
   * req.user._id
   */
  const authenticatedUserId =
    req.user?.id ||
    req.user?.userId ||
    req.user?._id ||
    null;

  if (!authenticatedUserId) {
    const error = new Error(
      "Authenticated user not found. Please login again."
    );

    error.statusCode = 401;
    throw error;
  }

  /*
   * Always get companyId from the database.
   */
  const user = await prisma.user.findUnique({
    where: {
      id: authenticatedUserId,
    },
    select: {
      id: true,
      companyId: true,
      role: true,
    },
  });

  if (!user) {
    const error = new Error(
      "User account was not found. Please login again."
    );

    error.statusCode = 401;
    throw error;
  }

  if (!user.companyId) {
    const error = new Error(
      "No company is associated with this account. Please login again."
    );

    error.statusCode = 400;
    throw error;
  }

  /*
   * Verify that the company actually exists.
   */
  const company = await prisma.company.findUnique({
    where: {
      id: user.companyId,
    },
    select: {
      id: true,
    },
  });

  if (!company) {
    const error = new Error(
      "Company associated with this account was not found. Please login again."
    );

    error.statusCode = 400;
    throw error;
  }

  return {
    companyId: company.id,
    userId: user.id,
    role: user.role,
  };
};

/*
|--------------------------------------------------------------------------
| GET ALL TEAM MEMBERS
| GET /api/v1/team
|--------------------------------------------------------------------------
*/

const getTeamMembers = async (req, res) => {
  try {
    const { companyId, userId } = await getCompanyContext(req);

    console.log("GET TEAM MEMBERS");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);

    const members = await teamService.listMembers(companyId);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("GET TEAM MEMBERS ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch team members",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET TEAM STATS
| GET /api/v1/team/stats
|--------------------------------------------------------------------------
*/

const getTeamStats = async (req, res) => {
  try {
    const { companyId, userId } = await getCompanyContext(req);

    console.log("GET TEAM STATS");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);

    const stats = await teamService.getStats(companyId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("GET TEAM STATS ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch team statistics",
    });
  }
};

/*
|--------------------------------------------------------------------------
| INVITE TEAM MEMBER
| POST /api/v1/team/invite
|--------------------------------------------------------------------------
*/

const inviteTeamMember = async (req, res) => {
  try {
    const { companyId, userId } = await getCompanyContext(req);

    console.log("================================");
    console.log("INVITE TEAM MEMBER");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);
    console.log("Request Body:", req.body);
    console.log("================================");

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const member = await teamService.inviteMember(
      companyId,
      userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Team member invited successfully",
      data: member,
    });
  } catch (error) {
    console.error("INVITE TEAM MEMBER ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to invite team member",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE TEAM MEMBER ROLE
| PATCH /api/v1/team/:id/role
|--------------------------------------------------------------------------
|
| This changes which Role the member belongs to.
|
| Example:
|
| Rahul
|   roleId -> Analyst
|
| It does NOT modify extraPermissions.
|--------------------------------------------------------------------------
*/

const updateTeamMemberRole = async (req, res) => {
  try {
    const { companyId, userId } = await getCompanyContext(req);

    const memberId = req.params.id;
    const { role } = req.body || {};

    console.log("UPDATE TEAM MEMBER ROLE");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);
    console.log("Member ID:", memberId);
    console.log("Role:", role);

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

    const member = await teamService.updateRole(
      companyId,
      memberId,
      role
    );

    return res.status(200).json({
      success: true,
      message: "Team member role updated successfully",
      data: member,
    });
  } catch (error) {
    console.error("UPDATE TEAM MEMBER ROLE ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update team member role",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE TEAM MEMBER EXTRA PERMISSIONS
| PATCH /api/v1/team/:id/permissions
|--------------------------------------------------------------------------
|
| MEMBER-WISE PERMISSIONS
|
| These permissions belong ONLY to this specific TeamMember.
|
| Example:
|
| Role:
|   Analyst
|
| Role permissions:
|   dashboard:view
|   invoices:view
|   analytics:view
|
| Member extra permissions:
|   invoices:create
|   clients:edit
|
| These extra permissions do NOT affect other Analysts.
|--------------------------------------------------------------------------
*/

const updateTeamMemberPermissions = async (req, res) => {
  try {
    const { companyId, userId } =
      await getCompanyContext(req);

    const memberId = req.params.id;

    const { extraPermissions } =
      req.body || {};

    console.log("================================");
    console.log(
      "UPDATE TEAM MEMBER PERMISSIONS"
    );
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);
    console.log("Member ID:", memberId);
    console.log(
      "Extra Permissions:",
      extraPermissions
    );
    console.log("================================");

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message:
          "Team member ID is required.",
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
    console.error(
      "UPDATE TEAM MEMBER PERMISSIONS ERROR:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update team member permissions",
    });
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
    const { companyId, userId } = await getCompanyContext(req);

    const memberId = req.params.id;

    console.log("DELETE TEAM MEMBER");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);
    console.log("Member ID:", memberId);

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Team member ID is required.",
      });
    }

    await teamService.removeMember(companyId, memberId);

    return res.status(200).json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("DELETE TEAM MEMBER ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to remove team member",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LIST ALL ROLES
| GET /api/v1/team/roles
|--------------------------------------------------------------------------
|
| Returns:
|
| 1. System roles
|    Owner
|    Admin
|    Manager
|    Analyst
|    Viewer
|
| 2. Custom roles
|
| Every role now has a real database ID.
|--------------------------------------------------------------------------
*/

const listCustomRoles = async (req, res) => {
  try {
    const { companyId, userId } = await getCompanyContext(req);

    console.log("LIST TEAM ROLES");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);

    /*
     * Make sure standard roles exist for this company.
     */
    await ensureSystemRoles(companyId);

    /*
     * Return BOTH system and custom roles.
     */
    const roles = await prisma.role.findMany({
      where: {
        companyId,
      },

      orderBy: [
        {
          isSystem: "desc",
        },
        {
          name: "asc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("LIST TEAM ROLES ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch team roles",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ROLE PERMISSIONS
| PATCH /api/v1/team/roles/:id
|--------------------------------------------------------------------------
|
| ROLE-WISE PERMISSIONS
|
| These permissions belong to the Role.
|
| Example:
|
| Analyst
|   permissions:
|     dashboard:view
|     invoices:view
|     analytics:view
|
| Every member assigned to Analyst gets these permissions.
|--------------------------------------------------------------------------
*/

const updateRolePermissions = async (req, res) => {
  try {
    const { companyId, userId } = await getCompanyContext(req);

    const roleId = req.params.id;

    const { permissions } = req.body || {};

    console.log("================================");
    console.log("UPDATE ROLE PERMISSIONS");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);
    console.log("Role ID:", roleId);
    console.log("Permissions:", permissions);
    console.log("================================");

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

    /*
     * Remove empty values and duplicates.
     */
    const uniquePermissions = [
      ...new Set(
        permissions
          .filter(Boolean)
          .map((permission) => String(permission).trim())
          .filter(Boolean)
      ),
    ];

    /*
     * Make sure the role belongs to the current company.
     */
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

    /*
     * Update Role.permissions.
     *
     * IMPORTANT:
     * This does NOT modify TeamMember.extraPermissions.
     */
    const updatedRole = await prisma.role.update({
      where: {
        id: role.id,
      },

      data: {
        permissions: uniquePermissions,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${updatedRole.name} permissions updated successfully.`,
      data: updatedRole,
    });
  } catch (error) {
    console.error("UPDATE ROLE PERMISSIONS ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Failed to update role permissions",
    });
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
    const { companyId, userId } = await getCompanyContext(req);

    console.log("CREATE CUSTOM ROLE");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const role = await teamService.createCustomRole(
      companyId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Custom role created successfully",
      data: role,
    });
  } catch (error) {
    console.error("CREATE CUSTOM ROLE ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to create custom role",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ACCEPT TEAM INVITATION
| POST /api/v1/team/accept
|--------------------------------------------------------------------------
*/

const acceptTeamInvitation = async (req, res) => {
  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required.",
      });
    }

    const member = await teamService.acceptInvitation(token);

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully.",
      data: member,
    });
  } catch (error) {
    console.error("ACCEPT TEAM INVITATION ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message || "Unable to accept invitation.",
    });
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
    const { companyId, userId } = await getCompanyContext(req);

    const roleId = req.params.id;

    console.log("DELETE CUSTOM ROLE");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);
    console.log("Role ID:", roleId);

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
      message: "Custom role removed successfully",
    });
  } catch (error) {
    console.error("DELETE CUSTOM ROLE ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message || "Failed to remove custom role",
    });
  }
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

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
