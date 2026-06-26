// controllers/notificationController.js

import Notification from "../models/Notification.model.js";

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(
      req.body
    );

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await Notification.find()
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllAsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {},
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const clearNotifications = async (
  req,
  res
) => {
  try {
    await Notification.deleteMany();

    res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};