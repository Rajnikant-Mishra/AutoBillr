const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| Project Routes
|--------------------------------------------------------------------------
|
| Mounted from server.js as:
|
| /api/v1/projects
|
| Example:
| GET    /api/v1/projects
| POST   /api/v1/projects
| GET    /api/v1/projects/:id
| PUT    /api/v1/projects/:id
| DELETE /api/v1/projects/:id
|
*/

/*
|--------------------------------------------------------------------------
| Projects
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  projectController.getProjects
);

router.post(
  "/",
  authMiddleware,
  projectController.createProject
);

router.get(
  "/:id",
  authMiddleware,
  projectController.getProjectById
);

router.put(
  "/:id",
  authMiddleware,
  projectController.updateProject
);

router.patch(
  "/:id",
  authMiddleware,
  projectController.updateProject
);

router.delete(
  "/:id",
  authMiddleware,
  projectController.deleteProject
);

/*
|--------------------------------------------------------------------------
| Milestones
|--------------------------------------------------------------------------
*/

router.post(
  "/:projectId/milestones",
  authMiddleware,
  projectController.createMilestone
);

router.patch(
  "/:projectId/milestones/:milestoneId",
  authMiddleware,
  projectController.updateMilestone
);

router.delete(
  "/:projectId/milestones/:milestoneId",
  authMiddleware,
  projectController.deleteMilestone
);

module.exports = router;