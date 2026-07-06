const paymentModel = require("../../models/v1/paymentModel");

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