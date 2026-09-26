// const express = require("express");

// const router = express.Router();

// const projectController = require("../controllers/projectController");
// const authMiddleware = require("../middleware/authMiddleware");

// /*
// |--------------------------------------------------------------------------
// | Project Routes
// |--------------------------------------------------------------------------
// |
// | Mounted from server.js as:
// |
// | /api/v1/projects
// |
// | Example:
// | GET    /api/v1/projects
// | POST   /api/v1/projects
// | GET    /api/v1/projects/:id
// | PUT    /api/v1/projects/:id
// | DELETE /api/v1/projects/:id
// |
// */

// /*
// |--------------------------------------------------------------------------
// | Projects
// |--------------------------------------------------------------------------
// */

// router.get(
//   "/",
//   authMiddleware,
//   projectController.getProjects
// );

// router.post(
//   "/",
//   authMiddleware,
//   projectController.createProject
// );

// router.get(
//   "/:id",
//   authMiddleware,
//   projectController.getProjectById
// );

// router.put(
//   "/:id",
//   authMiddleware,
//   projectController.updateProject
// );

// router.patch(
//   "/:id",
//   authMiddleware,
//   projectController.updateProject
// );

// router.delete(
//   "/:id",
//   authMiddleware,
//   projectController.deleteProject
// );

// /*
// |--------------------------------------------------------------------------
// | Milestones
// |--------------------------------------------------------------------------
// */

// router.post(
//   "/:projectId/milestones",
//   authMiddleware,
//   projectController.createMilestone
// );

// router.patch(
//   "/:projectId/milestones/:milestoneId",
//   authMiddleware,
//   projectController.updateMilestone
// );

// router.delete(
//   "/:projectId/milestones/:milestoneId",
//   authMiddleware,
//   projectController.deleteMilestone
// );

// module.exports = router;






















const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| Projects
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requirePermission(PERMISSIONS.PROJECTS_VIEW),
  projectController.getProjects
);

router.post(
  "/",
  requirePermission(PERMISSIONS.PROJECTS_CREATE),
  projectController.createProject
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.PROJECTS_VIEW),
  projectController.getProjectById
);

router.put(
  "/:id",
  requirePermission(PERMISSIONS.PROJECTS_EDIT),
  projectController.updateProject
);

router.patch(
  "/:id",
  requirePermission(PERMISSIONS.PROJECTS_EDIT),
  projectController.updateProject
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.PROJECTS_DELETE),
  projectController.deleteProject
);

/*
|--------------------------------------------------------------------------
| Milestones
|--------------------------------------------------------------------------
*/

router.post(
  "/:projectId/milestones",
  requirePermission(PERMISSIONS.PROJECTS_MILESTONES),
  projectController.createMilestone
);

router.patch(
  "/:projectId/milestones/:milestoneId",
  requirePermission(PERMISSIONS.PROJECTS_MILESTONES),
  projectController.updateMilestone
);

router.delete(
  "/:projectId/milestones/:milestoneId",
  requirePermission(PERMISSIONS.PROJECTS_MILESTONES),
  projectController.deleteMilestone
);

module.exports = router;