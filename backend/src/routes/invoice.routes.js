import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
} from "../controllers/invoice.controller.js";

const router = express.Router();

router.post("/", createInvoice);
router.get("/", getInvoices);

router.get("/:id", getInvoiceById);
router.put("/:id", updateInvoice);

export default router;