// const express = require("express");

// const router = express.Router();

// const { getDashboard } = require("../controllers/dashboardController");

// router.get("/", getDashboard);

// module.exports = router;



const express = require("express");
const router = express.Router();

const { getDashboard } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

router.use(authMiddleware);

router.get(
  "/",
  requirePermission(PERMISSIONS.DASHBOARD_VIEW),
  getDashboard
);

module.exports = router;