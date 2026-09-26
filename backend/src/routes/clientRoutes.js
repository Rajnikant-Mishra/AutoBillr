// const express = require("express");

// const router = express.Router();

// const {
//   createClient,
//   getClients,
//   getClientById,
//   updateClient,
//   deleteClient,
// } = require("../controllers/clientController");

// const authMiddleware = require("../middleware/authMiddleware");

// router.use(authMiddleware);

// router.get("/", getClients);

// router.get("/:id", getClientById);

// router.post("/", createClient);

// router.put("/:id", updateClient);

// router.delete("/:id", deleteClient);

// module.exports = router;



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
const requirePermission = require("../middleware/requirePermission");
const { PERMISSIONS } = require("../constants/permissions");

router.use(authMiddleware);

router.get(
  "/",
  requirePermission(PERMISSIONS.CLIENTS_VIEW),
  getClients
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.CLIENTS_VIEW),
  getClientById
);

router.post(
  "/",
  requirePermission(PERMISSIONS.CLIENTS_CREATE),
  createClient
);

router.put(
  "/:id",
  requirePermission(PERMISSIONS.CLIENTS_EDIT),
  updateClient
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.CLIENTS_DELETE),
  deleteClient
);

module.exports = router;