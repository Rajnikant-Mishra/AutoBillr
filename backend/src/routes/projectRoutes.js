const express = require("express");

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// use YOUR real auth middleware file path
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authMiddleware);
router.get("/", authMiddleware, getProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;