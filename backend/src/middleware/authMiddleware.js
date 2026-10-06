
// const jwt = require("jsonwebtoken");
// const prisma = require("../../config/prisma");
// const {
//   DEFAULT_ROLE_PERMISSIONS,
// } = require("../constants/permissions");

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

//     /*
//     |--------------------------------------------------------------------------
//     | VERIFY JWT
//     |--------------------------------------------------------------------------
//     */

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     const userId =
//       decoded.userId ||
//       decoded.id ||
//       decoded.user?.id;

//     const tokenCompanyId =
//       decoded.companyId ||
//       decoded.user?.companyId;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid authentication token",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | GET CURRENT USER FROM DATABASE
//     |--------------------------------------------------------------------------
//     |
//     | Do not rely on role/companyId stored in the JWT for permissions.
//     |
//     | The database is the current source of truth.
//     |--------------------------------------------------------------------------
//     */

//     const user = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//       select: {
//         id: true,
//         email: true,
//         companyId: true,
//         role: true,
//       },
//     });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User account not found",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | COMPANY
//     |--------------------------------------------------------------------------
//     */

//     const companyId =
//       user.companyId || tokenCompanyId || null;

//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         message: "No company associated with this account",
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | FIND TEAM MEMBER
//     |--------------------------------------------------------------------------
//     |
//     | TeamMember contains:
//     |
//     | roleId
//     | extraPermissions
//     |
//     | We need both for the final effective permissions.
//     |--------------------------------------------------------------------------
//     */

//     const teamMember = await prisma.teamMember.findFirst({
//       where: {
//         companyId,
//         email: user.email,
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         roleId: true,
//         extraPermissions: true,

//         roleRef: {
//           select: {
//             id: true,
//             name: true,
//             permissions: true,
//             isSystem: true,
//           },
//         },
//       },
//     });

//     /*
//     |--------------------------------------------------------------------------
//     | DETERMINE ROLE
//     |--------------------------------------------------------------------------
//     */

//     let role = "Viewer";
//     let rolePermissions = [];

//     /*
//      * Preferred source:
//      *
//      * TeamMember.roleRef -> Role table
//      *
//      * This is important because roleRef contains the CURRENT database
//      * permissions.
//      */

//     if (teamMember?.roleRef) {
//       role = teamMember.roleRef.name;

//       rolePermissions = Array.isArray(
//         teamMember.roleRef.permissions
//       )
//         ? teamMember.roleRef.permissions
//         : [];
//     } else {
//       /*
//       |--------------------------------------------------------------------------
//       | FALLBACK
//       |--------------------------------------------------------------------------
//       |
//       | If this user does not yet have a roleRef, use the user's role name
//       | and find the corresponding Role in the database.
//       |--------------------------------------------------------------------------
//       */

//       const userRole = user.role || "Viewer";

//       const databaseRole = await prisma.role.findFirst({
//         where: {
//           companyId,
//           name: {
//             equals: userRole,
//             mode: "insensitive",
//           },
//         },
//         select: {
//           id: true,
//           name: true,
//           permissions: true,
//         },
//       });

//       if (databaseRole) {
//         role = databaseRole.name;

//         rolePermissions = Array.isArray(
//           databaseRole.permissions
//         )
//           ? databaseRole.permissions
//           : [];
//       } else {
//         /*
//         |--------------------------------------------------------------------------
//         | FINAL FALLBACK
//         |--------------------------------------------------------------------------
//         |
//         | Only use hard-coded defaults when no Role exists in the database.
//         |--------------------------------------------------------------------------
//         */

//         const roleKey =
//           Object.keys(DEFAULT_ROLE_PERMISSIONS).find(
//             (key) =>
//               key.toLowerCase() ===
//               String(userRole).toLowerCase()
//           ) || "Viewer";

//         role = roleKey;

