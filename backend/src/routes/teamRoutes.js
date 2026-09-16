const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");

/*
|--------------------------------------------------------------------------
| TEMPORARY AUTH / COMPANY MIDDLEWARE
|--------------------------------------------------------------------------
| Later replace this with your real JWT middleware.
|--------------------------------------------------------------------------
*/
const protect = (req, res, next) => {
  next();
};

const requireCompany = (req, res, next) => {
  /*
   * TEMPORARY COMPANY
   * This MUST match the Company that exists in PostgreSQL.
   */
  req.companyId = "cmtv6r6z30000v0vfcly55d5w";

  req.user = {
    id: null,
  };

  console.log("TEAM COMPANY ID:", req.companyId);

  next();
};

/*
|--------------------------------------------------------------------------
| GET TEAM MEMBERS
| GET /api/v1/team
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  protect,
  requireCompany,
  teamController.getTeamMembers
);

/*
|--------------------------------------------------------------------------
| GET TEAM STATS
| GET /api/v1/team/stats
|--------------------------------------------------------------------------
*/
router.get(
  "/stats",
  protect,
  requireCompany,
  teamController.getTeamStats
);

/*
|--------------------------------------------------------------------------
| LIST CUSTOM ROLES
| GET /api/v1/team/roles
|--------------------------------------------------------------------------
| IMPORTANT: Place static routes BEFORE /:id routes
*/
router.get(
  "/roles",
  protect,
  requireCompany,
  teamController.listCustomRoles
);

/*
|--------------------------------------------------------------------------
| CREATE CUSTOM ROLE
| POST /api/v1/team/roles
|--------------------------------------------------------------------------
*/
router.post(
  "/roles",
  protect,
  requireCompany,
  teamController.createCustomRole
);

/*
|--------------------------------------------------------------------------
| DELETE CUSTOM ROLE
| DELETE /api/v1/team/roles/:id
|--------------------------------------------------------------------------
*/
router.delete(
  "/roles/:id",
  protect,
  requireCompany,
  teamController.deleteCustomRole
);

/*
|--------------------------------------------------------------------------
| INVITE TEAM MEMBER
| POST /api/v1/team/invite
|--------------------------------------------------------------------------
*/
router.post(
  "/invite",
  protect,
  requireCompany,
  teamController.inviteTeamMember
);

/*
|--------------------------------------------------------------------------
| UPDATE ROLE
| PATCH /api/v1/team/:id/role
|--------------------------------------------------------------------------
*/
router.patch(
  "/:id/role",
  protect,
  requireCompany,
  teamController.updateTeamMemberRole
);

/*
|--------------------------------------------------------------------------
| DELETE MEMBER
| DELETE /api/v1/team/:id
|--------------------------------------------------------------------------
*/
router.delete(
  "/:id",
  protect,
  requireCompany,
  teamController.deleteTeamMember
);

module.exports = router;