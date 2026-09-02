const express = require("express");
const router = express.Router();
const { getCurrencies } = require("../controllers/currencyController");

router.get("/", getCurrencies);

module.exports = router;