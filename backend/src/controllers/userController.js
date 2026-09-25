const prisma = require("../config/prisma");
const path = require("path");
const fs = require("fs");

// =====================================================
// GET PROFILE
// =====================================================

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        companyId: true,
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
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { firstName, lastName } = req.body;

    if (!firstName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    const data = {
      firstName: firstName.trim(),
      lastName: lastName?.trim() || "",
    };

    // =================================================
    // AVATAR UPLOAD
    // =================================================

    if (req.file) {
      data.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // =================================================
    // UPDATE DATABASE
    // =================================================

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },

      data,

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        companyId: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getProfile,
  updateProfile,
};