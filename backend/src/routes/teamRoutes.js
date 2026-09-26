const express = require("express");
const router = express.Router();

const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (no auth)
|--------------------------------------------------------------------------
*/

// Accept invitation – public, must be before /:id routes
router.post(
  "/accept-invitation",
  teamController.acceptTeamInvitation
);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

// Apply real auth to everything below
router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| STATIC ROUTES (must come BEFORE /:id routes)
|--------------------------------------------------------------------------
*/

// GET /api/v1/team
router.get(
  "/",
  requirePermission(PERMISSIONS.TEAM_VIEW),
  teamController.getTeamMembers
);

// GET /api/v1/team/stats
router.get(
  "/stats",
  requirePermission(PERMISSIONS.TEAM_VIEW),
  teamController.getTeamStats
);

// GET /api/v1/team/me  ← current user + role + permissions
router.get("/me", (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        userId: req.user.userId,
        companyId: req.user.companyId,
      },
      role: req.user.role,
      permissions: req.user.permissions || [],
    },
  });
});

// GET /api/v1/team/roles
router.get(
  "/roles",
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  teamController.listCustomRoles
);

// POST /api/v1/team/roles
router.post(
  "/roles",
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  teamController.createCustomRole
);

// DELETE /api/v1/team/roles/:id
router.delete(
  "/roles/:id",
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  teamController.deleteCustomRole
);

// POST /api/v1/team/invite
router.post(
  "/invite",
  requirePermission(PERMISSIONS.TEAM_INVITE),
  teamController.inviteTeamMember
);

/*
|--------------------------------------------------------------------------
| DYNAMIC ROUTES (must come AFTER static routes)
|--------------------------------------------------------------------------
*/

// PATCH /api/v1/team/:id/role
router.patch(
  "/:id/role",
  requirePermission(PERMISSIONS.TEAM_EDIT_MEMBER),
  teamController.updateTeamMemberRole
);

// DELETE /api/v1/team/:id
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.TEAM_REMOVE_MEMBER),
  teamController.deleteTeamMember
);

module.exports = router;