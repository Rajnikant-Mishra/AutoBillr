
const prisma = require("../../config/prisma");

const {
  validateEmailDomain,
  isValidEmailFormat,
} = require("../services/emailValidationService");

const {
  generateVerificationToken,
} = require("../utils/crypto");

const {
  sendVerificationEmail,
} = require("../services/emailService");
const {
  notifyEmailVerified,
} = require("../websocket/emailVerificationSocket");
// =====================================================
// CHECK EMAIL
// POST /api/v1/email-verification/check-email
// =====================================================

const checkEmail = async (req, res) => {
  console.log(">>> CHECK EMAIL START");

  try {
    // -------------------------------------------------
    // 1. GET EMAIL
    // -------------------------------------------------

    const email = req.body?.email?.trim().toLowerCase();

    const firstName = req.body?.firstName?.trim() || "";

    console.log(">>> EMAIL:", email);

    // -------------------------------------------------
    // 2. CHECK EMAIL FORMAT
    // -------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    if (!isValidEmailFormat(email)) {
      return res.status(422).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // -------------------------------------------------
    // 3. CHECK DOMAIN / MX
    // -------------------------------------------------

    console.log(">>> Checking MX:", email);

    const domainResult = await validateEmailDomain(email);

    console.log(">>> MX RESULT:", domainResult);

    if (!domainResult.valid) {
      return res.status(422).json({
        success: false,
        message:
          domainResult.reason === "invalid_format"
            ? "Please enter a valid email address."
            : "This email domain cannot receive mail.",
      });
    }

    // -------------------------------------------------
    // 4. CHECK EXISTING USER
    // -------------------------------------------------

    console.log(">>> Checking existing user");

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // -------------------------------------------------
    // 5. GENERATE VERIFICATION TOKEN
    // -------------------------------------------------

    console.log(">>> Generating verification token");

    const tokenResult = generateVerificationToken();

    // Support either:
    // { token }
    // OR
    // { token, hash }

    const token =
      typeof tokenResult === "string"
        ? tokenResult
        : tokenResult.token;

    if (!token) {
      throw new Error("Unable to generate verification token");
    }

    console.log(">>> Token generated");

    // -------------------------------------------------
    // 6. EXPIRATION
    // -------------------------------------------------

    const expiresAt = new Date(
      Date.now() +
        (Number(
          process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES
        ) || 30) *
          60 *
          1000
    );

    // -------------------------------------------------
    // 7. REMOVE OLD UNVERIFIED TOKENS
    // -------------------------------------------------

    console.log(">>> Removing old verification tokens");

    await prisma.emailVerification.deleteMany({
      where: {
        email,
        verified: false,
      },
    });

    // -------------------------------------------------
    // 8. SAVE NEW VERIFICATION TOKEN
    // -------------------------------------------------

    console.log(">>> Saving verification token");

    await prisma.emailVerification.create({
      data: {
        email,
        token,
        verified: false,
        expiresAt,
      },
    });

    console.log(">>> Verification token saved");

    // -------------------------------------------------
    // 9. SEND EMAIL
    // -------------------------------------------------

    console.log(">>> Sending verification email with Resend");

    try {
      await sendVerificationEmail({
        email,
        firstName,
        token,
      });
    } catch (emailError) {
      console.error(
        ">>> RESEND EMAIL ERROR:",
        emailError
      );

      // Remove token because email was not sent
      await prisma.emailVerification.deleteMany({
        where: {
          email,
          token,
          verified: false,
        },
      });

      return res.status(503).json({
        success: false,
        message:
          "We could not send the verification email. Please try again.",
      });
    }

    // -------------------------------------------------
    // 10. SUCCESS
    // -------------------------------------------------

    console.log(
      ">>> VERIFICATION EMAIL SENT SUCCESSFULLY"
    );

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
      email,
    });
  } catch (error) {
    console.error(
      ">>> CHECK EMAIL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process your email address. Please try again.",
    });
  }
};

// =====================================================
// VERIFY EMAIL
// GET /api/v1/email-verification/verify?token=...
// =====================================================

const verifyEmail = async (req, res) => {
  console.log(">>> VERIFY EMAIL START");

  try {
    // -------------------------------------------------
    // 1. GET TOKEN
    // -------------------------------------------------

    const token = req.query?.token;

    if (
      typeof token !== "string" ||
      !token.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or missing verification token.",
      });
    }

    // -------------------------------------------------
    // 2. FIND TOKEN
    // -------------------------------------------------

    const verification =
      await prisma.emailVerification.findUnique({
        where: {
          token,
        },
      });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message:
          "This verification link is invalid or has already been used.",
      });
    }

    // -------------------------------------------------
    // 3. ALREADY VERIFIED
    // -------------------------------------------------

    if (verification.verified === true) {
      console.log(
        ">>> EMAIL ALREADY VERIFIED:",
        verification.email
      );

      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        verified: true,
        message: "Email has already been verified.",
        email: verification.email,
      });
    }

    // -------------------------------------------------
    // 4. CHECK EXPIRATION
    // -------------------------------------------------

    if (
      verification.expiresAt.getTime() <
      Date.now()
    ) {
      return res.status(410).json({
        success: false,
        message:
          "This verification link has expired. Please request a new one.",
      });
    }

    // -------------------------------------------------
    // 5. MARK VERIFIED
    // -------------------------------------------------

    const updatedVerification =
      await prisma.emailVerification.update({
        where: {
          id: verification.id,
        },
        data: {
          verified: true,
        },
      });
       console.log(
      ">>> EMAIL VERIFIED:",
      updatedVerification.email
    );
notifyEmailVerified(
  updatedVerification.email
);
   

    // -------------------------------------------------
    // 6. SUCCESS
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Email verified successfully.",
      email: updatedVerification.email,
    });
  } catch (error) {
    console.error(
      ">>> VERIFY EMAIL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify email. Please try again.",
    });
  }
};

// =====================================================
// CHECK VERIFICATION STATUS
// GET /api/v1/email-verification/status?email=...
//
// THIS IS IMPORTANT FOR DEVICE A
// =====================================================

const getVerificationStatus = async (req, res) => {
  try {
    const email = req.query?.email
      ?.trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Email address is required.",
      });
    }

    console.log(
      ">>> CHECK VERIFICATION STATUS:",
      email
    );

    const verification =
      await prisma.emailVerification.findFirst({
        where: {
          email,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          email: true,
          verified: true,
          expiresAt: true,
        },
      });

    // No verification record
    if (!verification) {
      return res.status(200).json({
        success: true,
        verified: false,
      });
    }

    // Expired
    if (
      !verification.verified &&
      verification.expiresAt.getTime() <
        Date.now()
    ) {
      return res.status(200).json({
        success: true,
        verified: false,
        expired: true,
      });
    }

    // Verified
    if (verification.verified === true) {
      return res.status(200).json({
        success: true,
        verified: true,
        email: verification.email,
      });
    }

    // Not verified yet
    return res.status(200).json({
      success: true,
      verified: false,
    });
  } catch (error) {
    console.error(
      ">>> STATUS CHECK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      verified: false,
      message:
        "Unable to check verification status.",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  checkEmail,
  verifyEmail,
  getVerificationStatus,
};

