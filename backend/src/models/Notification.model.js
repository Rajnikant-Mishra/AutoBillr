// models/Notification.js

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "general",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "notifications",
    },
    iconColor: {
      type: String,
      default: "text-teal-600",
    },
    bgColor: {
      type: String,
      default: "bg-teal-50",
    },
    borderColor: {
      type: String,
      default: "border-teal-500",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    time: {
      type: String,
      default: "Just now",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Notification",
  notificationSchema
);