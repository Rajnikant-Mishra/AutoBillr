const express = require("express");
const router = express.Router();
const {
  getAutomationOverview,
  saveAutomation,
} = require("../controllers/automationController");

let authMiddleware;
try {
  authMiddleware = require("../middlewares/authMiddleware");
} catch (e) {
  authMiddleware = (req, res, next) => next();
}

router.get("/overview", authMiddleware, getAutomationOverview);
router.post("/save", authMiddleware, saveAutomation);

module.exports = router;