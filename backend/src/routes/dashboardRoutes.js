const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboardController");

// Use the SAME protect middleware that invoices / clients / projects use
const { protect } = require("../middleware/auth");   // ← check the exact path & name in your project

router.get("/dashboard", protect, getDashboard);

module.exports = router;