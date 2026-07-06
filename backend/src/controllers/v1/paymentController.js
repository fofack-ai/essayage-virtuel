const paymentService = require("../../services/v1/paymentService");

async function getOrderPayment(req, res) {
  try {
    const { orderId } = req.params;

    const payment = await paymentService.getOrderPayment(orderId);

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function markPaymentAsPaid(req, res) {
  try {
    const { paymentId } = req.params;

    const result = await paymentService.markPaymentAsPaid(paymentId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getOrderPayment,
  markPaymentAsPaid,
};