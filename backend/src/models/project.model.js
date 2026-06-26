// models/project.model.js

import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "pending",
        "paid",
        "overdue",
      ],
      default: "scheduled",
    },

    invoiceGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    description: String,

    startDate: Date,

    endDate: Date,

    dueDate: Date,

    projectType: {
      type: String,
      enum: [
        "Fixed Fee",
        "Retainer",
        "Time & Materials",
        "Internal",
      ],
      default: "Fixed Fee",
    },

    billingMethod: {
      type: String,
      enum: [
        "Milestone",
        "Hourly",
        "Retainer",
        "Fixed Fee",
      ],
      default: "Milestone",
    },

    autoInvoice: {
      type: Boolean,
      default: true,
    },

    budget: {
      type: Number,
      default: 0,
    },

    billed: {
      type: Number,
      default: 0,
    },

    progress: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "COMPLETED",
        "ON_HOLD",
        "CANCELLED",
      ],
      default: "ACTIVE",
    },

    teamMembers: [
      {
        name: String,
        email: String,
        role: String,
      },
    ],

    members: {
      type: Number,
      default: 0,
    },

    icon: {
      type: String,
      default: "folder",
    },

    color: {
      type: String,
      default: "bg-cyan-500",
    },

    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model(
  "Project",
  projectSchema
);