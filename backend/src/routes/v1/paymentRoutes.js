const express = require("express");
const router = express.Router();

const paymentController = require("../../controllers/v1/paymentController");
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");

router.get("/orders/:orderId/payment", auth, paymentController.getOrderPayment);
router.put("/:paymentId/paid", auth, admin, paymentController.markPaymentAsPaid);

module.exports = router;