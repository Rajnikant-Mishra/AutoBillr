const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { verifySuperAdmin } = require("../middleware/superAdminMiddleware");
const {
  getPlatformStats,
  getAllCompanies,
} = require("../controllers/superAdminController");


router.use(authMiddleware);
router.use(verifySuperAdmin);

router.get("/stats", getPlatformStats);
router.get("/companies", getAllCompanies);

module.exports = router;