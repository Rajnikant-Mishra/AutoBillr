const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const {
  DEFAULT_ROLE_PERMISSIONS,
} = require("../constants/permissions");

const authMiddleware = async (req, res, next) => {
  try {
    // =====================================================
    // 1. CHECK AUTHORIZATION HEADER
    // =====================================================

    const authHeader = req.headers.authorization;

    console.log("========================================");
    console.log("[AUTH] Request:", req.method, req.originalUrl);
    console.log("[AUTH] Authorization header exists:", !!authHeader);

    if (!authHeader) {
      console.error("[AUTH] Authorization header is missing");

      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.error("[AUTH] Invalid Authorization format");

      return res.status(401).json({
        success: false,
        message: "Invalid authentication format",
      });
    }

    // =====================================================
    // 2. GET TOKEN
    // =====================================================

    const token = authHeader.substring(7).trim();

    if (!token) {
      console.error("[AUTH] Bearer token is empty");

      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    console.log("[AUTH] Token received:", `${token.substring(0, 15)}...`);

    // =====================================================
    // 3. CHECK JWT SECRET
    // =====================================================

    if (!process.env.JWT_SECRET) {
      console.error("[AUTH] JWT_SECRET is NOT configured");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error",
      });
    }

    // =====================================================
    // 4. VERIFY JWT
    // =====================================================

    let decoded;
console.log("========== JWT DEBUG ==========");
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
console.log("Token received:", !!token);
console.log("Token length:", token?.length);
console.log("===============================");
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error(
        "[AUTH] JWT verification failed:",
        jwtError.name,
        jwtError.message
      );

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Session expired. Please login again.",
        });
      }

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          code: "INVALID_TOKEN",
          message: "Invalid authentication token",
        });
      }

      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Authentication failed",
      });
    }

    console.log("[AUTH] JWT verified successfully");

    // =====================================================
    // 5. GET USER ID FROM JWT
    // =====================================================

    const userId =
      decoded?.userId ||
      decoded?.id ||
      decoded?.user?.id ||
      null;

    const tokenCompanyId =
      decoded?.companyId ||
      decoded?.user?.companyId ||
      null;

    if (!userId) {
      console.error("[AUTH] JWT does not contain userId");
      console.error("[AUTH] Decoded payload:", decoded);

      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN_PAYLOAD",
        message: "Invalid authentication token",
      });
    }

    console.log("[AUTH] User ID from JWT:", userId);

    // =====================================================
    // 6. GET CURRENT USER FROM DATABASE
    // =====================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        companyId: true,
        role: true,
      },
    });

    if (!user) {
      console.error("[AUTH] User not found:", userId);

      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account not found",
      });
    }

    console.log("[AUTH] User found:", user.email);
    console.log("[AUTH] Database companyId:", user.companyId);
    console.log("[AUTH] Database role:", user.role);

    // =====================================================
    // 7. GET COMPANY ID
    // =====================================================

    // Database is the primary source.
    // JWT companyId is only a fallback.
    const companyId = user.companyId || tokenCompanyId || null;

    if (!companyId) {
      console.error(
        "[AUTH] No company associated with user:",
        user.id
      );

      return res.status(400).json({
        success: false,
        code: "NO_COMPANY",
        message: "No company associated with this account",
      });
    }

    console.log("[AUTH] Company ID:", companyId);

    // =====================================================
    // 8. FIND TEAM MEMBER
    // =====================================================

    const teamMember = await prisma.teamMember.findFirst({
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

    // =====================================================
    // 9. DETERMINE ROLE + ROLE PERMISSIONS
    // =====================================================

    let role = "Viewer";
    let rolePermissions = [];

    // -----------------------------------------------------
    // Preferred:
    // TeamMember -> Role
    // -----------------------------------------------------

    if (teamMember?.roleRef) {
      role = teamMember.roleRef.name;

      rolePermissions = Array.isArray(
        teamMember.roleRef.permissions
      )
        ? teamMember.roleRef.permissions
        : [];
    } else {
      // ---------------------------------------------------
      // Fallback:
      // User role -> Company Role
      // ---------------------------------------------------

      const userRole = user.role || "Viewer";

      const databaseRole = await prisma.role.findFirst({
        where: {
          companyId,

          name: {
            equals: userRole,
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
        // -------------------------------------------------
        // Final fallback:
        // Hard-coded permissions
        // -------------------------------------------------

        const roleKey =
          Object.keys(DEFAULT_ROLE_PERMISSIONS).find(
            (key) =>
              key.toLowerCase() ===
              String(userRole).toLowerCase()
          ) || "Viewer";

        role = roleKey;

        rolePermissions = [
          ...(DEFAULT_ROLE_PERMISSIONS[roleKey] || []),
        ];
      }
    }

    // =====================================================
    // 10. MEMBER EXTRA PERMISSIONS
    // =====================================================

    const extraPermissions = Array.isArray(
      teamMember?.extraPermissions
    )
      ? teamMember.extraPermissions
      : [];

    // =====================================================
    // 11. EFFECTIVE PERMISSIONS
    // =====================================================

    const permissions = [
      ...new Set([
        ...rolePermissions,
        ...extraPermissions,
      ]),
    ];

    // =====================================================
    // 12. SET req.user
    // =====================================================

    req.user = {
      // Keep BOTH for compatibility
      id: user.id,
      userId: user.id,

      companyId,
      email: user.email,

      role,

      roleId:
        teamMember?.roleId ||
        teamMember?.roleRef?.id ||
        null,

      // Role permissions
      rolePermissions,

      // Individual permissions
      extraPermissions,

      // Final permissions
      permissions,
    };

    // =====================================================
    // 13. DEBUG LOG
    // =====================================================

    console.log("----------------------------------------");
    console.log("[AUTH] Authentication successful");
    console.log("[AUTH] User ID:", req.user.userId);
    console.log("[AUTH] Email:", req.user.email);
    console.log("[AUTH] Company ID:", req.user.companyId);
    console.log("[AUTH] Role:", req.user.role);
    console.log("[AUTH] Role ID:", req.user.roleId);
    console.log(
      "[AUTH] Role permissions:",
      req.user.rolePermissions
    );
    console.log(
      "[AUTH] Extra permissions:",
      req.user.extraPermissions
    );
    console.log(
      "[AUTH] Effective permissions:",
      req.user.permissions
    );
    console.log(
      "[AUTH] Permission count:",
      req.user.permissions.length
    );
    console.log("----------------------------------------");

    // =====================================================
    // 14. SUBSCRIPTION CHECK
    // =====================================================

    const subscription =
      await prisma.subscription.findFirst({
        where: {
          companyId: req.user.companyId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (subscription) {
      // ---------------------------------------------------
      // TRIAL EXPIRED
      // ---------------------------------------------------

      if (
        subscription.status === "TRIALING" &&
        subscription.trialEndsAt
      ) {
        const trialExpired =
          new Date() >
          new Date(subscription.trialEndsAt);

        if (trialExpired) {
          console.log(
            "[AUTH] Trial expired:",
            subscription.id
          );

          await prisma.subscription.update({
            where: {
              id: subscription.id,
            },

            data: {
              status: "EXPIRED",
            },
          });

          return res.status(403).json({
            success: false,
            code: "TRIAL_EXPIRED",
            message:
              "Your trial period has ended. Please upgrade your plan to continue.",
          });
        }
      }

      // ---------------------------------------------------
      // SUBSCRIPTION EXPIRED
      // ---------------------------------------------------

      if (subscription.status === "EXPIRED") {
        console.log(
          "[AUTH] Subscription expired:",
          subscription.id
        );

        return res.status(403).json({
          success: false,
          code: "TRIAL_EXPIRED",
          message:
            "Your subscription has expired. Please subscribe to continue.",
        });
      }
    }

    // =====================================================
    // 15. CONTINUE REQUEST
    // =====================================================

    next();
  }  catch (error) {
  console.error("========================================");
  console.error("[AUTH ERROR]");
  console.error("Name:", error?.name);
  console.error("Message:", error?.message);
  console.error("Stack:", error?.stack);
  console.error("========================================");

  if (error?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      code: "TOKEN_EXPIRED",
      message: "Session expired. Please login again.",
    });
  }

  if (error?.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: "Invalid authentication token",
    });
  }

  return res.status(500).json({
    success: false,
    code: "AUTH_SERVER_ERROR",
    message: "Authentication server error",
  });
}
};

module.exports = authMiddleware;