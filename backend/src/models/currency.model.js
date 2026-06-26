import mongoose from "mongoose";

const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    flag: String,
    name: String,
    symbol: String,
    rate: Number,
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Currency", currencySchema);