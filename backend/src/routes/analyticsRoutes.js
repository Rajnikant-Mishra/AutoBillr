const express = require("express");
const router = express.Router();
const { getAnalyticsData } = require("../controllers/analyticsController");

let authMiddleware;
try {
  authMiddleware = require("../middlewares/authMiddleware");
} catch (e) {
  authMiddleware = (req, res, next) => next();
}

router.get("/overview", authMiddleware, getAnalyticsData);

module.exports = router;