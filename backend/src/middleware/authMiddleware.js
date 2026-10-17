
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const {
  DEFAULT_ROLE_PERMISSIONS,
} = require("../constants/permissions");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("========================================");
    console.log("[AUTH] Request:", req.method, req.originalUrl);

    // =====================================================
    // 1. AUTHORIZATION HEADER
    // =====================================================

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

    // =====================================================
    // 2. VERIFY JWT
    // =====================================================

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
    } catch (jwtError) {
      console.error("[AUTH] JWT verification failed:", jwtError.message);

      if (jwtError.name === "TokenExpiredError") {
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

    // =====================================================
    // 3. GET USER ID
    // =====================================================

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

    // =====================================================
    // 4. GET USER FROM DATABASE
    // =====================================================

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        companyId: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account not found.",
      });
    }

    const companyId = user.companyId || decoded?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        code: "NO_COMPANY",
        message: "No company is associated with this account.",
      });
    }

    // =====================================================
    // 5. TEAM MEMBER
    // =====================================================

    let teamMember = null;

    try {
      teamMember = await prisma.teamMember.findFirst({
        where: {
          companyId,
          email: user.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          roleId: true,
          extraPermissions: true,
          roleRef: {
            select: {
              id: true,
              name: true,
              permissions: true,
              isSystem: true,
            },
          },
        },
      });
    } catch (teamError) {
      // Keep the existing fallback if a team-member lookup fails.
      console.error(
        "[AUTH] Team member lookup failed:",
        teamError.message
      );
    }

    // =====================================================
    // 6. ROLE + PERMISSIONS
    // =====================================================

    let role = user.role || "Viewer";
    let rolePermissions = [];

    if (teamMember?.roleRef) {
      role = teamMember.roleRef.name;

      rolePermissions = Array.isArray(
        teamMember.roleRef.permissions
      )
        ? teamMember.roleRef.permissions
        : [];
    } else {
      try {
        const databaseRole = await prisma.role.findFirst({
          where: {
            companyId,
            name: {
              equals: role,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        });

        if (databaseRole) {
          role = databaseRole.name;

          rolePermissions = Array.isArray(
            databaseRole.permissions
          )
            ? databaseRole.permissions
            : [];
        } else {
          const roleKey =
            Object.keys(DEFAULT_ROLE_PERMISSIONS).find(
              (key) =>
                key.toLowerCase() ===
                String(role).toLowerCase()
            ) || "Viewer";

          role = roleKey;
          rolePermissions = [
            ...(DEFAULT_ROLE_PERMISSIONS[roleKey] || []),
          ];
        }
      } catch (roleError) {
        console.error(
          "[AUTH] Role lookup failed:",
          roleError.message
        );

        const roleKey =
          Object.keys(DEFAULT_ROLE_PERMISSIONS).find(
            (key) =>
              key.toLowerCase() ===
              String(role).toLowerCase()
          ) || "Viewer";

        role = roleKey;
        rolePermissions = [
          ...(DEFAULT_ROLE_PERMISSIONS[roleKey] || []),
        ];
      }
    }

    // =====================================================
    // 7. EXTRA PERMISSIONS
    // =====================================================

    const extraPermissions = Array.isArray(
      teamMember?.extraPermissions
    )
      ? teamMember.extraPermissions
      : [];

    const permissions = [
      ...new Set([
        ...rolePermissions,
        ...extraPermissions,
      ]),
    ];

    // =====================================================
    // 8. SET req.user
    // =====================================================

    req.user = {
      id: user.id,
      userId: user.id,
      companyId,
      email: user.email,
      role,
      roleId:
        teamMember?.roleId ||
        teamMember?.roleRef?.id ||
        null,
      rolePermissions,
      extraPermissions,
      permissions,
    };

    console.log("[AUTH] User authenticated:", user.id);
    console.log("[AUTH] Company:", companyId);

    // =====================================================
    // 9. IDENTIFY PLAN-CHANGE REQUEST
    // =====================================================

    const requestPath = (req.originalUrl || req.path || "")
      .split("?")[0]
      .replace(/\/+$/, "");

    const isPlanChangeRequest =
      req.method === "PUT" &&
      requestPath.endsWith("/auth/change-plan");

    // =====================================================
    // 10. SUBSCRIPTION VALIDATION
    // =====================================================

    let subscription;

    try {
      subscription = await prisma.subscription.findFirst({
        where: { companyId },
        orderBy: { createdAt: "desc" },
      });
    } catch (subscriptionError) {
      console.error(
        "[AUTH] Subscription lookup failed:",
        subscriptionError.message
      );

      return res.status(500).json({
        success: false,
        code: "SUBSCRIPTION_CHECK_FAILED",
        message: "Unable to verify your subscription. Please try again.",
      });
    }

    // No subscription: only let the plan-change controller handle
    // the request. Other protected routes remain blocked.
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

    // Persist expiration when a trial or paid period has elapsed.
    if (trialExpired || paidPeriodExpired) {
      try {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "EXPIRED" },
        });
      } catch (updateError) {
        console.error(
          "[AUTH] Failed to mark subscription expired:",
          updateError.message
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

    // =====================================================
    // 11. EXPIRED SUBSCRIPTION ACCESS RULE
    // =====================================================

    if (isExpired) {
      if (isPlanChangeRequest) {
        // Allow only this authenticated renewal endpoint.
        // Other protected APIs remain blocked.
        console.log(
          "[AUTH] Expired subscription: allowing plan-change endpoint."
        );

        return next();
      }

      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_EXPIRED",
        message:
          "Your trial or subscription has expired. Select a plan to continue.",
      });
    }

    // =====================================================
    // 12. CONTINUE
    // =====================================================

    return next();
  } catch (error) {
    console.error("========================================");
    console.error("[AUTH FATAL ERROR]");
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      code: "AUTH_SERVER_ERROR",
      message: "Authentication server error.",
    });
  }
};

module.exports = authMiddleware;
