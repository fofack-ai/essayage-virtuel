const express = require("express");
const router = express.Router();

const paymentController = require("../../controllers/v1/paymentController");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

// Existant (paiement à la livraison)
router.get("/orders/:orderId/payment", auth, paymentController.getOrderPayment);
router.put("/:paymentId/paid", auth, admin, paymentController.markPaymentAsPaid);

// Paydunya (paiement en ligne)
router.post("/paydunya/init", auth, paymentController.initPaydunya);
router.post("/paydunya/callback", paymentController.paydunyaCallback);
router.get("/paydunya/callback", paymentController.paydunyaCallback);

module.exports = router;