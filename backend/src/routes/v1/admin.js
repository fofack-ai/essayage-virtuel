const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

const adminController = require("../../controllers/v1/adminController");

router.get(
  "/dashboard",
  auth,
  admin,
  adminController.dashboard
);

router.get(
  "/orders",
  auth,
  admin,
  adminController.getOrders
);

router.get(
  "/orders/:id",
  auth,
  admin,
  adminController.getOrderDetails
);

router.put(
  "/orders/:id/status",
  auth,
  admin,
  adminController.updateOrderStatus
);

router.get(
  "/clients",
  auth,
  admin,
  adminController.getClients
);

router.get(
  "/clients/:id",
  auth,
  admin, 
  adminController.getClient
);
router.put(
  "/clients/:id",
  auth, 
  admin, 
  adminController.updateClient
);
router.delete(
  "/clients/:id", 
  auth, 
  admin, 
  adminController.deleteClient
);

module.exports = router;