//         rolePermissions = [
//           ...(DEFAULT_ROLE_PERMISSIONS[roleKey] || []),
//         ];
//       }
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | MEMBER-SPECIFIC EXTRA PERMISSIONS
//     |--------------------------------------------------------------------------
//     |
//     | These permissions apply ONLY to this individual TeamMember.
//     |--------------------------------------------------------------------------
//     */

//     const extraPermissions =
//       Array.isArray(teamMember?.extraPermissions)
//         ? teamMember.extraPermissions
//         : [];

//     /*
//     |--------------------------------------------------------------------------
//     | EFFECTIVE PERMISSIONS
//     |--------------------------------------------------------------------------
//     |
//     | Role permissions
//     |        +
//     | Member extra permissions
//     |        =
//     | Effective permissions
//     |--------------------------------------------------------------------------
//     */

//     const permissions = [
//       ...new Set([
//         ...rolePermissions,
//         ...extraPermissions,
//       ]),
//     ];

//     /*
//     |--------------------------------------------------------------------------
//     | SET req.user
//     |--------------------------------------------------------------------------
//     */

//     req.user = {
//       userId: user.id,
//       companyId,
//       email: user.email,
//       role,
//       roleId: teamMember?.roleId || teamMember?.roleRef?.id || null,

//       /*
//        * Role-level permissions
//        */
//       rolePermissions,

//       /*
//        * Member-level additional permissions
//        */
//       extraPermissions,

//       /*
//        * Final permissions used by requirePermission()
//        */
//       permissions,
//     };

//     /*
//     |--------------------------------------------------------------------------
//     | DEBUG
//     |--------------------------------------------------------------------------
//     */

//     console.log("================================");
//     console.log("[AUTH]");
//     console.log("User ID:", req.user.userId);
//     console.log("Email:", req.user.email);
//     console.log("Company ID:", req.user.companyId);
//     console.log("Role:", req.user.role);
//     console.log("Role ID:", req.user.roleId);
//     console.log(
//       "Role Permissions:",
//       req.user.rolePermissions
//     );
//     console.log(
//       "Extra Permissions:",
//       req.user.extraPermissions
//     );
//     console.log(
//       "Effective Permissions:",
//       req.user.permissions
//     );
//     console.log(
//       "Permission Count:",
//       req.user.permissions.length
//     );
//     console.log("================================");

//     /*
//     |--------------------------------------------------------------------------
//     | TRIAL / SUBSCRIPTION CHECK
//     |--------------------------------------------------------------------------
//     */

//     if (req.user.companyId) {
//       const subscription =
//         await prisma.subscription.findFirst({
//           where: {
//             companyId: req.user.companyId,
//           },
//           orderBy: {
//             createdAt: "desc",
//           },
//         });

//       if (subscription) {
//         if (
//           subscription.status === "TRIALING" &&
//           subscription.trialEndsAt
//         ) {
//           if (
//             new Date() >
//             new Date(subscription.trialEndsAt)
//           ) {
//             await prisma.subscription.update({
//               where: {
//                 id: subscription.id,
//               },
//               data: {
//                 status: "EXPIRED",
//               },
//             });

//             return res.status(403).json({
//               success: false,
//               code: "TRIAL_EXPIRED",
//               message:
//                 "Your trial period has ended. Please upgrade your plan to continue.",
//             });
//           }
//         }

//         if (subscription.status === "EXPIRED") {
//           return res.status(403).json({
//             success: false,
//             code: "TRIAL_EXPIRED",
//             message:
//               "Your subscription has expired. Please subscribe to continue.",
//           });
//         }
//       }
//     }

//     next();
//   } catch (error) {
//     console.error("AUTH ERROR:", error);

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         success: false,
//         message: "Session expired. Please login again.",
//       });
//     }

//     console.error(
//       "AUTH ERROR MESSAGE:",
//       error.message
//     );

//     return res.status(401).json({
//       success: false,
//       message: "Invalid authentication token",
//     });
//   }
// };

// module.exports = authMiddleware;
















// version 2
// const jwt = require("jsonwebtoken");
// const prisma = require("../../config/prisma");
// const {
//   DEFAULT_ROLE_PERMISSIONS,
// } = require("../constants/permissions");

