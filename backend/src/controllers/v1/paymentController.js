const paymentService = require("../../services/v1/paymentService");
const paydunyaService = require("../../services/v1/paydunyaService");
const paymentModel = require("../../models/v1/paymentModel");
const orderModel = require("../../models/v1/orderModel");

async function getOrderPayment(req, res) {
  try {
    const { orderId } = req.params;
    const payment = await paymentService.getOrderPayment(orderId);
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function markPaymentAsPaid(req, res) {
  try {
    const { paymentId } = req.params;
    const result = await paymentService.markPaymentAsPaid(paymentId);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ── Paydunya : lancer le paiement en ligne ──
async function initPaydunya(req, res) {
  try {
    const { orderId } = req.body;

    const order = await orderModel.getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Cette commande est déjà payée" });
    }

    const { token, paymentUrl } = await paydunyaService.createInvoice({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      customer: {
        name: req.user.firstName
          ? `${req.user.firstName} ${req.user.lastName || ""}`.trim()
          : "Client TryOn",
        email: req.user.email,
        phone: order.deliveryPhone,
      },
    });

    const payment = await paymentModel.findByOrderId(order.id);
    if (payment) {
      await paymentModel.updatePaymentUrl(payment.id, paymentUrl, token);
    }

    return res.status(200).json({ success: true, data: { paymentUrl } });
  } catch (error) {
    console.error("[initPaydunya]", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ── Paydunya : callback (appelé par Paydunya, pas par le client) ──
async function paydunyaCallback(req, res) {
  try {
    const token =
      req.body?.data?.invoice?.token || req.body?.token || req.query.token;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token manquant" });
    }

    const result = await paydunyaService.confirmInvoice(token);

    if (result.status === "completed" && result.orderId) {
      const payment = await paymentModel.findByTransactionId(token);
      if (payment) {
        await paymentModel.updateStatus(payment.id, "completed");
      }
      await orderModel.updatePaymentStatus(result.orderId, "paid");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[paydunyaCallback]", error.message);
    return res.status(200).json({ success: true });
  }
}

module.exports = {
  getOrderPayment,
  markPaymentAsPaid,
  initPaydunya,
  paydunyaCallback,
};