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

async function getClients(req, res) {
  try {
    const clients = await adminService.getClients();

    return res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getClient(req, res) {
  try {
    const client = await adminService.getClient(req.params.id);

    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateClient(req, res) {
  try {
    const client = await adminService.updateClient(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Client mis à jour avec succès",
      data: client,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteClient(req, res) {
  try {
    await adminService.deleteClient(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Client désactivé avec succès",
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
    const order = await adminService.getOrderDetails(req.params.id);

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
  dashboard,
  getOrders,
  updateOrderStatus,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getOrderDetails,
};