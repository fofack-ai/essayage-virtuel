const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const optionalAuth = require("../../middleware/optionalAuth");
const cartController = require("../../controllers/v1/cartController");

// ============================================================
// PANIER — accessible avec ou sans compte
// ============================================================
router.get("/", optionalAuth, cartController.getCart);
router.post("/add", optionalAuth, cartController.addToCart);
router.put("/update/:itemId", optionalAuth, cartController.updateCartItem);
router.delete("/remove/:itemId", optionalAuth, cartController.removeCartItem);
router.delete("/clear", optionalAuth, cartController.clearCart);

// ============================================================
// FUSION après connexion — compte requis
// ============================================================
router.post("/merge", auth, cartController.mergeGuestCart);

module.exports = router;