const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

// Projects
router.get("/",       authMiddleware, projectController.getProjects);
router.post("/",      authMiddleware, projectController.createProject);
router.get("/:id",    authMiddleware, projectController.getProjectById);
router.put("/:id",    authMiddleware, projectController.updateProject);
router.delete("/:id", authMiddleware, projectController.deleteProject);

// Milestones (only once)
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