const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma"); 

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

    req.user = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
    };

    // =====================================================
    // TRIAL / SUBSCRIPTION EXPIRATION CHECK
    // =====================================================
    if (req.user.companyId) {
      const subscription = await prisma.subscription.findFirst({
        where: { companyId: req.user.companyId },
        orderBy: { createdAt: "desc" },
      });

      if (subscription) {
        if (subscription.status === "TRIALING" && subscription.trialEndsAt) {
          const isExpired = new Date() > new Date(subscription.trialEndsAt);

          if (isExpired) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: "EXPIRED" },
            });

            return res.status(403).json({
              success: false,
              code: "TRIAL_EXPIRED",
              message: "Your trial period has ended. Please upgrade your plan to continue.",
            });
          }
        }

        if (subscription.status === "EXPIRED") {
          return res.status(403).json({
            success: false,
            code: "TRIAL_EXPIRED",
            message: "Your subscription has expired. Please subscribe to continue.",
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