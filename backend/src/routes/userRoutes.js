
const express = require("express");
const router = express.Router();

const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

// =====================================================
// PUBLIC ROUTES
// =====================================================

router.post(
  "/accept-invitation",
  teamController.acceptTeamInvitation
);

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);

// =====================================================
// CURRENT AUTHENTICATED ORGANIZATION CONTEXT
// GET /api/v1/team/me
// =====================================================

router.get("/me", (req, res) => {
  return res.status(200).json({
    success: true,
    role: req.user.role,
    roleId: req.user.roleId || null,
    isOwner: Boolean(req.user.isOwner),
    permissions: req.user.permissions || [],
    extraPermissions: req.user.extraPermissions || [],
    data: {
      role: req.user.role,
      roleId: req.user.roleId || null,
      isOwner: Boolean(req.user.isOwner),
      permissions: req.user.permissions || [],
      extraPermissions: req.user.extraPermissions || [],
      user: {
        userId: req.user.userId,
        companyId: req.user.companyId,
        email: req.user.email,
      },
    },
  });
});

// =====================================================
// TEAM MEMBERS
// =====================================================

router.get(
  "/",
  requirePermission(PERMISSIONS.TEAM_VIEW),
  teamController.getTeamMembers
);

router.get(
  "/stats",
  requirePermission(PERMISSIONS.TEAM_VIEW),
  teamController.getTeamStats
);

// =====================================================
// CUSTOM ROLES
// =====================================================

router.get(
  "/roles",
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  teamController.listCustomRoles
);

router.post(
  "/roles",
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  teamController.createCustomRole
);

router.patch(
  "/roles/:id",
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  teamController.updateRolePermissions
);

router.delete(
  "/roles/:id",
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  teamController.deleteCustomRole
);

// =====================================================
// INVITE TEAM MEMBER
// =====================================================

router.post(
  "/invite",
  requirePermission(PERMISSIONS.TEAM_INVITE),
  teamController.inviteTeamMember
);

// =====================================================
// MEMBER MANAGEMENT
// =====================================================

router.patch(
  "/:id/permissions",
  requirePermission(PERMISSIONS.TEAM_EDIT_MEMBER),
  teamController.updateTeamMemberPermissions
);

router.patch(
  "/:id/role",
  requirePermission(PERMISSIONS.TEAM_EDIT_MEMBER),
  teamController.updateTeamMemberRole
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.TEAM_REMOVE_MEMBER),
  teamController.deleteTeamMember
);

module.exports = router;
