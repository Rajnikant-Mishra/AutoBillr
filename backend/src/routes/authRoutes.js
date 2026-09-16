const express = require("express");
const router = express.Router();

const {
  register,
  login,
  redirectToGoogle,
  handleGoogleCallback,
} = require("../controllers/authController");

// Manual Auth Routes
router.post("/register", register);
router.post("/login", login);

// Google OAuth Routes
router.get("/google", redirectToGoogle);
router.get("/google/callback", handleGoogleCallback);

module.exports = router;