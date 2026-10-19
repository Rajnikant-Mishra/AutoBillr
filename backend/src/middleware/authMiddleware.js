
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");

const {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
} = require("../constants/permissions");

// =====================================================
// HELPERS
// =====================================================

const getDefaultRole = (role) => {
  const roleName = String(role || "VIEWER").toUpperCase();

  return (
    Object.keys(DEFAULT_ROLE_PERMISSIONS).find(
      (key) => key.toUpperCase() === roleName
    ) || "VIEWER"
  );
};

const getDefaultPermissions = (role) => {
  const key = getDefaultRole(role);

  return [
    ...(DEFAULT_ROLE_PERMISSIONS[key] || []),
  ];
};

const getOwnerPermissions = () => {
  // An owner has all permissions defined by the application.
  return [
    ...new Set(
      Object.values(PERMISSIONS).filter(
        (permission) => typeof permission === "string"
      )
    ),
  ];
};

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const authMiddleware = async (req, res, next) => {
  try {
    console.log(
      "[AUTH] Request:",
      req.method,
      req.originalUrl
    );

    // 1. Validate authorization header.
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "AUTH_HEADER_MISSING",
        message: "A valid authentication token is required.",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_MISSING",
        message: "Authentication token is missing.",
      });
    }

    // 2. Verify JWT.
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("[AUTH] JWT_SECRET is missing.");

      return res.status(500).json({
        success: false,
        code: "JWT_SECRET_MISSING",
        message: "Server authentication configuration error.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Your login session has expired. Please sign in again.",
        });
      }

      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid authentication token.",
      });
    }

    // 3. Resolve user ID from the token.
    const userId =
      decoded?.userId ||
      decoded?.id ||
      decoded?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN_PAYLOAD",
        message: "The authentication token is invalid.",
      });
    }

    // 4. Fetch only fields and relations present in User.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,

        ownedCompany: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account not found.",
      });
    }

    // 5. Find this user's organization memberships.
    // Do not read role/companyId from User.
    const memberships = await prisma.teamMember.findMany({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email },
        ],
      },
      select: {
        id: true,
        userId: true,
        companyId: true,
        email: true,
        role: true,
        roleId: true,
        status: true,
        extraPermissions: true,

        company: {
          select: {
            id: true,
            name: true,
          },
        },

        roleRef: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    // Only accepted/active memberships grant organization access.
    const activeMemberships = memberships.filter(
      (membership) =>
        membership.status === "ACTIVE" &&
        (
          membership.userId === user.id ||
          membership.email.toLowerCase() === user.email.toLowerCase()
        )
    );

    // 6. Determine the active organization.
    const ownedCompany = user.ownedCompany;
    const requestedCompanyId = decoded?.companyId || null;

    let companyId = null;
    let teamMember = null;
    let isOwner = false;

    if (
      ownedCompany &&
      (
        !requestedCompanyId ||
        requestedCompanyId === ownedCompany.id
      )
    ) {
      companyId = ownedCompany.id;
      isOwner = true;
    } else if (requestedCompanyId) {
      // A token's company ID is accepted only when the user
      // owns that company or has an active membership in it.
      teamMember =
        activeMemberships.find(
          (membership) =>
            membership.companyId === requestedCompanyId
        ) || null;

      if (!teamMember) {
        return res.status(403).json({
          success: false,
          code: "COMPANY_ACCESS_DENIED",
          message: "You do not have active access to this company.",
        });
      }

      companyId = teamMember.companyId;
    } else if (ownedCompany) {
      companyId = ownedCompany.id;
      isOwner = true;
    } else if (activeMemberships.length === 1) {
      teamMember = activeMemberships[0];
      companyId = teamMember.companyId;
    } else if (activeMemberships.length > 1) {
      return res.status(400).json({
        success: false,
        code: "COMPANY_SELECTION_REQUIRED",
        message: "Select an organization before continuing.",
      });
    }

    if (!companyId) {
      return res.status(403).json({
        success: false,
        code: "NO_COMPANY_ACCESS",
        message: "No active company is associated with this account.",
      });
    }

    // Resolve membership if the user owns this company.
    if (!isOwner && !teamMember) {
      teamMember =
        activeMemberships.find(
          (membership) => membership.companyId === companyId
        ) || null;
    }

    // 7. Resolve role and permissions for this company.
    let role;
    let roleId = null;
    let rolePermissions = [];
    let extraPermissions = [];

    if (isOwner) {
      role = "OWNER";
      rolePermissions = getOwnerPermissions();
    } else {
      if (!teamMember) {
        return res.status(403).json({
          success: false,
          code: "MEMBERSHIP_REQUIRED",
          message: "An active membership is required.",
        });
      }

      role = teamMember.role || "VIEWER";
      roleId = teamMember.roleId || null;

      if (teamMember.roleRef) {
        role = teamMember.roleRef.name;
        roleId = teamMember.roleRef.id;

        rolePermissions = Array.isArray(
          teamMember.roleRef.permissions
        )
          ? teamMember.roleRef.permissions
          : [];
      } else {
        rolePermissions = getDefaultPermissions(role);
      }

      extraPermissions = Array.isArray(
        teamMember.extraPermissions
      )
        ? teamMember.extraPermissions
        : [];
    }

    const permissions = [
      ...new Set([
        ...rolePermissions,
        ...extraPermissions,
      ]),
    ];

    // 8. Attach verified identity and organization context.
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      companyId,
      role,
      roleId,
      isOwner,
      rolePermissions,
      extraPermissions,
      permissions,
    };

    console.log("[AUTH] User:", user.id);
    console.log("[AUTH] Company:", companyId);
    console.log("[AUTH] Role:", role);

    // 9. Identify the plan-change endpoint.
    const requestPath = (req.originalUrl || req.path || "")
      .split("?")[0]
      .replace(/\/+$/, "");

    const isPlanChangeRequest =
      req.method === "PUT" &&
      requestPath.endsWith("/auth/change-plan");

    // 10. Check subscription for the resolved company.
    let subscription;

    try {
      subscription = await prisma.subscription.findFirst({
        where: { companyId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error(
        "[AUTH] Subscription lookup failed:",
        error.message
      );

      return res.status(500).json({
        success: false,
        code: "SUBSCRIPTION_CHECK_FAILED",
        message: "Unable to verify your subscription. Please try again.",
      });
    }

    if (!subscription) {
      if (isPlanChangeRequest) {
        return next();
      }

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
      try {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "EXPIRED" },
        });
      } catch (error) {
        console.error(
          "[AUTH] Failed to mark subscription expired:",
          error.message
        );

        return res.status(500).json({
          success: false,
          code: "SUBSCRIPTION_UPDATE_FAILED",
          message: "Unable to verify subscription status.",
        });
      }
    }

    const isExpired =
      Boolean(trialExpired) ||
      Boolean(paidPeriodExpired) ||
      subscriptionInactive;

    if (isExpired) {
      if (isPlanChangeRequest) {
        return next();
      }

      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_EXPIRED",
        message:
          "Your trial or subscription has expired. Select a plan to continue.",
      });
    }

    return next();
  } catch (error) {
    console.error("[AUTH FATAL ERROR]", error);

    return res.status(500).json({
      success: false,
      code: "AUTH_SERVER_ERROR",
      message: "Authentication server error.",
    });
  }
};

module.exports = authMiddleware;
