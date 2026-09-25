const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  toggleImportant,
  createNotificationApi,
  deleteNotification,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", getNotifications);
router.post("/", createNotificationApi);
router.put("/read-all", markAsRead);
router.put("/:id/read", markAsRead);
router.patch("/:id/read", markAsRead);
router.put("/:id/important", toggleImportant);
router.patch("/:id/important", toggleImportant);
router.delete("/clear", deleteNotification);
router.delete("/clear-all", deleteNotification);
router.delete("/:id", deleteNotification);
router.delete("/", deleteNotification);

module.exports = router;