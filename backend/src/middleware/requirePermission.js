const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user; // set by your auth middleware

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const permissions = user.permissions || [];

    // Owner can have "*" or all permissions
    if (permissions.includes("*") || permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action",
    });
  };
};

module.exports = requirePermission;