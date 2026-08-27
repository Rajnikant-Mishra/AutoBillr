// models/client.model.js

import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    initials: String,

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    contactName: String,

    phone: String,

    website: String,

    industry: String,

    billing: {
      type: String,
      default: "Monthly",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },

    mrr: {
      type: Number,
      default: 0,
    },

    nextInvoice: {
      type: Date,
    },

    color: String,

    tier: {
      type: String,
      enum: ["Enterprise", "Mid-Market", "SMB", "Agency"],
      default: "SMB",
    },

    currency: {
      type: String,
      default: "USD",
    },

    paymentTerms: {
      type: String,
      default: "Net 30",
    },

    paymentMethod: {
      type: String,
      enum: ["ACH", "Card", "Wire", "Check"],
      default: "ACH",
    },

    taxId: String,

    notes: String,

    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    tags: [String],

    projectsCount: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    automation: {
      autoCharge: {
        type: Boolean,
        default: true,
      },

      reminders: {
        type: Boolean,
        default: true,
      },

      portalAccess: {
        type: Boolean,
        default: true,
      },

      welcomeEmail: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Client",
  clientSchema
);