const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const prisma = require("../../config/prisma");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   MULTER – Avatar upload
===================================================== */

const uploadDir = path.join(__dirname, "../../uploads/avatars");

// Create folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/* =====================================================
   GET CURRENT USER
===================================================== */

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
        avatar: user.avatar || null,
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

/* =====================================================
   UPDATE PROFILE (name + avatar)
===================================================== */

router.put(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
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

      // If a new avatar was uploaded
      if (req.file) {
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
        message: error.message || "Failed to update profile",
      });
    }
  }
);

module.exports = router;