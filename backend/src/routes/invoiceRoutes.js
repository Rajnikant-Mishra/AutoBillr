const express = require("express");
const multer = require("multer");

const router = express.Router();

const invoiceController = require("../controllers/invoiceController");
const authMiddleware = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file && file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// ==================== ROUTES ====================

router.get("/", authMiddleware, invoiceController.getInvoices);

router.post("/", authMiddleware, upload.single("pdf"), invoiceController.createInvoice);

router.get("/:id", authMiddleware, invoiceController.getInvoiceById);

router.put("/:id", authMiddleware, upload.single("pdf"), invoiceController.updateInvoice);

// Reminder
router.post("/:id/remind", authMiddleware, invoiceController.sendReminder);

// ===== THIS IS THE IMPORTANT ONE =====
router.post("/:id/send", authMiddleware, upload.single("pdf"), invoiceController.sendInvoice);

router.delete("/:id", authMiddleware, invoiceController.deleteInvoice);

module.exports = router;