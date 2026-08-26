const express = require("express");

const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

const validate = require("../middleware/validateMiddleware");

const {
  registerSchema,
  loginSchema,
} = require("../validations/authValidation");

// ===============================
// REGISTER
// ===============================

router.post(
  "/register",
  validate(registerSchema),
  register
);

// ===============================
// LOGIN
// ===============================

router.post(
  "/login",
  validate(loginSchema),
  login
);

module.exports = router;