const paymentModel = require("../../models/v1/paymentModel");
const notificationModel = require("../../models/v1/notificationModel");

const orderModel = require("../../models/v1/orderModel");
const notificationService = require("./notificationService");

async function createCashPayment(order) {
  const paymentId = await paymentModel.createPayment({
    orderId: order.id,
    paymentMethod: "cash_on_delivery",
    provider: "manual",
    amount: order.total,
    currency: "XAF",
    status: "pending",
  });

  return {
    id: paymentId,
    orderId: order.id,
    paymentMethod: "cash_on_delivery",
    provider: "manual",
    status: "pending",
  };
}

async function getOrderPayment(orderId) {
  return await paymentModel.findByOrderId(orderId);
}

async function markPaymentAsPaid(paymentId) {
  await paymentModel.updateStatus(paymentId, "paid");

  // Récupérer le paiement pour avoir l'orderId
  const payment = await paymentModel.findById(paymentId);
  if (payment) {
    const order = await orderModel.getOrderById(payment.orderId, null);
    
    // ─── AJOUT : Notification de paiement validé ───
    if (order) {
      // ─── Notification pour le client ───
      try {
        await notificationService.createUserNotification({
          userId: order.userId,
          type: "payment",
          title: "Paiement validé",
          message: `Votre paiement de ${Number(order.total).toLocaleString()} FCFA pour la commande ${order.orderNumber} a été confirmé.`,
          isRead: false,
        });
      } catch (err) {
        console.error("Erreur création notification paiement:", err.message);
      }

      // ─── Notification pour l'admin ───
      try {
        await notificationService.createAdminNotification({
          adminId: 1, // ID de l'admin
          type: "payment",
          title: "Paiement reçu",
          message: `Paiement de ${Number(order.total).toLocaleString()} FCFA pour la commande ${order.orderNumber}.`,
          isRead: false,
        });
      } catch (err) {
        console.error("Erreur création notification admin paiement:", err.message);
      }
    }
  }

  return {
    success: true,
    message: "Paiement marqué comme payé",
  };
}

module.exports = {
  createCashPayment,
  getOrderPayment,
  markPaymentAsPaid,
};