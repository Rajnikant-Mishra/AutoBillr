import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
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
    password: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Owner", "CFO / VP Finance", "Controller", "Finance Manager", "Other"],
      default: "Owner",
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-250", "251-1000", "1000+"],
      default: "1-10",
    },
    industry: {
      type: String,
      default: "SaaS / Software",
    },
    status: {
      type: String,
      default: "active",
    },
    preferredCurrency: {
      type: String,
      default: "INR",
    },
  },
  { timestamps: true }
);

// Virtual for full name
userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model("User", userSchema);