const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const cartController = require("../../controllers/v1/cartController");

router.get(
  "/",
  auth,
  cartController.getCart
);

router.post(
  "/add",
  auth,
  cartController.addToCart
);

router.put(
  "/update/:itemId",
  auth,
  cartController.updateCartItem
);

router.delete(
  "/remove/:itemId",
  auth,
  cartController.removeCartItem
);

router.delete(
  "/clear",
  auth,
  cartController.clearCart
);

module.exports = router;