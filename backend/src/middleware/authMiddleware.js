// const jwt = require("jsonwebtoken");
// const prisma = require("../../config/prisma"); 

// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication token required",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication token missing",
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = {
//       userId: decoded.userId,
//       companyId: decoded.companyId,
//       role: decoded.role,
//     };

//     // =====================================================
//     // TRIAL / SUBSCRIPTION EXPIRATION CHECK
//     // =====================================================
//     if (req.user.companyId) {
//       const subscription = await prisma.subscription.findFirst({
//         where: { companyId: req.user.companyId },
//         orderBy: { createdAt: "desc" },
//       });

//       if (subscription) {
//         if (subscription.status === "TRIALING" && subscription.trialEndsAt) {
//           const isExpired = new Date() > new Date(subscription.trialEndsAt);

//           if (isExpired) {
//             await prisma.subscription.update({
//               where: { id: subscription.id },
//               data: { status: "EXPIRED" },
//             });

//             return res.status(403).json({
//               success: false,
//               code: "TRIAL_EXPIRED",
//               message: "Your trial period has ended. Please upgrade your plan to continue.",
//             });
//           }
//         }

//         if (subscription.status === "EXPIRED") {
//           return res.status(403).json({
//             success: false,
//             code: "TRIAL_EXPIRED",
//             message: "Your subscription has expired. Please subscribe to continue.",
//           });
//         }
//       }
//     }

//     next();
//   } catch (error) {
//     console.error("AUTH ERROR:", error.message);

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         success: false,
//         message: "Session expired. Please login again.",
//       });
//     }

//     return res.status(401).json({
//       success: false,
//       message: "Invalid authentication token",
//     });
//   }
// };

// module.exports = authMiddleware;












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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;
    const companyId = decoded.companyId;
    let role = decoded.role || "Viewer";

    // Normalize role name (Owner, Admin, ...)
    const roleKey =
      Object.keys(DEFAULT_ROLE_PERMISSIONS).find(
        (k) => k.toLowerCase() === String(role).toLowerCase()
      ) || role;

    let permissions = [];

    if (DEFAULT_ROLE_PERMISSIONS[roleKey]) {
      permissions = [...DEFAULT_ROLE_PERMISSIONS[roleKey]];
      role = roleKey;
    } else {
      // Custom role from DB
      try {
        const customRole = await prisma.role.findFirst({
          where: {
            name: role,
            companyId: companyId || undefined,
          },
          select: { permissions: true, name: true },
        });

        if (customRole?.permissions?.length) {
          permissions = [...customRole.permissions];
          role = customRole.name;
        } else {
          permissions = [...(DEFAULT_ROLE_PERMISSIONS.Viewer || [])];
          role = "Viewer";
        }
      } catch (err) {
        console.error("Custom role load error:", err.message);
        permissions = [...(DEFAULT_ROLE_PERMISSIONS.Viewer || [])];
        role = "Viewer";
      }
    }

    req.user = {
      userId,
      companyId,
      role,
      permissions,
    };

    // DEBUG — remove after it works
    console.log(
      "[AUTH]",
      "role=",
      req.user.role,
      "perms=",
      req.user.permissions.length
    );

    // ---- Trial / subscription check ----
    if (req.user.companyId) {
      const subscription = await prisma.subscription.findFirst({
        where: { companyId: req.user.companyId },
        orderBy: { createdAt: "desc" },
      });

      if (subscription) {
        if (
          subscription.status === "TRIALING" &&
          subscription.trialEndsAt
        ) {
          if (new Date() > new Date(subscription.trialEndsAt)) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: "EXPIRED" },
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
    console.error("AUTH ERROR:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

module.exports = authMiddleware;