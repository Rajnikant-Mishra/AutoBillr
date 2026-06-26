import Shop from "../models/shop.model.js";

export const attachShop = async (req, res, next) => {
  try {
    const shopId = req.headers["x-shop-id"];

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID required",
      });
    }

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // 🔥 Ownership check
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized for this shop",
      });
    }

    req.shop = shop; // attach active shop
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};