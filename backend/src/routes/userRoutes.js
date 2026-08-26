const express = require("express");
const prisma = require("../../config/prisma");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET CURRENT USER
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },

      company: user.company,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

module.exports = router;