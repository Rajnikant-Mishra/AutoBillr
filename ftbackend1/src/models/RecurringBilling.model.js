import mongoose from "mongoose";

const recurringBillingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    frequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Annual"],
      default: "Monthly",
    },

    autoSubmit: {
      type: Boolean,
      default: true,
    },

    autoCharge: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    nextRunDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RecurringBilling =
  mongoose.models.RecurringBilling ||
  mongoose.model(
    "RecurringBilling",
    recurringBillingSchema
  );

export default RecurringBilling;