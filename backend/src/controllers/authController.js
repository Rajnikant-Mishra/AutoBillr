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
      plan,
    } = req.body;

    // ==========================================
    // ROLE MAPPING
    // ==========================================

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

    // ==========================================
    // CHECK EXISTING USER
    // ==========================================

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // ==========================================
    // DATABASE TRANSACTION
    // ==========================================

    const result = await prisma.$transaction(async (tx) => {

      // ----------------------------------------
      // FIND PLAN
      // ----------------------------------------

      const selectedPlan = await tx.plan.findUnique({
        where: {
          id: plan,
        },
      });

      if (!selectedPlan || !selectedPlan.isActive) {
        const error = new Error(
          "Invalid subscription plan"
        );

        error.statusCode = 400;

        throw error;
      }

      // ----------------------------------------
      // HASH PASSWORD
      // ----------------------------------------

      const passwordHash = await bcrypt.hash(
        password,
        12
      );

      // ----------------------------------------
      // CREATE COMPANY
      // ----------------------------------------

      const company = await tx.company.create({
        data: {
          name: companyName,
          companySize,
          industry,
        },
      });

      // ----------------------------------------
      // CREATE USER
      // ----------------------------------------

      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          role: userRole,
          companyId: company.id,
        },
      });

      // ----------------------------------------
      // CREATE 14 DAY TRIAL
      // ----------------------------------------

      const trialEndsAt = new Date();

      trialEndsAt.setDate(
        trialEndsAt.getDate() + 14
      );

      // ----------------------------------------
      // CREATE SUBSCRIPTION
      // ----------------------------------------

      const subscription =
        await tx.subscription.create({
          data: {
            companyId: company.id,
            planId: selectedPlan.id,
            status: "TRIALING",
            trialEndsAt,
          },
        });

      return {
        company,
        user,
        subscription,
        selectedPlan,
      };
    });

    // ==========================================
    // GENERATE TOKEN
    // ==========================================

    const token = generateToken({
      userId: result.user.id,
      companyId: result.company.id,
      role: result.user.role,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

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
        plan: result.selectedPlan.name,
        planId: result.selectedPlan.id,
        status: result.subscription.status,
        trialEndsAt: result.subscription.trialEndsAt,
      },
    });

  } catch (error) {

    console.error("REGISTER ERROR:", error);

    // Prisma unique constraint
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // Known validation/business error
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Registration failed. Please try again later.",
    });
  }
};
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
        id: user.company.id,
        name: user.company.name,
        companySize: user.company.companySize,
        industry: user.company.industry,
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
module.exports = {
  register,
  login,
};