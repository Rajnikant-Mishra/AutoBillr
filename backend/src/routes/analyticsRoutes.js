// 




const express = require("express");
const router = express.Router();

const { getAnalyticsData } = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

router.use(authMiddleware);

router.get(
  "/overview",
  requirePermission(PERMISSIONS.ANALYTICS_VIEW),
  getAnalyticsData
);

module.exports = router;