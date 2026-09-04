const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const generateToken = require("../utils/generateToken");



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

    // =================================================
    // NORMALIZE EMAIL
    // =================================================

    const normalizedEmail = email?.trim().toLowerCase();

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!firstName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    if (!lastName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Last name is required",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 12 characters",
      });
    }

    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // =================================================
    // ROLE MAPPING
    // =================================================

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
        message: "Invalid role",
      });
    }

    // =================================================
    // CHECK EXISTING USER
    // =================================================

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // =================================================
    // CHECK EMAIL VERIFICATION
    // =================================================

    const verifiedEmailRecord =
      await prisma.emailVerification.findFirst({
        where: {
          email: normalizedEmail,
          verified: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    if (!verifiedEmailRecord) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email address before creating your account.",
      });
    }

    // =================================================
    // OPTIONAL VERIFIED AT CHECK
    // =================================================

    if (
      verifiedEmailRecord.verifiedAt !== undefined &&
      verifiedEmailRecord.verifiedAt !== null
    ) {
      // verifiedAt exists and is valid
    }

    // =================================================
    // DATABASE TRANSACTION
    // =================================================

    const result = await prisma.$transaction(async (tx) => {
      // ---------------------------------------------
      // HASH PASSWORD
      // ---------------------------------------------

     const passwordHash = await bcrypt.hash(password, 12);

const plan = await tx.plan.findUnique({
  where: {
    id: planId,
  },
});

if (!plan) {
  throw new Error("Invalid subscription plan");
}
      // ---------------------------------------------
      // CREATE COMPANY
      // ---------------------------------------------

      const company = await tx.company.create({
        data: {
          name: companyName.trim(),
          companySize: companySize || "1-10",
          industry: industry || "SaaS / Software",
        },
      });

      // ---------------------------------------------
      // CREATE USER
      // ---------------------------------------------

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
      trialEndsAt: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ),
    },
    include: {
      plan: true,
    },
  });
      // ---------------------------------------------
      // DELETE USED VERIFICATION
      // ---------------------------------------------

      await tx.emailVerification.delete({
        where: {
          id: verifiedEmailRecord.id,
        },
      });

      // ---------------------------------------------
      // RETURN
      // ---------------------------------------------

      return {
        company,
        user,
        subscription,
      };
    });

    // =================================================
    // GENERATE TOKEN
    // =================================================

    const token = generateToken({
      userId: result.user.id,
      companyId: result.company.id,
      role: result.user.role,
    });

    // =================================================
    // RESPONSE
    // =================================================

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

    // Prisma unique constraint
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },

      include: {
        company: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // =================================================
    // CHECK PASSWORD
    // =================================================

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // =================================================
    // GENERATE TOKEN
    // =================================================

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    // =================================================
    // RESPONSE
    // =================================================

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
        id: user.company.id,
        name: user.company.name,
        companySize: user.company.companySize,
        industry: user.company.industry,
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
  register,
  login,
};