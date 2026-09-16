

const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const generateToken = require("../utils/generateToken");

// =====================================================
// GOOGLE OAUTH CONFIG
// =====================================================
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "392855209441-7731ssbuuadnl0q7csjhpvsk1dlsu6ue.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "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";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const REDIRECT_URI = `${BACKEND_URL}/api/v1/auth/google/callback`;

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
    prompt: "select_account", // Hamesha 'Choose an account' screen khulegi
    access_type: "offline",
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
    // 1. Code ke badle Google se tokens exchange karein
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

    // 2. Google se user profile data layein
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const googleUser = await userResponse.json();
    const normalizedEmail = googleUser.email?.trim().toLowerCase();

    // 3. Check karein ki user pehle se database mein hai ya nahi
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { company: true },
    });

    // ❌ USER NAHI MILA: Naya account create MAT karo, seedhe Login/Register flow par bhej do
    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=account_not_found`);
    }

    // 4. User mil gaya: JWT token generate karein
    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    // 5. Token aur details ke sath Frontend Dashboard par redirect karein
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
// REGISTER
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
// LOGIN
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

module.exports = {
  redirectToGoogle,
  handleGoogleCallback,
  register,
  login,
};