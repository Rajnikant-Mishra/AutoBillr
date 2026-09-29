// const express = require("express");
// const multer = require("multer");
// const router = express.Router();
// const invoiceController = require("../controllers/invoiceController");
// const authMiddleware = require("../middleware/authMiddleware");

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10 MB
//   },
//   fileFilter: (req, file, cb) => {
//     if (file && file.mimetype !== "application/pdf") {
//       return cb(new Error("Only PDF files are allowed"));
//     }
//     cb(null, true);
//   },
// });

// // ==================== ROUTES ====================
// router.get("/", authMiddleware, invoiceController.getInvoices);
// router.post("/", authMiddleware, upload.single("pdf"), invoiceController.createInvoice);

// router.get("/:id", authMiddleware, invoiceController.getInvoiceById);
// router.put("/:id", authMiddleware, upload.single("pdf"), invoiceController.updateInvoice);

// // Reminder
// router.post("/:id/remind", authMiddleware, invoiceController.sendReminder);

// // Send invoice (PDF + email)
// router.post("/:id/send", authMiddleware, upload.single("pdf"), invoiceController.sendInvoice);

// router.delete("/:id", authMiddleware, invoiceController.deleteInvoice);

// module.exports = router;














const express = require("express");
const multer = require("multer");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");
const authMiddleware = require("../middleware/authMiddleware");
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file && file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// Apply auth to ALL routes in this file
router.use(authMiddleware);

// ==================== ROUTES ====================

// List invoices
router.get(
  "/",
  requirePermission(PERMISSIONS.INVOICES_VIEW),
  invoiceController.getInvoices
);

// Create invoice
router.post(
  "/",
  requirePermission(PERMISSIONS.INVOICES_CREATE),
  upload.single("pdf"),
  invoiceController.createInvoice
);

// Get single invoice
router.get(
  "/:id",
  requirePermission(PERMISSIONS.INVOICES_VIEW),
  invoiceController.getInvoiceById
);

// Update invoice
router.put(
  "/:id",
  requirePermission(PERMISSIONS.INVOICES_EDIT),
  upload.single("pdf"),
  invoiceController.updateInvoice
);

// Send reminder
router.post(
  "/:id/remind",
  requirePermission(PERMISSIONS.INVOICES_REMIND),
  invoiceController.sendReminder
);

// Send invoice (PDF + email)
router.post(
  "/:id/send",
  requirePermission(PERMISSIONS.INVOICES_SEND),
  upload.single("pdf"),
  invoiceController.sendInvoice
);

// Delete invoice
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.INVOICES_DELETE),
  invoiceController.deleteInvoice
);

module.exports = router;