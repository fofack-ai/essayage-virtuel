const db = require("../../config/database");
const paymentModel = require("../../models/v1/paymentModel");
const orderModel = require("../../models/v1/orderModel");
const paydunyaService = require("../../services/v1/paydunyaService");
const campayService = require("../../services/v1/campayService");

// ── Consulter le paiement d'une commande ──
async function getOrderPayment(req, res) {
  try {
    const { orderId } = req.params;

    const order = await orderModel.getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    const payment = await paymentModel.findByOrderId(orderId);
    return res.json({ success: true, data: payment || null });
  } catch (error) {
    console.error("[getOrderPayment]", error.message);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// ── Administrateur : marquer un paiement comme réglé ──
async function markPaymentAsPaid(req, res) {
  try {
    const { paymentId } = req.params;

    const payment = await paymentModel.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Paiement introuvable" });
    }

    await paymentModel.updateStatus(payment.id, "paid");
    await orderModel.updatePaymentStatus(payment.orderId, "paid");

    return res.json({ success: true, message: "Paiement marqué comme réglé" });
  } catch (error) {
    console.error("[markPaymentAsPaid]", error.message);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// ── Paydunya : créer la facture et renvoyer l'URL de paiement ──
async function initPaydunya(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Commande requise" });
    }

    const order = await orderModel.getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    const invoice = await paydunyaService.createInvoice({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      customer: {
        name: req.user.email || "Client CFPD TryOn",
        email: req.user.email || "",
        phone: order.deliveryPhone || "",
      },
    });

    await paymentModel.createPayment(db, {
      orderId: order.id,
      paymentMethod: order.paymentMethod,
      provider: "paydunya",
      transactionId: invoice.token,
      amount: order.total,
      currency: "XAF",
      status: "processing",
      paymentUrl: invoice.paymentUrl,
    });

    return res.json({
      success: true,
      paymentUrl: invoice.paymentUrl,
      token: invoice.token,
    });
  } catch (error) {
    console.error("[initPaydunya]", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Le paiement en ligne est indisponible pour le moment.",
    });
  }
}

// ── Paydunya : notification de changement de statut ──
// Paydunya appelle cette route en arrière-plan. On répond toujours 200
// pour éviter que Paydunya ne réessaie indéfiniment.
async function paydunyaCallback(req, res) {
  try {
    const token = req.body?.data?.invoice?.token || req.body?.token || req.query?.token;
    if (!token) return res.status(200).json({ success: true });

    const result = await paydunyaService.confirmInvoice(token);
    const payment = await paymentModel.findByTransactionId(token);

    if (result.status === "completed") {
      if (payment) await paymentModel.updateStatus(payment.id, "paid");
      if (result.orderId) await orderModel.updatePaymentStatus(result.orderId, "paid");
    } else if (result.status === "cancelled" || result.status === "failed") {
      if (payment) await paymentModel.updateStatus(payment.id, "failed");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[paydunyaCallback]", error.message);
    return res.status(200).json({ success: true });
  }
}

// ── Campay : déclencher la demande de code PIN sur le téléphone ──
async function initCampay(req, res) {
  try {
    const { orderId, phone } = req.body;
    if (!orderId || !phone) {
      return res.status(400).json({ success: false, message: "Commande et numéro requis" });
    }

    const order = await orderModel.getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Commande introuvable" });
    }

    const result = await campayService.initiateCollect({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      phone,
    });

    await paymentModel.createPayment(db, {
      orderId: order.id,
      paymentMethod: order.paymentMethod,
      provider: "campay",
      transactionId: result.reference,
      amount: order.total,
      currency: "XAF",
      status: "processing",
      paymentUrl: null,
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

// ── Campay : consulter le statut (interrogé en boucle par le frontend) ──
async function campayStatus(req, res) {
  try {
    const { reference } = req.params;
    const result = await campayService.checkStatus(reference);
    const payment = await paymentModel.findByTransactionId(reference);

    if (result.status === "SUCCESSFUL") {
      if (payment) await paymentModel.updateStatus(payment.id, "paid");
      if (result.orderId) await orderModel.updatePaymentStatus(result.orderId, "paid");
    } else if (result.status === "FAILED") {
      console.warn("[campayStatus] Paiement échoué :", result.reason);
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