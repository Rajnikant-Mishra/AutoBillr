const prisma = require("../../config/prisma");

const getCurrencies = async (req, res) => {
  try {
    const currencies = await prisma.currency.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          code: "asc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      currencies,
    });
  } catch (error) {
    console.error("GET CURRENCIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch currencies",
    });
  }
};

const getCurrencyByCode = async (req, res) => {
  try {
    const code = req.params.code?.toUpperCase();

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Currency code is required",
      });
    }

    const currency = await prisma.currency.findUnique({
      where: {
        code,
      },
    });

    if (!currency || !currency.active) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    return res.status(200).json({
      success: true,
      currency,
    });
  } catch (error) {
    console.error("GET CURRENCY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch currency",
    });
  }
};

module.exports = {
  getCurrencies,
  getCurrencyByCode,
};