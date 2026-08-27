import Shop from "../models/shop.model.js";

// CREATE SHOP
const createShop = async (req, res) => {
  try {
    const { name, logo, address, gstNumber } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Shop name is required",
      });
    }

    const shop = await Shop.create({
      name,
      logo,
      address,
      gstNumber,
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Shop created successfully",
      shop,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// optional exports
const getMyShops = async (req, res) => {};

const getShopById = async (req, res) => {};

export { createShop, getMyShops, getShopById };