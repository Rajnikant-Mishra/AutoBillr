// const bcrypt = require("bcryptjs");
// const nodemailer = require("nodemailer");
// const prisma = require("../../config/prisma");
// const generateToken = require("../utils/generateToken");

// // =====================================================
// // GOOGLE OAUTH CONFIG
// // =====================================================
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
// const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// const REDIRECT_URI = `${BACKEND_URL}/api/v1/auth/google/callback`;

// // =====================================================
// // EMAIL TRANSPORTER HELPER
// // =====================================================
// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.MAIL_HOST,
//     port: Number(process.env.MAIL_PORT) || 587,
//     secure: process.env.MAIL_SECURE === "true",
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASSWORD,
//     },
//   });
// };

// const sendOtpEmail = async (email, otp) => {
//   const transporter = createTransporter();
//   const mailOptions = {
//     from: `"AutoBillr Support" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
//     to: email,
//     subject: `${otp} is your AutoBillr Password Reset OTP`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
//         <h2 style="color: #2d7a78; margin-bottom: 8px;">AutoBillr</h2>
//         <p style="color: #334155; font-size: 14px;">A password reset request was received for your account. Use this 6-digit verification code to proceed:</p>
//         <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
//           <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2d7a78;">${otp}</span>
//         </div>
//         <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">This OTP is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
//       </div>
//     `,
//   };

//   return transporter.sendMail(mailOptions);
// };

// // =====================================================
// // 1. REDIRECT TO GOOGLE
// // =====================================================
// const redirectToGoogle = (req, res) => {
//   const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
//   const params = new URLSearchParams({
//     client_id: GOOGLE_CLIENT_ID,
//     redirect_uri: REDIRECT_URI,
//     response_type: "code",
//     scope: "openid email profile",
//   });

//   return res.redirect(`${rootUrl}?${params.toString()}`);
// };

// // =====================================================
// // 2. GOOGLE OAUTH CALLBACK
// // =====================================================
// const handleGoogleCallback = async (req, res) => {
//   const { code } = req.query;

//   if (!code) {
//     return res.redirect(`${FRONTEND_URL}/login?error=access_denied`);
//   }

//   try {
//     const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         code,
//         client_id: GOOGLE_CLIENT_ID,
//         client_secret: GOOGLE_CLIENT_SECRET,
//         redirect_uri: REDIRECT_URI,
//         grant_type: "authorization_code",
//       }),
//     });

//     const tokenData = await tokenResponse.json();
//     if (!tokenData.access_token) {
//       console.error("Google Token Exchange Failed:", tokenData);
//       return res.redirect(`${FRONTEND_URL}/login?error=token_failed`);
//     }

//     const userResponse = await fetch(
//       "https://www.googleapis.com/oauth2/v2/userinfo",
//       {
//         headers: { Authorization: `Bearer ${tokenData.access_token}` },
//       }
//     );
//     const googleUser = await userResponse.json();
//     const normalizedEmail = googleUser.email?.trim().toLowerCase();

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//       include: { company: true },
//     });

//     if (!user) {
//       return res.redirect(`${FRONTEND_URL}/login?error=account_not_found`);
//     }

//     const token = generateToken({
//       userId: user.id,
//       companyId: user.companyId,
//       role: user.role,
//     });

//     const firstName = encodeURIComponent(user.firstName || "");
//     const lastName = encodeURIComponent(user.lastName || "");
//     const email = encodeURIComponent(user.email || "");

//     return res.redirect(
//       `${FRONTEND_URL}/login?token=${token}&companyId=${user.companyId || ""}&userId=${user.id}&firstName=${firstName}&lastName=${lastName}&email=${email}`
//     );
//   } catch (error) {
//     console.error("GOOGLE AUTH ERROR:", error);
//     return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
//   }
// };

// // =====================================================
// // 3. REGISTER
// // =====================================================
// const register = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       companyName,
//       role,
//       companySize,
//       industry,
//       planId,
//     } = req.body;

//     const normalizedEmail = email?.trim().toLowerCase();
//     const normalizedPlanId = planId?.trim().toLowerCase();

//     if (!firstName?.trim()) return res.status(400).json({ success: false, message: "First name is required" });
//     if (!lastName?.trim()) return res.status(400).json({ success: false, message: "Last name is required" });
//     if (!normalizedEmail) return res.status(400).json({ success: false, message: "Email is required" });
//     if (!password) return res.status(400).json({ success: false, message: "Password is required" });
//     if (password.length < 12) return res.status(400).json({ success: false, message: "Password must be at least 12 characters" });
//     if (!companyName?.trim()) return res.status(400).json({ success: false, message: "Company name is required" });

