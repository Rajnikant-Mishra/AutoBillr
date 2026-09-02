const getNotifications = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: 0,
      unreadCount: 0,
      notifications: [],
      message: "Notifications fetched successfully",
    });
  } catch (error) {
    console.error("Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

const createNotification = async (req, res) => {
  try {
    return res.status(201).json({
      success: true,
      message: "Notification created",
      notification: req.body,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

module.exports = { getNotifications, createNotification };