// const express = require("express");
// const router = express.Router();
// const {
//   getAutomationOverview,
//   saveAutomation,
// } = require("../controllers/automationController");

// let authMiddleware;
// try {
//   authMiddleware = require("../middlewares/authMiddleware");
// } catch (e) {
//   authMiddleware = (req, res, next) => next();
// }

// router.get("/overview", authMiddleware, getAutomationOverview);
// router.post("/save", authMiddleware, saveAutomation);

// module.exports = router;






const express = require("express");
const router = express.Router();

const {
  getAutomationOverview,
  saveAutomation,
} = require("../controllers/automationController");

const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

router.use(authMiddleware);

router.get(
  "/overview",
  requirePermission(PERMISSIONS.AUTOMATION_VIEW),
  getAutomationOverview
);

router.post(
  "/save",
  requirePermission(PERMISSIONS.AUTOMATION_MANAGE),
  saveAutomation
);

module.exports = router;