// const authMiddleware = async (req, res, next) => {
//   try {
//     // =====================================================
//     // 1. CHECK AUTHORIZATION HEADER
//     // =====================================================

//     const authHeader = req.headers.authorization;

//     console.log("========================================");
//     console.log("[AUTH] Request:", req.method, req.originalUrl);
//     console.log("[AUTH] Authorization header exists:", !!authHeader);

//     if (!authHeader) {
//       console.error("[AUTH] Authorization header is missing");

//       return res.status(401).json({
//         success: false,
//         message: "Authentication token required",
//       });
//     }

//     if (!authHeader.startsWith("Bearer ")) {
//       console.error("[AUTH] Invalid Authorization format");

//       return res.status(401).json({
//         success: false,
//         message: "Invalid authentication format",
//       });
//     }

//     // =====================================================
//     // 2. GET TOKEN
//     // =====================================================

//     const token = authHeader.substring(7).trim();

//     if (!token) {
//       console.error("[AUTH] Bearer token is empty");

//       return res.status(401).json({
//         success: false,
//         message: "Authentication token missing",
//       });
//     }

   

//     // =====================================================
//     // 3. CHECK JWT SECRET
//     // =====================================================

//     if (!process.env.JWT_SECRET) {
//       console.error("[AUTH] JWT_SECRET is NOT configured");

//       return res.status(500).json({
//         success: false,
//         message: "Server authentication configuration error",
//       });
//     }

//     // =====================================================
//     // 4. VERIFY JWT
//     // =====================================================

//     let decoded;
// console.log("========== JWT DEBUG ==========");
// console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

