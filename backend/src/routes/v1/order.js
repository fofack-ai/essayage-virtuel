const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const orderController = require("../../controllers/v1/orderController");

router.post(
  "/",
  auth,
  orderController.createOrder
);

router.get(
  "/my-orders",
  auth,
  orderController.getMyOrders
);

router.get(
  "/:id",
  auth,
  orderController.getOrderDetails
);

module.exports = router;