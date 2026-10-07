// const express = require("express");
// const router = express.Router();

// const teamController = require("../controllers/teamController");
// const authMiddleware = require("../middleware/authMiddleware");
// const requirePermission = require("../middleware/requirePermission");
// const { PERMISSIONS } = require("../constants/permissions");

// /*
// |--------------------------------------------------------------------------
// | PUBLIC ROUTES (no auth)
// |--------------------------------------------------------------------------
// */

// // Accept invitation – public, must be before /:id routes
// router.post(
//   "/accept-invitation",
//   teamController.acceptTeamInvitation
// );

// /*
// |--------------------------------------------------------------------------
// | PROTECTED ROUTES
// |--------------------------------------------------------------------------
// */

// // Apply real auth to everything below
// router.use(authMiddleware);

// /*
// |--------------------------------------------------------------------------
// | STATIC ROUTES (must come BEFORE /:id routes)
// |--------------------------------------------------------------------------
// */

// // GET /api/v1/team
// router.get(
//   "/",
//   requirePermission(PERMISSIONS.TEAM_VIEW),
//   teamController.getTeamMembers
// );

// // GET /api/v1/team/stats
// router.get(
//   "/stats",
//   requirePermission(PERMISSIONS.TEAM_VIEW),
//   teamController.getTeamStats
// );

// // GET /api/v1/team/me  ← current user + role + permissions
// router.get("/me", (req, res) => {
//   res.json({
//     success: true,
//     role: req.user.role,
//     roleId: req.user.roleId || null,
//     permissions: req.user.permissions || [],
//     extraPermissions: req.user.extraPermissions || [],
//     data: {
//       role: req.user.role,
//       roleId: req.user.roleId || null,
//       permissions: req.user.permissions || [],
//       extraPermissions: req.user.extraPermissions || [],
//       user: {
//         userId: req.user.userId,
//         companyId: req.user.companyId,
//         email: req.user.email,
//       },
//     },
//   });
// });

// // GET /api/v1/team/roles
// router.get(
//   "/roles",
//   requirePermission(PERMISSIONS.ROLES_MANAGE),
//   teamController.listCustomRoles
// );

// // POST /api/v1/team/roles
// router.post(
//   "/roles",
//   requirePermission(PERMISSIONS.ROLES_MANAGE),
//   teamController.createCustomRole
// );

// // DELETE /api/v1/team/roles/:id
// router.delete(
//   "/roles/:id",
//   requirePermission(PERMISSIONS.ROLES_MANAGE),
//   teamController.deleteCustomRole
// );

// // POST /api/v1/team/invite
// router.post(
//   "/invite",
//   requirePermission(PERMISSIONS.TEAM_INVITE),
//   teamController.inviteTeamMember
// );

// /*
// |--------------------------------------------------------------------------
// | DYNAMIC ROUTES (must come AFTER static routes)
// |--------------------------------------------------------------------------
// */
// router.patch(
//   "/roles/:id",
//   requirePermission(PERMISSIONS.ROLES_MANAGE),
//   teamController.updateRolePermissions
// );

// router.patch(
//   "/:id/permissions",
//   requirePermission(PERMISSIONS.TEAM_EDIT_MEMBER),
//   teamController.updateTeamMemberPermissions
// );

// // PATCH /api/v1/team/:id/role
// router.patch(
//   "/:id/role",
//   requirePermission(PERMISSIONS.TEAM_EDIT_MEMBER),
//   teamController.updateTeamMemberRole
// );

// // DELETE /api/v1/team/:id
// router.delete(
//   "/:id",
//   requirePermission(PERMISSIONS.TEAM_REMOVE_MEMBER),
//   teamController.deleteTeamMember
// );

// module.exports = router;


















const express = require("express");
const router = express.Router();

const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

/* =========================================================
   PUBLIC ROUTES (no auth)
========================================================= */

router.post(
  "/accept-invitation",
  teamController.acceptTeamInvitation
);

/* =========================================================
   PROTECTED ROUTES
========================================================= */

router.use(authMiddleware);

/* =========================================================
   STATIC ROUTES (BEFORE /:id)
========================================================= */

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

router.get("/me", (req, res) => {
  res.json({
    success: true,
    role: req.user.role,
    roleId: req.user.roleId || null,
    permissions: req.user.permissions || [],
    extraPermissions: req.user.extraPermissions || [],
    data: {
      role: req.user.role,
      roleId: req.user.roleId || null,
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

/* =========================================================
   ROLES
========================================================= */

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

/* =========================================================
   INVITE
========================================================= */

router.post(
  "/invite",
  requirePermission(PERMISSIONS.TEAM_INVITE),
  teamController.inviteTeamMember
);

/* =========================================================
   DYNAMIC MEMBER ROUTES (AFTER static routes)
========================================================= */

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