//     const roleMap = {
//       Owner: "OWNER",
//       "CFO / VP Finance": "CFO",
//       Controller: "CONTROLLER",
//       "Finance Manager": "FINANCE_MANAGER",
//       Other: "OTHER",
//     };

//     const userRole = roleMap[role];
//     if (!userRole) return res.status(400).json({ success: false, message: "Invalid role" });

//     if (!normalizedPlanId) return res.status(400).json({ success: false, message: "Subscription plan is required" });

//     const allowedPlans = {
//       starter: "Starter",
//       professional: "Professional",
//       enterprise: "Enterprise",
//     };

//     const planName = allowedPlans[normalizedPlanId];
//     if (!planName) return res.status(400).json({ success: false, message: `Invalid subscription plan: ${planId}` });

//     const existingUser = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "An account with this email already exists",
//       });
//     }

//     const verifiedEmailRecord = await prisma.emailVerification.findFirst({
//       where: {
//         email: normalizedEmail,
//         verified: true,
//       },
//       orderBy: { updatedAt: "desc" },
//     });

//     if (!verifiedEmailRecord) {
//       return res.status(403).json({
//         success: false,
//         message: "Please verify your email address before creating your account.",
//       });
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       const plan = await tx.plan.findFirst({ where: { name: planName } });
//       if (!plan) throw new Error(`Subscription plan "${planName}" does not exist in database`);

//       const passwordHash = await bcrypt.hash(password, 12);

//       const company = await tx.company.create({
//         data: {
//           name: companyName.trim(),
//           companySize: companySize || "1-10",
//           industry: industry || "SaaS / Software",
//         },
//       });

//       const user = await tx.user.create({
//         data: {
//           firstName: firstName.trim(),
//           lastName: lastName.trim(),
//           email: normalizedEmail,
//           passwordHash,
//           role: userRole,
//           companyId: company.id,
//         },
//       });

//      // Set trial period for the subscription
     
//       const TRIAL_DAYS = 14;
//       const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

//       const subscription = await tx.subscription.create({
//         data: {
//           companyId: company.id,
//           planId: plan.id,
//           status: "TRIALING",
//           trialEndsAt: trialEndsAt,
//         },
//         include: { plan: true },
//       });

//       await tx.emailVerification.delete({ where: { id: verifiedEmailRecord.id } });

//       return { company, user, subscription };
//     });

//     const token = generateToken({
//       userId: result.user.id,
//       companyId: result.company.id,
//       role: result.user.role,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Account created successfully",
//       token,
//       user: {
//         id: result.user.id,
//         firstName: result.user.firstName,
//         lastName: result.user.lastName,
//         email: result.user.email,
//         role: result.user.role,
//       },
//       company: {
//         id: result.company.id,
//         name: result.company.name,
//         companySize: result.company.companySize,
//         industry: result.company.industry,
//       },
//       subscription: {
//         id: result.subscription.id,
//         status: result.subscription.status,
//         trialEndsAt: result.subscription.trialEndsAt,
//         plan: result.subscription.plan,
//       },
//     });
//   } catch (error) {
//     console.error("REGISTER ERROR:", error);
//     if (error.code === "P2002") {
//       return res.status(409).json({ success: false, message: "An account with this email already exists" });
//     }
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Registration failed. Please try again later.",
//     });
//   }
// };

// // =====================================================
// // 4. LOGIN
// // =====================================================

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const normalizedEmail = email?.trim().toLowerCase();

//     if (!normalizedEmail || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required",
//       });
//     }

//     // 1. Find the existing user and company.
//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//       include: { company: true },
//     });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     // 2. Verify password BEFORE checking subscription status.
//     const passwordMatch = await bcrypt.compare(
//       password,
//       user.passwordHash
//     );

//     if (!passwordMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     // 3. Find the company's latest subscription.
//     const subscription = await prisma.subscription.findFirst({
//       where: { companyId: user.companyId },
//       orderBy: { createdAt: "desc" },
//       include: { plan: true },
//     });

//     if (!subscription) {
//       return res.status(403).json({
//         success: false,
//         code: "SUBSCRIPTION_REQUIRED",
//         message: "No subscription found. Please choose a plan.",
//       });
//     }

