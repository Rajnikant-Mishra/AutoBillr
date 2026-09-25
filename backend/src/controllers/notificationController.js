const prisma = require("../../config/prisma");

const createNotificationApi = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const title =
      req.body.title ||
      req.body.heading ||
      req.body.subject ||
      (req.body.type ? `${req.body.type} Activity` : "Notification");

    const message =
      req.body.message ||
      req.body.description ||
      req.body.content ||
      req.body.text ||
      req.body.details ||
      req.body.title ||
      "New activity registered in system";

    const type = req.body.type || "GENERAL";
    const isImportant = Boolean(req.body.isImportant);

    const notification = await prisma.notification.create({
      data: {
        companyId,
        title: String(title).trim(),
        message: String(message).trim(),
        type: String(type).toUpperCase(),
        isImportant,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
      data: notification,
    });
  } catch (error) {
    console.error("POST NOTIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create notification",
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(200).json({
        success: true,
        notifications: [],
        unreadCount: 0,
      });
    }

    const notifications = await prisma.notification.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { companyId, isRead: false },
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR IN TERMINAL:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};
const markAsRead = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (id === "all") {
      await prisma.notification.updateMany({
        where: { companyId, isRead: false },
        data: { isRead: true },
      });
      return res.status(200).json({ success: true, message: "All notifications marked as read" });
    }

    await prisma.notification.updateMany({
      where: { id, companyId },
      data: { isRead: true },
    });

    return res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("MARK_READ_ERROR:", error);
    return res.status(500).json({ success: false, message: "Error updating notification" });
  }
};

const toggleImportant = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, companyId },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isImportant: !notification.isImportant },
    });

    return res.status(200).json({
      success: true,
      message: updated.isImportant ? "Marked as important" : "Removed from important",
      notification: updated,
    });
  } catch (error) {
    console.error("TOGGLE_IMPORTANT_ERROR:", error);
    return res.status(500).json({ success: false, message: "Error toggling important status" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    const targetId = req.params.id || req.query.id || req.body?.id;

    console.log("👉 DELETE REQUEST RECEIVED:", {
      targetId,
      params: req.params,
      query: req.query,
      body: req.body,
    });

    if (!companyId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (targetId === "all" || targetId === "clear" || req.path.includes("clear")) {
      const deleted = await prisma.notification.deleteMany({
        where: { companyId },
      });
      return res.status(200).json({
        success: true,
        message: "All notifications cleared",
        count: deleted.count,
      });
    }

    if (!targetId || targetId === "undefined" || targetId === "null") {
      return res.status(400).json({
        success: false,
        message: "Valid notification ID is required for single delete",
      });
    }

    const result = await prisma.notification.deleteMany({
      where: {
        id: targetId,
        companyId,
      },
    });

    console.log(` Deleted ${result.count} notification(s) with ID: ${targetId}`);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete notification",
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  toggleImportant,
  deleteNotification,
  createNotificationApi,
};