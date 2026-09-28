
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const {
  DEFAULT_ROLE_PERMISSIONS,
} = require("../constants/permissions");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY JWT
    |--------------------------------------------------------------------------
    */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId =
      decoded.userId ||
      decoded.id ||
      decoded.user?.id;

    const tokenCompanyId =
      decoded.companyId ||
      decoded.user?.companyId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET CURRENT USER FROM DATABASE
    |--------------------------------------------------------------------------
    |
    | Do not rely on role/companyId stored in the JWT for permissions.
    |
    | The database is the current source of truth.
    |--------------------------------------------------------------------------
    */

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
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | COMPANY
    |--------------------------------------------------------------------------
    */

    const companyId =
      user.companyId || tokenCompanyId || null;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "No company associated with this account",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND TEAM MEMBER
    |--------------------------------------------------------------------------
    |
    | TeamMember contains:
    |
    | roleId
    | extraPermissions
    |
    | We need both for the final effective permissions.
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | DETERMINE ROLE
    |--------------------------------------------------------------------------
    */

    let role = "Viewer";
    let rolePermissions = [];

    /*
     * Preferred source:
     *
     * TeamMember.roleRef -> Role table
     *
     * This is important because roleRef contains the CURRENT database
     * permissions.
     */

    if (teamMember?.roleRef) {
      role = teamMember.roleRef.name;

      rolePermissions = Array.isArray(
        teamMember.roleRef.permissions
      )
        ? teamMember.roleRef.permissions
        : [];
    } else {
      /*
      |--------------------------------------------------------------------------
      | FALLBACK
      |--------------------------------------------------------------------------
      |
      | If this user does not yet have a roleRef, use the user's role name
      | and find the corresponding Role in the database.
      |--------------------------------------------------------------------------
      */

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
        /*
        |--------------------------------------------------------------------------
        | FINAL FALLBACK
        |--------------------------------------------------------------------------
        |
        | Only use hard-coded defaults when no Role exists in the database.
        |--------------------------------------------------------------------------
        */

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

    /*
    |--------------------------------------------------------------------------
    | MEMBER-SPECIFIC EXTRA PERMISSIONS
    |--------------------------------------------------------------------------
    |
    | These permissions apply ONLY to this individual TeamMember.
    |--------------------------------------------------------------------------
    */

    const extraPermissions =
      Array.isArray(teamMember?.extraPermissions)
        ? teamMember.extraPermissions
        : [];

    /*
    |--------------------------------------------------------------------------
    | EFFECTIVE PERMISSIONS
    |--------------------------------------------------------------------------
    |
    | Role permissions
    |        +
    | Member extra permissions
    |        =
    | Effective permissions
    |--------------------------------------------------------------------------
    */

    const permissions = [
      ...new Set([
        ...rolePermissions,
        ...extraPermissions,
      ]),
    ];

    /*
    |--------------------------------------------------------------------------
    | SET req.user
    |--------------------------------------------------------------------------
    */

    req.user = {
      userId: user.id,
      companyId,
      email: user.email,
      role,
      roleId: teamMember?.roleId || teamMember?.roleRef?.id || null,

      /*
       * Role-level permissions
       */
      rolePermissions,

      /*
       * Member-level additional permissions
       */
      extraPermissions,

      /*
       * Final permissions used by requirePermission()
       */
      permissions,
    };

    /*
    |--------------------------------------------------------------------------
    | DEBUG
    |--------------------------------------------------------------------------
    */

    console.log("================================");
    console.log("[AUTH]");
    console.log("User ID:", req.user.userId);
    console.log("Email:", req.user.email);
    console.log("Company ID:", req.user.companyId);
    console.log("Role:", req.user.role);
    console.log("Role ID:", req.user.roleId);
    console.log(
      "Role Permissions:",
      req.user.rolePermissions
    );
    console.log(
      "Extra Permissions:",
      req.user.extraPermissions
    );
    console.log(
      "Effective Permissions:",
      req.user.permissions
    );
    console.log(
      "Permission Count:",
      req.user.permissions.length
    );
    console.log("================================");

    /*
    |--------------------------------------------------------------------------
    | TRIAL / SUBSCRIPTION CHECK
    |--------------------------------------------------------------------------
    */

    if (req.user.companyId) {
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
        if (
          subscription.status === "TRIALING" &&
          subscription.trialEndsAt
        ) {
          if (
            new Date() >
            new Date(subscription.trialEndsAt)
          ) {
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

        if (subscription.status === "EXPIRED") {
          return res.status(403).json({
            success: false,
            code: "TRIAL_EXPIRED",
            message:
              "Your subscription has expired. Please subscribe to continue.",
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    console.error(
      "AUTH ERROR MESSAGE:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

module.exports = authMiddleware;
