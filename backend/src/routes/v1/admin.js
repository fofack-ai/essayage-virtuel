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

router.put(
  "/orders/:id/status",
  auth,
  admin,
  adminController.updateOrderStatus
);

module.exports = router;