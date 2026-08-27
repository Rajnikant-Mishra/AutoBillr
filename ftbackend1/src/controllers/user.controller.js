import User from "../models/user.model.js";

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return res.json({
      success: true,
      preferred_currency: user?.preferredCurrency || "INR",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCurrency = async (req, res) => {
  try {
    const { currency } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferredCurrency: currency },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Currency updated",
      preferred_currency: user.preferredCurrency,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};