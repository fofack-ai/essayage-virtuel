const campayService = require("../../services/v1/campayService");

// ── Campay : déclencher la demande de code PIN ──
async function initCampay(req, res) {
  try {
    const { orderId, phone } = req.body;
    if (!orderId || !phone) {
      return res.status(400).json({ success: false, message: "Commande et numéro requis" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    const result = await campayService.initiateCollect({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      phone,
    });

    // On enregistre la référence pour pouvoir suivre la transaction ensuite
    await paymentModel.create({
      orderId: order.id,
      amount: order.total,
      provider: "campay",
      transactionId: result.reference,
      status: "pending",
    });

    return res.json({
      success: true,
      reference: result.reference,
      operator: result.operator,
    });
  } catch (error) {
    console.error("[initCampay]", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Impossible de déclencher le paiement. Vérifiez votre numéro.",
    });
  }
}

// ── Campay : consulter le statut (appelé en boucle par le frontend) ──
async function campayStatus(req, res) {
  try {
    const { reference } = req.params;
    const result = await campayService.checkStatus(reference);

    if (result.status === "SUCCESSFUL") {
      const payment = await paymentModel.findByTransactionId(reference);
      if (payment) await paymentModel.updateStatus(payment.id, "paid");
      if (result.orderId) await orderModel.updatePaymentStatus(result.orderId, "paid");
} else if (result.status === "FAILED") {
      console.warn("[campayStatus] Paiement échoué :", result.reason);
      const payment = await paymentModel.findByTransactionId(reference);
      if (payment) await paymentModel.updateStatus(payment.id, "failed");
    }

    return res.json({ success: true, status: result.status });
  } catch (error) {
    console.error("[campayStatus]", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Vérification impossible" });
  }
}

module.exports = {
  getOrderPayment,
  markPaymentAsPaid,
  initPaydunya,
  paydunyaCallback,
  initCampay,
  campayStatus,
};