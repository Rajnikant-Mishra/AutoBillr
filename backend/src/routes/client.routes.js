import express from "express";
import {
  createClient,
  getClients,
  updateClient,
} from "../controllers/client.controller.js";

const router = express.Router();

router.post("/", createClient);
router.get("/", getClients);
router.put("/:id", updateClient);

export default router;