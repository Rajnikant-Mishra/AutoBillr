const express = require("express");

const router = express.Router();

const {
  checkEmail,
  verifyEmail,
  getVerificationStatus,
} = require("../controllers/emailVerificationController");

router.post(
  "/check-email",
  checkEmail
);

router.get(
  "/verify",
  verifyEmail
);

router.get(
  "/status",
  getVerificationStatus
);

module.exports = router;