//     const now = new Date();

//     const trialExpired =
//       subscription.status === "TRIALING" &&
//       subscription.trialEndsAt &&
//       new Date(subscription.trialEndsAt) <= now;

//     const paidPeriodExpired =
//       subscription.status === "ACTIVE" &&
//       subscription.currentPeriodEnd &&
//       new Date(subscription.currentPeriodEnd) <= now;

//     const subscriptionInactive = [
//       "EXPIRED",
//       "PAST_DUE",
//       "CANCELED",
//     ].includes(subscription.status);

//     // 4. Mark an elapsed trial or paid period as expired.
//     if (trialExpired || paidPeriodExpired) {
//       await prisma.subscription.update({
//         where: { id: subscription.id },
//         data: { status: "EXPIRED" },
//       });
//     }

//     // 5. Block login for expired or inactive subscriptions.
//     if (
//       trialExpired ||
//       paidPeriodExpired ||
//       subscriptionInactive
//     ) {
//       return res.status(403).json({
//         success: false,
//         code: "SUBSCRIPTION_EXPIRED",
//         message:
//           "Your trial or subscription has expired. Choose a plan to continue.",
//         subscription: {
//           status: "EXPIRED",
//           plan: subscription.plan.name,
//           trialEndsAt: subscription.trialEndsAt,
//           currentPeriodEnd: subscription.currentPeriodEnd,
//         },
//       });
//     }

//     // 6. Only issue a normal login token for an eligible subscription.
//     const token = generateToken({
//       userId: user.id,
//       companyId: user.companyId,
//       role: user.role,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,

//       user: {
//         id: user.id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//       },

//       company: {
//         id: user.company?.id,
//         name: user.company?.name,
//         companySize: user.company?.companySize,
//         industry: user.company?.industry,
//       },

//       subscription: {
//         id: subscription.id,
//         status: subscription.status,
//         trialEndsAt: subscription.trialEndsAt,
//         currentPeriodEnd: subscription.currentPeriodEnd,
//         plan: subscription.plan,
//       },
//     });
//   } catch (error) {
//     console.error("LOGIN ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Login failed. Please try again later.",
//     });
//   }
// };

// // =====================================================
// // 5. FORGOT PASSWORD (GENERATE & SEND OTP)
// // =====================================================
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const normalizedEmail = email?.trim().toLowerCase();

//     if (!normalizedEmail) {
//       return res.status(400).json({ success: false, message: "Email is required" });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "No account found with this email address",
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiryMinutes = Number(process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES) || 10;
//     const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

//     await prisma.emailVerification.deleteMany({
//       where: { email: normalizedEmail },
//     });

//     await prisma.emailVerification.create({
//       data: {
//         email: normalizedEmail,
//         token: otp,
//         verified: false,
//         expiresAt,
//       },
//     });

//     await sendOtpEmail(normalizedEmail, otp);

//     return res.status(200).json({
//       success: true,
//       message: "Verification code sent to your email.",
//     });
//   } catch (error) {
//     console.error("FORGOT PASSWORD ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to process password reset request. Please try again later.",
//     });
//   }
// };

// // =====================================================
// // 6. VERIFY RESET OTP
// // =====================================================
// const verifyResetOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const normalizedEmail = email?.trim().toLowerCase();
//     const cleanOtp = otp?.trim();

//     if (!normalizedEmail || !cleanOtp) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and OTP are required",
//       });
//     }

//     const record = await prisma.emailVerification.findFirst({
//       where: {
//         email: normalizedEmail,
//         token: cleanOtp,
//         expiresAt: { gt: new Date() },
//       },
//     });

//     if (!record) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired verification code",
//       });
//     }

//     await prisma.emailVerification.update({
//       where: { id: record.id },
//       data: { verified: true },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "OTP verified successfully. Please enter your new password.",
//     });
//   } catch (error) {
//     console.error("VERIFY OTP ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to verify OTP",
//     });
//   }
// };

// // =====================================================
// // 7. RESET PASSWORD (WITH PREVIOUS PASSWORD CHECK)
// // =====================================================
// const resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     const normalizedEmail = email?.trim().toLowerCase();

//     if (!normalizedEmail || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and new password are required",
//       });
//     }

//     if (newPassword.length < 12) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 12 characters long",
//       });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "No account found with this email address",
//       });
//     }

