const express = require("express");

const {
  getCurrencies,
  getCurrencyByCode,
} = require("../controllers/currencyController");

const router = express.Router();

// GET /api/v1/currencies
router.get("/", getCurrencies);

// GET /api/v1/currencies/:code
router.get("/:code", getCurrencyByCode);

module.exports = router;