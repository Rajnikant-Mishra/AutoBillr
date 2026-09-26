// const teamService = require("../services/teamService");

// /*
// |--------------------------------------------------------------------------
// | TEMPORARY COMPANY ID
// |--------------------------------------------------------------------------
// | Replace this with the companyId coming from authenticated JWT user later.
// */
// const TEMP_COMPANY_ID = "cmtv6r6z30000v0vfcly55d5w";

// /*
// |--------------------------------------------------------------------------
// | Get company context
// |--------------------------------------------------------------------------
// */
// const getCompanyContext = (req) => {
//   const companyId = req.companyId || TEMP_COMPANY_ID;
//   const userId = req.user?.id || null;

//   return { companyId, userId };
// };

// /*
// |--------------------------------------------------------------------------
// | GET ALL TEAM MEMBERS
// | GET /api/v1/team
// |--------------------------------------------------------------------------
// */
// const getTeamMembers = async (req, res) => {
//   try {
//     const { companyId } = getCompanyContext(req);

//     console.log("GET TEAM MEMBERS");
//     console.log("Company ID:", companyId);

//     const members = await teamService.listMembers(companyId);

//     return res.status(200).json({
//       success: true,
//       data: members,
//     });
//   } catch (error) {
//     console.error("GET TEAM MEMBERS ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch team members",
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | GET TEAM STATS
// | GET /api/v1/team/stats
// |--------------------------------------------------------------------------
// */
// const getTeamStats = async (req, res) => {
//   try {
//     const { companyId } = getCompanyContext(req);

//     const stats = await teamService.getStats(companyId);

//     return res.status(200).json({
//       success: true,
//       data: stats,
//     });
//   } catch (error) {
//     console.error("GET TEAM STATS ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch team statistics",
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | INVITE TEAM MEMBER
// | POST /api/v1/team/invite
// |--------------------------------------------------------------------------
// */
// const inviteTeamMember = async (req, res) => {
//   try {
//     const { companyId, userId } = getCompanyContext(req);

//     console.log("================================");
//     console.log("INVITE TEAM MEMBER");
//     console.log("Company ID:", companyId);
//     console.log("User ID:", userId);
//     console.log("Request Body:", req.body);
//     console.log("================================");

//     if (!req.body) {
//       return res.status(400).json({
//         success: false,
//         message: "Request body is required.",
//       });
//     }

//     const member = await teamService.inviteMember(
//       companyId,
//       userId,
//       req.body
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Team member invited successfully",
//       data: member,
//     });
//   } catch (error) {
//     console.error("INVITE TEAM MEMBER ERROR:", error);

//     return res.status(400).json({
//       success: false,
//       message: error.message || "Failed to invite team member",
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | UPDATE TEAM MEMBER ROLE
// | PATCH /api/v1/team/:id/role
// |--------------------------------------------------------------------------
// */
// const updateTeamMemberRole = async (req, res) => {
//   try {
//     const { companyId } = getCompanyContext(req);
//     const memberId = req.params.id;
//     const { role } = req.body;

//     if (!memberId) {
//       return res.status(400).json({
//         success: false,
//         message: "Team member ID is required.",
//       });
//     }

//     if (!role) {
//       return res.status(400).json({
//         success: false,
//         message: "Role is required.",
//       });
//     }

//     const member = await teamService.updateRole(
//       companyId,
//       memberId,
//       role
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Team member role updated successfully",
//       data: member,
//     });
//   } catch (error) {
//     console.error("UPDATE TEAM MEMBER ROLE ERROR:", error);

//     return res.status(400).json({
//       success: false,
//       message: error.message || "Failed to update team member role",
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | DELETE TEAM MEMBER
// | DELETE /api/v1/team/:id
// |--------------------------------------------------------------------------
// */
// const deleteTeamMember = async (req, res) => {
//   try {
//     const { companyId } = getCompanyContext(req);
//     const memberId = req.params.id;

//     if (!memberId) {
//       return res.status(400).json({
//         success: false,
//         message: "Team member ID is required.",
//       });
//     }

//     await teamService.removeMember(companyId, memberId);

//     return res.status(200).json({
//       success: true,
//       message: "Team member removed successfully",
//     });
//   } catch (error) {
//     console.error("DELETE TEAM MEMBER ERROR:", error);

