import express from "express";

import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", getNotifications);
router.post("/", createNotification);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/clear", clearNotifications);

export default router;