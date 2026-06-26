// routes/project.routes.js

import express from "express";

import {
  createProject,
  getProjects,
  updateMilestone,
  createMilestone,
} from "../controllers/project.controller.js";

const router = express.Router();
router.route("/")
  .get(getProjects)
  .post(createProject);

router.post(
  "/:projectId/milestones",
  createMilestone
);

router.patch(
  "/:projectId/milestones/:milestoneIndex",
  updateMilestone
);
export default router;