//     const isSameAsPrevious = await bcrypt.compare(newPassword, user.passwordHash);
//     if (isSameAsPrevious) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot use your previous password. Please choose a different password.",
//       });
//     }

//     const validRecord = await prisma.emailVerification.findFirst({
//       where: {
//         email: normalizedEmail,
//         ...(otp ? { token: otp.trim() } : { verified: true }),
//         expiresAt: { gt: new Date() },
//       },
//       orderBy: { updatedAt: "desc" },
//     });

//     if (!validRecord) {
//       return res.status(400).json({
//         success: false,
//         message: "Session expired or code unverified. Please restart reset request.",
//       });
//     }

//     const passwordHash = await bcrypt.hash(newPassword, 12);

//     await prisma.user.update({
//       where: { email: normalizedEmail },
//       data: { passwordHash },
//     });

//     await prisma.emailVerification.deleteMany({
//       where: { email: normalizedEmail },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Password reset successful! Please log in with your new password.",
//     });
//   } catch (error) {
//     console.error("RESET PASSWORD ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to reset password. Please try again later.",
//     });
//   }
// };

// module.exports = {
//   redirectToGoogle,
//   handleGoogleCallback,
//   register,
//   login,
//   forgotPassword,
//   verifyResetOtp,
//   resetPassword,
// };

































































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
// EMAIL TRANSPORTER
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

  return transporter.sendMail({
    from: `"AutoBillr Support" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: email,
    subject: `${otp} is your AutoBillr Password Reset OTP`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
        <h2 style="color:#2d7a78">AutoBillr</h2>
        <p>Use this 6-digit verification code to reset your password:</p>
        <div style="background:#f1f5f9;padding:16px;text-align:center;margin:20px 0">
          <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#2d7a78">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:12px">This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

// =====================================================
// PLAN HELPERS
// =====================================================
const ALLOWED_PLANS = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

const getPlan = async (tx, planId) => {
  const normalizedPlanId =
    typeof planId === "string" ? planId.trim().toLowerCase() : "";

  const planName = ALLOWED_PLANS[normalizedPlanId];

  if (!planName) {
    const error = new Error(
      "Please select Starter, Professional, or Enterprise."
    );
    error.statusCode = 400;
    throw error;
  }

  const plan = await tx.plan.findFirst({
    where: { name: planName },
  });

  if (!plan) {
    const error = new Error(
      `Plan "${planName}" does not exist in the database.`
    );
    error.statusCode = 404;
    throw error;
  }

  return plan;
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
    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return res.redirect(`${FRONTEND_URL}/login?error=token_failed`);
    }

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const googleUser = await userResponse.json();
    const normalizedEmail = googleUser.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { company: true },
    });

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=account_not_found`);
    }

    // Keep expired-subscription checks consistent with normal login.
    const subscription = await prisma.subscription.findFirst({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });

    if (!subscription) {
      return res.redirect(
        `${FRONTEND_URL}/register?step=3&reason=subscription_required`
      );
    }

    const now = new Date();

    const trialExpired =
      subscription.status === "TRIALING" &&
      subscription.trialEndsAt &&
      new Date(subscription.trialEndsAt) <= now;

    const paidPeriodExpired =
      subscription.status === "ACTIVE" &&
      subscription.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) <= now;

    if (
      trialExpired ||
      paidPeriodExpired ||
      ["EXPIRED", "PAST_DUE", "CANCELED"].includes(subscription.status)
    ) {
      if (trialExpired || paidPeriodExpired) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "EXPIRED" },
        });
      }

      return res.redirect(
        `${FRONTEND_URL}/register?step=3&reason=subscription_expired`
      );
    }

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    const params = new URLSearchParams({
      token,
      companyId: user.companyId || "",
      userId: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    });

    return res.redirect(`${FRONTEND_URL}/login?${params.toString()}`);
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

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!firstName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "First name is required.",
      });
    }

    if (!lastName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Last name is required.",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!password || password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 12 characters.",
      });
    }

    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    const roleMap = {
      Owner: "OWNER",
      "CFO / VP Finance": "CFO",
      Controller: "CONTROLLER",
      "Finance Manager": "FINANCE_MANAGER",
      Other: "OTHER",
    };

    const userRole = roleMap[role];

    if (!userRole) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: "ACCOUNT_EXISTS",
        message:
          "An account with this email already exists. Please log in instead.",
      });
    }

    const verifiedEmailRecord = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        verified: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!verifiedEmailRecord) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before creating your account.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const plan = await getPlan(tx, planId);
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

      const TRIAL_DAYS = 14;
      const trialEndsAt = new Date(
        Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000
      );

      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: plan.id,
          status: "TRIALING",
          trialEndsAt,
        },
        include: { plan: true },
      });

      await tx.emailVerification.deleteMany({
        where: { email: normalizedEmail },
      });

      return { company, user, subscription };
    });

    const token = generateToken({
      userId: result.user.id,
      companyId: result.company.id,
      role: result.user.role,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
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
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

// =====================================================
// 4. LOGIN
// =====================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { company: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        message: "Please select a subscription plan to continue.",
      });
    }

    const now = new Date();

    const trialExpired =
      subscription.status === "TRIALING" &&
      subscription.trialEndsAt &&
      new Date(subscription.trialEndsAt) <= now;

    const paidPeriodExpired =
      subscription.status === "ACTIVE" &&
      subscription.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) <= now;

    const subscriptionInactive = [
      "EXPIRED",
      "PAST_DUE",
      "CANCELED",
    ].includes(subscription.status);

    if (trialExpired || paidPeriodExpired) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });
    }

    if (trialExpired || paidPeriodExpired || subscriptionInactive) {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_EXPIRED",
        message:
          "Your trial or subscription has expired. Select a plan to continue.",
        subscription: {
          status: "EXPIRED",
          plan: subscription.plan.name,
          trialEndsAt: subscription.trialEndsAt,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
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
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        plan: subscription.plan,
      },
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
// 5. CHANGE PLAN WITHOUT PAYMENT - DEMO MODE
// =====================================================
const changePlan = async (req, res) => {
  try {
    // Supports the usual JWT payload names used by auth middleware.
    const userId = req.user?.userId || req.user?.id;
    const { planId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true },
    });

    if (!user?.companyId) {
      return res.status(404).json({
        success: false,
        message: "User or company not found.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const plan = await getPlan(tx, planId);

      const subscription = await tx.subscription.findFirst({
        where: { companyId: user.companyId },
        orderBy: { createdAt: "desc" },
      });

      if (!subscription) {
        const error = new Error(
          "No subscription exists. Complete registration first."
        );
        error.statusCode = 404;
        throw error;
      }

      // DEMO ONLY: no payment is collected or verified.
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);

      return tx.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: plan.id,
          status: "ACTIVE",
          trialEndsAt: null,
          currentPeriodEnd,
        },
        include: { plan: true },
      });
    });

    return res.status(200).json({
      success: true,
      demoMode: true,
      message: `Plan changed to ${result.plan.name}. No payment was collected.`,
      subscription: {
        id: result.id,
        status: result.status,
        trialEndsAt: result.trialEndsAt,
        currentPeriodEnd: result.currentPeriodEnd,
        plan: result.plan,
      },
    });
  } catch (error) {
    console.error("CHANGE PLAN ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to change the subscription plan.",
    });
  }
};