// console.log("Token received:", !!token);
// console.log("Token length:", token?.length);
// console.log("===============================");
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (jwtError) {
//       console.error(
//         "[AUTH] JWT verification failed:",
//         jwtError.name,
//         jwtError.message
//       );

//       if (jwtError.name === "TokenExpiredError") {
//         return res.status(401).json({
//           success: false,
//           code: "TOKEN_EXPIRED",
//           message: "Session expired. Please login again.",
//         });
//       }

//       if (jwtError.name === "JsonWebTokenError") {
//         return res.status(401).json({
//           success: false,
//           code: "INVALID_TOKEN",
//           message: "Invalid authentication token",
//         });
//       }

//       return res.status(401).json({
//         success: false,
//         code: "INVALID_TOKEN",
//         message: "Authentication failed",
//       });
//     }

//     console.log("[AUTH] JWT verified successfully");

//     // =====================================================
//     // 5. GET USER ID FROM JWT
//     // =====================================================

//     const userId =
//       decoded?.userId ||
//       decoded?.id ||
//       decoded?.user?.id ||
//       null;

//     const tokenCompanyId =
//       decoded?.companyId ||
//       decoded?.user?.companyId ||
//       null;

//     if (!userId) {
//       console.error("[AUTH] JWT does not contain userId");
//       console.error("[AUTH] Decoded payload:", decoded);

//       return res.status(401).json({
//         success: false,
//         code: "INVALID_TOKEN_PAYLOAD",
//         message: "Invalid authentication token",
//       });
//     }

//     console.log("[AUTH] User ID from JWT:", userId);

//     // =====================================================
//     // 6. GET CURRENT USER FROM DATABASE
//     // =====================================================

//     const user = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//       select: {
//         id: true,
//         email: true,
//         companyId: true,
//         role: true,
//       },
//     });

//     if (!user) {
//       console.error("[AUTH] User not found:", userId);

//       return res.status(401).json({
//         success: false,
//         code: "USER_NOT_FOUND",
//         message: "User account not found",
//       });
//     }

//     console.log("[AUTH] User found:", user.email);
//     console.log("[AUTH] Database companyId:", user.companyId);
//     console.log("[AUTH] Database role:", user.role);

//     // =====================================================
//     // 7. GET COMPANY ID
//     // =====================================================

//     // Database is the primary source.
//     // JWT companyId is only a fallback.
//     const companyId = user.companyId || tokenCompanyId || null;

//     if (!companyId) {
//       console.error(
//         "[AUTH] No company associated with user:",
//         user.id
//       );

//       return res.status(400).json({
//         success: false,
//         code: "NO_COMPANY",
//         message: "No company associated with this account",
//       });
//     }

//     console.log("[AUTH] Company ID:", companyId);

//     // =====================================================
//     // 8. FIND TEAM MEMBER
//     // =====================================================

//     const teamMember = await prisma.teamMember.findFirst({
//       where: {
//         companyId,
//         email: user.email,
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         roleId: true,
//         extraPermissions: true,

//         roleRef: {
//           select: {
//             id: true,
//             name: true,
//             permissions: true,
//             isSystem: true,
//           },
//         },
//       },
//     });

//     // =====================================================
//     // 9. DETERMINE ROLE + ROLE PERMISSIONS
//     // =====================================================

//     let role = "Viewer";
//     let rolePermissions = [];

//     // -----------------------------------------------------
//     // Preferred:
//     // TeamMember -> Role
//     // -----------------------------------------------------

//     if (teamMember?.roleRef) {
//       role = teamMember.roleRef.name;

//       rolePermissions = Array.isArray(
//         teamMember.roleRef.permissions
//       )
//         ? teamMember.roleRef.permissions
//         : [];
//     } else {
//       // ---------------------------------------------------
//       // Fallback:
//       // User role -> Company Role
//       // ---------------------------------------------------

//       const userRole = user.role || "Viewer";

//       const databaseRole = await prisma.role.findFirst({
//         where: {
//           companyId,

//           name: {
//             equals: userRole,
//             mode: "insensitive",
//           },
//         },

//         select: {
//           id: true,
//           name: true,
//           permissions: true,
//         },
//       });

//       if (databaseRole) {
//         role = databaseRole.name;

//         rolePermissions = Array.isArray(
//           databaseRole.permissions
//         )
//           ? databaseRole.permissions
//           : [];
//       } else {
//         // -------------------------------------------------
//         // Final fallback:
//         // Hard-coded permissions
//         // -------------------------------------------------

//         const roleKey =
//           Object.keys(DEFAULT_ROLE_PERMISSIONS).find(
//             (key) =>
//               key.toLowerCase() ===
//               String(userRole).toLowerCase()
//           ) || "Viewer";

//         role = roleKey;

//         rolePermissions = [
//           ...(DEFAULT_ROLE_PERMISSIONS[roleKey] || []),
//         ];
//       }
//     }

//     // =====================================================
//     // 10. MEMBER EXTRA PERMISSIONS
//     // =====================================================

//     const extraPermissions = Array.isArray(
//       teamMember?.extraPermissions
//     )
//       ? teamMember.extraPermissions
//       : [];

//     // =====================================================
//     // 11. EFFECTIVE PERMISSIONS
//     // =====================================================

//     const permissions = [
//       ...new Set([
//         ...rolePermissions,
//         ...extraPermissions,
//       ]),
//     ];

//     // =====================================================
//     // 12. SET req.user
//     // =====================================================

//     req.user = {
//       // Keep BOTH for compatibility
//       id: user.id,
//       userId: user.id,

//       companyId,
//       email: user.email,

//       role,

//       roleId:
//         teamMember?.roleId ||
//         teamMember?.roleRef?.id ||
//         null,

//       // Role permissions
//       rolePermissions,

//       // Individual permissions
//       extraPermissions,

//       // Final permissions
//       permissions,
//     };

//     // =====================================================
//     // 13. DEBUG LOG
//     // =====================================================

//     console.log("----------------------------------------");
//     console.log("[AUTH] Authentication successful");
//     console.log("[AUTH] User ID:", req.user.userId);
//     console.log("[AUTH] Email:", req.user.email);
//     console.log("[AUTH] Company ID:", req.user.companyId);
//     console.log("[AUTH] Role:", req.user.role);
//     console.log("[AUTH] Role ID:", req.user.roleId);
//     console.log(
//       "[AUTH] Role permissions:",
//       req.user.rolePermissions
//     );
//     console.log(
//       "[AUTH] Extra permissions:",
//       req.user.extraPermissions
//     );
//     console.log(
//       "[AUTH] Effective permissions:",
//       req.user.permissions
//     );
//     console.log(
//       "[AUTH] Permission count:",
//       req.user.permissions.length
//     );
//     console.log("----------------------------------------");

//     // =====================================================
//     // 14. SUBSCRIPTION CHECK
//     // =====================================================

//     const subscription =
//       await prisma.subscription.findFirst({
//         where: {
//           companyId: req.user.companyId,
//         },

//         orderBy: {
//           createdAt: "desc",
//         },
//       });

//     if (subscription) {
//       // ---------------------------------------------------
//       // TRIAL EXPIRED
//       // ---------------------------------------------------

//       if (
//         subscription.status === "TRIALING" &&
//         subscription.trialEndsAt
//       ) {
//         const trialExpired =
//           new Date() >
//           new Date(subscription.trialEndsAt);

//         if (trialExpired) {
//           console.log(
//             "[AUTH] Trial expired:",
//             subscription.id
//           );

//           await prisma.subscription.update({
//             where: {
//               id: subscription.id,
//             },

//             data: {
//               status: "EXPIRED",
//             },
//           });

//           return res.status(403).json({
//             success: false,
//             code: "TRIAL_EXPIRED",
//             message:
//               "Your trial period has ended. Please upgrade your plan to continue.",
//           });
//         }
//       }

//       // ---------------------------------------------------
//       // SUBSCRIPTION EXPIRED
//       // ---------------------------------------------------

//       if (subscription.status === "EXPIRED") {
//         console.log(
//           "[AUTH] Subscription expired:",
//           subscription.id
//         );

//         return res.status(403).json({
//           success: false,
//           code: "TRIAL_EXPIRED",
//           message:
//             "Your subscription has expired. Please subscribe to continue.",
//         });
//       }
//     }

//     // =====================================================
//     // 15. CONTINUE REQUEST
//     // =====================================================

//     next();
//   }  catch (error) {
//   console.error("========================================");
//   console.error("[AUTH ERROR]");
//   console.error("Name:", error?.name);
//   console.error("Message:", error?.message);
//   console.error("Stack:", error?.stack);
//   console.error("========================================");

//   if (error?.name === "TokenExpiredError") {
//     return res.status(401).json({
//       success: false,
//       code: "TOKEN_EXPIRED",
//       message: "Session expired. Please login again.",
//     });
//   }

//   if (error?.name === "JsonWebTokenError") {
//     return res.status(401).json({
//       success: false,
//       code: "INVALID_TOKEN",
//       message: "Invalid authentication token",
//     });
//   }

//   return res.status(500).json({
//     success: false,
//     code: "AUTH_SERVER_ERROR",
//     message: "Authentication server error",
//   });
// }
// };

// module.exports = authMiddleware;







// version 3




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

    console.log("[AUTH] Authorization header:", !!authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        code: "AUTH_HEADER_MISSING",
        message: "Authentication token required",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "INVALID_AUTH_FORMAT",
        message: "Invalid authentication format",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "TOKEN_MISSING",
        message: "Authentication token missing",
      });
    }

    console.log("[AUTH] Token received:", true);
    console.log("[AUTH] Token length:", token.length);

    // =====================================================
    // 2. JWT SECRET
    // =====================================================

    const secret = process.env.JWT_SECRET;

    console.log("[AUTH] JWT_SECRET configured:", !!secret);

    if (!secret) {
      console.error("[AUTH] JWT_SECRET is missing");

      return res.status(500).json({
        success: false,
        code: "JWT_SECRET_MISSING",
        message: "Server authentication configuration error",
      });
    }

    // =====================================================
    // 3. VERIFY JWT
    // =====================================================

    let decoded;

    try {
      decoded = jwt.verify(token, secret);

      console.log("[AUTH] JWT verified successfully");
      console.log("[AUTH] JWT payload:", {
        userId: decoded?.userId,
        companyId: decoded?.companyId,
        role: decoded?.role,
      });
    } catch (jwtError) {
      console.error("[AUTH] JWT ERROR");
      console.error("Name:", jwtError.name);
      console.error("Message:", jwtError.message);

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Session expired. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid authentication token",
      });
    }

    // =====================================================
    // 4. GET USER ID
    // =====================================================

    const userId =
      decoded?.userId ||
      decoded?.id ||
      decoded?.user?.id ||
      null;

    if (!userId) {
      console.error("[AUTH] No userId in JWT");

      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN_PAYLOAD",
        message: "Invalid authentication token",
      });
    }

    console.log("[AUTH] User ID:", userId);

    // =====================================================
    // 5. GET USER FROM DATABASE
    // =====================================================

    let user;

    try {
      user = await prisma.user.findUnique({
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

      console.log("[AUTH] User database lookup completed");
    } catch (dbError) {
      console.error("[AUTH] USER DATABASE ERROR");
      console.error("Name:", dbError.name);
      console.error("Message:", dbError.message);
      console.error("Stack:", dbError.stack);

      return res.status(500).json({
        success: false,
        code: "USER_DATABASE_ERROR",
        message: "Failed to authenticate user",
      });
    }

    if (!user) {
      console.error("[AUTH] User not found:", userId);

      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account not found",
      });
    }

    console.log("[AUTH] User:", user.email);
    console.log("[AUTH] Company:", user.companyId);
    console.log("[AUTH] Role:", user.role);

    // =====================================================
    // 6. COMPANY
    // =====================================================

    const companyId = user.companyId || decoded?.companyId || null;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        code: "NO_COMPANY",
        message: "No company associated with this account",
      });
    }

    // =====================================================
    // 7. TEAM MEMBER
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

      console.log("[AUTH] Team member lookup completed");
      console.log("[AUTH] Team member found:", !!teamMember);
    } catch (teamError) {
      console.error("[AUTH] TEAM MEMBER DATABASE ERROR");
      console.error("Name:", teamError.name);
      console.error("Message:", teamError.message);
      console.error("Stack:", teamError.stack);

      /*
       * Do NOT destroy authentication just because
       * TeamMember data has a problem.
       */

      teamMember = null;
    }

    // =====================================================
    // 8. ROLE + PERMISSIONS
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
        console.error("[AUTH] ROLE DATABASE ERROR");
        console.error("Name:", roleError.name);
        console.error("Message:", roleError.message);

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
    // 9. EXTRA PERMISSIONS
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
    // 10. SET req.user
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

    console.log("----------------------------------------");
    console.log("[AUTH] Authentication successful");
    console.log("[AUTH] User ID:", req.user.userId);
    console.log("[AUTH] Email:", req.user.email);
    console.log("[AUTH] Company ID:", req.user.companyId);
    console.log("[AUTH] Role:", req.user.role);
    console.log("----------------------------------------");

    // =====================================================
    // 11. SUBSCRIPTION
    // =====================================================

    try {
      const subscription =
        await prisma.subscription.findFirst({
          where: {
            companyId,
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

        if (subscription.status === "EXPIRED") {
          return res.status(403).json({
            success: false,
            code: "SUBSCRIPTION_EXPIRED",
            message:
              "Your subscription has expired. Please subscribe to continue.",
          });
        }
      }
    } catch (subscriptionError) {
      console.error("[AUTH] SUBSCRIPTION DATABASE ERROR");
      console.error("Name:", subscriptionError.name);
      console.error("Message:", subscriptionError.message);
      console.error("Stack:", subscriptionError.stack);

      /*
       * Temporarily do not fail authentication because
       * subscription lookup failed.
       */
    }

    // =====================================================
    // 12. CONTINUE
    // =====================================================

    next();

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
      message: "Authentication server error",
    });
  }
};

module.exports = authMiddleware;