import express from "express";
import Currency from "../models/currency.model.js";

const router = express.Router();

// Fetch currencies
router.get("/", async (req, res) => {
  try {
    const currencies = await Currency.find().sort({ code: 1 });

    const selected = currencies.find(c => c.isSelected);

    res.json({
      success: true,
      currencies,
      selectedCurrency: selected?.code || "INR",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Change selected currency
router.put("/select", async (req, res) => {
  try {
    const { currency } = req.body;

    await Currency.updateMany({}, { isSelected: false });

    await Currency.findOneAndUpdate(
      { code: currency },
      { isSelected: true }
    );

    res.json({
      success: true,
      selectedCurrency: currency,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;