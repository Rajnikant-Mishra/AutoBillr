import express from "express";

import {
  createRecurringBilling,
  getRecurringBillings,
} from "../controllers/recurringBilling.controller.js";

const router = express.Router();

router.post("/", createRecurringBilling);
router.get("/", getRecurringBillings);

export default router;