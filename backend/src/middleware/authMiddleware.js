const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }
};

module.exports = authMiddleware;