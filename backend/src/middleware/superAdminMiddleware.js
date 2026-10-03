const verifySuperAdmin = (req, res, next) => {
  try {
    const userRole = req.user?.role?.toUpperCase();

    if (userRole !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Superadmin privileges required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization check failed.",
    });
  }
};

module.exports = { verifySuperAdmin };