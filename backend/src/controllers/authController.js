const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const prisma = require("../../config/prisma");
const generateToken = require("../utils/generateToken");

// =====================================================
// GOOGLE OAUTH CONFIG
// =====================================================
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const REDIRECT_URI = `${BACKEND_URL}/api/v1/auth/google/callback`;

// =====================================================
// EMAIL TRANSPORTER HELPER
// =====================================================
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
};

const sendOtpEmail = async (email, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"AutoBillr Support" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: email,
    subject: `${otp} is your AutoBillr Password Reset OTP`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2d7a78; margin-bottom: 8px;">AutoBillr</h2>
        <p style="color: #334155; font-size: 14px;">A password reset request was received for your account. Use this 6-digit verification code to proceed:</p>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2d7a78;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">This OTP is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// =====================================================
// 1. REDIRECT TO GOOGLE
// =====================================================
const redirectToGoogle = (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });

  return res.redirect(`${rootUrl}?${params.toString()}`);
};

// =====================================================
// 2. GOOGLE OAUTH CALLBACK
// =====================================================
const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=access_denied`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error("Google Token Exchange Failed:", tokenData);
      return res.redirect(`${FRONTEND_URL}/login?error=token_failed`);
    }

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const googleUser = await userResponse.json();
    const normalizedEmail = googleUser.email?.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { company: true },
    });

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=account_not_found`);
    }

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    const firstName = encodeURIComponent(user.firstName || "");
    const lastName = encodeURIComponent(user.lastName || "");
    const email = encodeURIComponent(user.email || "");

    return res.redirect(
      `${FRONTEND_URL}/login?token=${token}&companyId=${user.companyId || ""}&userId=${user.id}&firstName=${firstName}&lastName=${lastName}&email=${email}`
    );
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// =====================================================
// 3. REGISTER
// =====================================================
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      companyName,
      role,
      companySize,
      industry,
      planId,
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPlanId = planId?.trim().toLowerCase();

    if (!firstName?.trim()) return res.status(400).json({ success: false, message: "First name is required" });
    if (!lastName?.trim()) return res.status(400).json({ success: false, message: "Last name is required" });
    if (!normalizedEmail) return res.status(400).json({ success: false, message: "Email is required" });
    if (!password) return res.status(400).json({ success: false, message: "Password is required" });
    if (password.length < 12) return res.status(400).json({ success: false, message: "Password must be at least 12 characters" });
    if (!companyName?.trim()) return res.status(400).json({ success: false, message: "Company name is required" });

    const roleMap = {
      Owner: "OWNER",
      "CFO / VP Finance": "CFO",
      Controller: "CONTROLLER",
      "Finance Manager": "FINANCE_MANAGER",
      Other: "OTHER",
    };

    const userRole = roleMap[role];
    if (!userRole) return res.status(400).json({ success: false, message: "Invalid role" });

    if (!normalizedPlanId) return res.status(400).json({ success: false, message: "Subscription plan is required" });

    const allowedPlans = {
      starter: "Starter",
      professional: "Professional",
      enterprise: "Enterprise",
    };

    const planName = allowedPlans[normalizedPlanId];
    if (!planName) return res.status(400).json({ success: false, message: `Invalid subscription plan: ${planId}` });

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const verifiedEmailRecord = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        verified: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!verifiedEmailRecord) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before creating your account.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findFirst({ where: { name: planName } });
      if (!plan) throw new Error(`Subscription plan "${planName}" does not exist in database`);

      const passwordHash = await bcrypt.hash(password, 12);

      const company = await tx.company.create({
        data: {
          name: companyName.trim(),
          companySize: companySize || "1-10",
          industry: industry || "SaaS / Software",
        },
      });

      const user = await tx.user.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          passwordHash,
          role: userRole,
          companyId: company.id,
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: plan.id,
          status: "TRIALING",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
        include: { plan: true },
      });

      await tx.emailVerification.delete({ where: { id: verifiedEmailRecord.id } });

      return { company, user, subscription };
    });

    const token = generateToken({
      userId: result.user.id,
      companyId: result.company.id,
      role: result.user.role,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        role: result.user.role,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        companySize: result.company.companySize,
        industry: result.company.industry,
      },
      subscription: {
        id: result.subscription.id,
        status: result.subscription.status,
        trialEndsAt: result.subscription.trialEndsAt,
        plan: result.subscription.plan,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed. Please try again later.",
    });
  }
};

// =====================================================
// 4. LOGIN
// =====================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { company: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      company: {
        id: user.company?.id,
        name: user.company?.name,
        companySize: user.company?.companySize,
        industry: user.company?.industry,
      },
      subscription: null,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};

// =====================================================
// 5. FORGOT PASSWORD (GENERATE & SEND OTP)
// =====================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = Number(process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES) || 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await prisma.emailVerification.deleteMany({
      where: { email: normalizedEmail },
    });

    await prisma.emailVerification.create({
      data: {
        email: normalizedEmail,
        token: otp,
        verified: false,
        expiresAt,
      },
    });

    await sendOtpEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request. Please try again later.",
    });
  }
};

// =====================================================
// 6. VERIFY RESET OTP
// =====================================================
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const cleanOtp = otp?.trim();

    if (!normalizedEmail || !cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const record = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        token: cleanOtp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Please enter your new password.",
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// =====================================================
// 7. RESET PASSWORD
// =====================================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 12 characters long",
      });
    }

    const validRecord = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        ...(otp ? { token: otp.trim() } : { verified: true }),
        expiresAt: { gt: new Date() },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!validRecord) {
      return res.status(400).json({
        success: false,
        message: "Session expired or code unverified. Please restart reset request.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });

    await prisma.emailVerification.deleteMany({
      where: { email: normalizedEmail },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful! Please log in with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again later.",
    });
  }
};

module.exports = {
  redirectToGoogle,
  handleGoogleCallback,
  register,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};