// const express = require("express");
// const router = express.Router();

// const {
//   register,
//   login,
//   redirectToGoogle,
//   handleGoogleCallback,
//   forgotPassword,
//   verifyResetOtp,
//   resetPassword,
// } = require("../controllers/authController");

// // Manual Auth Routes
// router.post("/register", register);
// router.post("/login", login);

// // Password Reset OTP Routes
// router.post("/forgot-password", forgotPassword);
// router.post("/verify-reset-otp", verifyResetOtp);
// router.post("/reset-password", resetPassword);

// // Google OAuth Routes
// router.get("/google", redirectToGoogle);
// router.get("/google/callback", handleGoogleCallback);

// module.exports = router;







const express = require("express");
const router = express.Router();

const {
  register,
  login,
  redirectToGoogle,
  handleGoogleCallback,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePlan,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.put("/change-plan", authMiddleware, changePlan);

router.get("/google", redirectToGoogle);
router.get("/google/callback", handleGoogleCallback);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;