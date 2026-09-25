const teamService = require("../services/teamService");

/*
|--------------------------------------------------------------------------
| TEMPORARY COMPANY ID
|--------------------------------------------------------------------------
| Replace this with the companyId coming from authenticated JWT user later.
*/
const TEMP_COMPANY_ID = "cmtv6r6z30000v0vfcly55d5w";

/*
|--------------------------------------------------------------------------
| Get company context
|--------------------------------------------------------------------------
*/
const getCompanyContext = (req) => {
  const companyId = req.companyId || TEMP_COMPANY_ID;
  const userId = req.user?.id || null;

  return { companyId, userId };
};

/*
|--------------------------------------------------------------------------
| GET ALL TEAM MEMBERS
| GET /api/v1/team
|--------------------------------------------------------------------------
*/
const getTeamMembers = async (req, res) => {
  try {
    const { companyId } = getCompanyContext(req);

    console.log("GET TEAM MEMBERS");
    console.log("Company ID:", companyId);

    const members = await teamService.listMembers(companyId);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("GET TEAM MEMBERS ERROR:", error);

    return res.status(500).json({
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
    const { companyId } = getCompanyContext(req);

    const stats = await teamService.getStats(companyId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("GET TEAM STATS ERROR:", error);

    return res.status(500).json({
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
    const { companyId, userId } = getCompanyContext(req);

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

    return res.status(400).json({
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
    const { companyId } = getCompanyContext(req);
    const memberId = req.params.id;
    const { role } = req.body;

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

    return res.status(400).json({
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
    const { companyId } = getCompanyContext(req);
    const memberId = req.params.id;

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

    return res.status(400).json({
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
    const { companyId } = getCompanyContext(req);

    const roles = await teamService.listCustomRoles(companyId);

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("LIST CUSTOM ROLES ERROR:", error);

    return res.status(500).json({
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
    const { companyId } = getCompanyContext(req);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const role = await teamService.createCustomRole(companyId, req.body);

    return res.status(201).json({
      success: true,
      message: "Custom role created successfully",
      data: role,
    });
  } catch (error) {
    console.error("CREATE CUSTOM ROLE ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create custom role",
    });
  }
};
/* =========================================================
   ACCEPT TEAM INVITATION
========================================================= */

const acceptTeamInvitation = async (req, res) => {
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
      message: "Invitation accepted successfully.",
      data: member,
    });
  } catch (error) {
    console.error(
      "ACCEPT TEAM INVITATION ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to accept invitation.",
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
    const { companyId } = getCompanyContext(req);
    const roleId = req.params.id;

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

    return res.status(400).json({
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