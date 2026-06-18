const adminService = require("../../services/v1/adminService");

async function dashboard(req, res) {
  try {
    const data = await adminService.getDashboardStats();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await adminService.getOrders();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const result = await adminService.updateOrderStatus(
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Statut mis à jour",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  dashboard,
  getOrders,
  updateOrderStatus,
};