// =====================================================
// 6. FORGOT PASSWORD - SEND OTP
// =====================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiryMinutes =
      Number(process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES) || 10;

    const expiresAt = new Date(
      Date.now() + expiryMinutes * 60 * 1000
    );

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
      message: "Unable to process the password reset request.",
    });
  }
};

// =====================================================
// 7. VERIFY RESET OTP
// =====================================================
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    const cleanOtp =
      typeof otp === "string" ? otp.trim() : String(otp || "");

    if (!normalizedEmail || !cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
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
        message: "Invalid or expired verification code.",
      });
    }

    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified. Enter your new password.",
    });
  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
    });
  }
};

// =====================================================
// 8. RESET PASSWORD
// =====================================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    const cleanOtp =
      typeof otp === "string" ? otp.trim() : "";

    if (!normalizedEmail || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 12 characters.",
      });
    }

    if (!cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Please provide the verified OTP.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    const isSameAsPrevious = await bcrypt.compare(
      newPassword,
      user.passwordHash
    );

    if (isSameAsPrevious) {
      return res.status(400).json({
        success: false,
        message: "Choose a password different from your previous password.",
      });
    }

    const validRecord = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        token: cleanOtp,
        verified: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired. Please restart password reset.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      await tx.emailVerification.deleteMany({
        where: { email: normalizedEmail },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================
module.exports = {
  redirectToGoogle,
  handleGoogleCallback,
  register,
  login,
  changePlan,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
