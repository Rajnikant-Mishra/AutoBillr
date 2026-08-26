const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

const router = express.Router();

// Get all clients
router.get("/", authMiddleware, getClients);

// Create client
router.post("/", authMiddleware, createClient);

// Update client
router.put("/:id", authMiddleware, updateClient);

// Delete client
router.delete("/:id", authMiddleware, deleteClient);

module.exports = router;