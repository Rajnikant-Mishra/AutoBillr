import express from "express";
import { createShop } from "../controllers/shop.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyToken, createShop);

export default router;