//     return res.status(400).json({
//       success: false,
//       message: error.message || "Failed to remove team member",
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | LIST CUSTOM ROLES
// | GET /api/v1/team/roles
// |--------------------------------------------------------------------------
// */
// const listCustomRoles = async (req, res) => {
//   try {
//     const { companyId } = getCompanyContext(req);

//     const roles = await teamService.listCustomRoles(companyId);

//     return res.status(200).json({
//       success: true,
//       data: roles,
//     });
//   } catch (error) {
//     console.error("LIST CUSTOM ROLES ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch custom roles",
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | CREATE CUSTOM ROLE
// | POST /api/v1/team/roles
// |--------------------------------------------------------------------------
// */
// const createCustomRole = async (req, res) => {
//   try {
//     const { companyId } = getCompanyContext(req);

//     if (!req.body) {
//       return res.status(400).json({
//         success: false,
//         message: "Request body is required.",
//       });
//     }

//     const role = await teamService.createCustomRole(companyId, req.body);

//     return res.status(201).json({
//       success: true,
//       message: "Custom role created successfully",
//       data: role,
//     });
//   } catch (error) {
//     console.error("CREATE CUSTOM ROLE ERROR:", error);

//     return res.status(400).json({
//       success: false,
//       message: error.message || "Failed to create custom role",
//     });
//   }
// };
// /* =========================================================
//    ACCEPT TEAM INVITATION
// ========================================================= */

// const acceptTeamInvitation = async (req, res) => {
//   try {
//     const { token } = req.body || {};

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: "Invitation token is required.",
//       });
//     }

//     const member =
//       await teamService.acceptInvitation(token);

//     return res.status(200).json({
//       success: true,
//       message: "Invitation accepted successfully.",
//       data: member,
//     });
//   } catch (error) {
//     console.error(
//       "ACCEPT TEAM INVITATION ERROR:",
//       error
//     );

//     return res.status(400).json({
//       success: false,
//       message:
//         error.message ||
//         "Unable to accept invitation.",
//     });
//   }
// };
// /*
// |--------------------------------------------------------------------------
// | DELETE CUSTOM ROLE
// | DELETE /api/v1/team/roles/:id
// |--------------------------------------------------------------------------
// */
// const deleteCustomRole = async (req, res) => {
//   try {
//     const { companyId } = getCompanyContext(req);
//     const roleId = req.params.id;

//     if (!roleId) {
//       return res.status(400).json({
//         success: false,
//         message: "Role ID is required.",
//       });
//     }

//     await teamService.deleteCustomRole(companyId, roleId);

//     return res.status(200).json({
//       success: true,
//       message: "Custom role removed successfully",
//     });
//   } catch (error) {
//     console.error("DELETE CUSTOM ROLE ERROR:", error);

//     return res.status(400).json({
//       success: false,
//       message: error.message || "Failed to remove custom role",
//     });
//   }
// };

// module.exports = {
//   getTeamMembers,
//   getTeamStats,
//   inviteTeamMember,
//   acceptTeamInvitation,
//   updateTeamMemberRole,
//   deleteTeamMember,
//   listCustomRoles,
//   createCustomRole,
//   deleteCustomRole,
// };
















const prisma = require("../../config/prisma");
const teamService = require("../services/teamService");

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
   * Always get the companyId from the database.
   * Do NOT use a hard-coded company ID.
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
   * This prevents stale/broken User.companyId values from reaching
   * the TeamMember foreign key.
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
| LIST CUSTOM ROLES
| GET /api/v1/team/roles
|--------------------------------------------------------------------------
*/
const listCustomRoles = async (req, res) => {
  try {
    const { companyId, userId } = await getCompanyContext(req);

    console.log("LIST CUSTOM ROLES");
    console.log("Company ID:", companyId);
    console.log("User ID:", userId);

    const roles = await teamService.listCustomRoles(companyId);

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("LIST CUSTOM ROLES ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch custom roles",
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

    await teamService.deleteCustomRole(companyId, roleId);

    return res.status(200).json({
      success: true,
      message: "Custom role removed successfully",
    });
  } catch (error) {
    console.error("DELETE CUSTOM ROLE ERROR:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to remove custom role",
    });
  }
};

module.exports = {
  getTeamMembers,
  getTeamStats,
  inviteTeamMember,
  acceptTeamInvitation,
  updateTeamMemberRole,
  deleteTeamMember,
  listCustomRoles,
  createCustomRole,
  deleteCustomRole,
};
