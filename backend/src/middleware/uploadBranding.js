const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyId =
      req.companyId ||
      req.user?.companyId;

    if (!companyId) {
      return cb(
        new Error("Company ID is required")
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "branding",
      companyId
    );

    fs.mkdirSync(uploadDir, {
      recursive: true,
    });

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname).toLowerCase();

    const filename =
      `logo-${Date.now()}${extension}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only PNG, JPG, JPEG, WEBP and SVG images are allowed"
      )
    );
  }

  cb(null, true);
};

const uploadBranding = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = uploadBranding;