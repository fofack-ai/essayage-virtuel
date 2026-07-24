const orderService = require("../../services/v1/orderService");

async function createOrder(req, res) {
  try {
    const order = await orderService.createOrderFromCart(
      req.user.id,
      req.body,
      req.guestId || req.cookies?.guestId || null
    );

    return res.status(201).json({
      success: true,
      message: "Commande créée avec succès",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await orderService.getMyOrders(req.user.id);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getOrderDetails(req, res) {
  try {
    const order = await orderService.getOrderDetails(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
};