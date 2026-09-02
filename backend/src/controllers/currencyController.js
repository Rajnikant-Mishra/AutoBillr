const getCurrencies = async (req, res) => {
  try {
    const currencies = [
      { code: "INR", symbol: "₹", name: "Indian Rupee" },
      { code: "USD", symbol: "$", name: "US Dollar" },
      { code: "EUR", symbol: "€", name: "Euro" },
      { code: "GBP", symbol: "£", name: "British Pound" },
    ];

    return res.status(200).json({
      success: true,
      currencies,
      message: "Currencies fetched successfully",
    });
  } catch (error) {
    console.error("Currency Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch currencies",
    });
  }
};

module.exports = { getCurrencies };