const express = require("express");

const router = express.Router();

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", getClients);

router.get("/:id", getClientById);

router.post("/", createClient);

router.put("/:id", updateClient);

router.delete("/:id", deleteClient);

module.exports = router;