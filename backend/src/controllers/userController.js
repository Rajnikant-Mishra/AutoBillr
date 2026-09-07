const prisma = require("../config/prisma");
const path = require("path");
const fs = require("fs");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // from authMiddleware
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

    // If avatar was uploaded
    if (req.file) {
      // Save relative path or full URL depending on your setup
      data.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
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

module.exports = { updateProfile };