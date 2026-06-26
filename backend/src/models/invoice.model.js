import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  desc: String,
  qty: Number,
  rate: Number,
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

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

    invoiceDate: Date,
    dueDate: Date,

    items: [invoiceItemSchema],

    subtotal: Number,
    tax: Number,
    total: Number,

    payLink: Boolean,
    emailClient: Boolean,
    autoCharge: Boolean,

    status: {
  type: String,
  default: "Draft",
  enum: [
    "Draft",
    "Sent",
    "Paid",
    "Overdue",
    "Pending",
    "Scheduled",
  ],
},
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);