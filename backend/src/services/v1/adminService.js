const adminModel = require("../../models/v1/adminModel");

async function getDashboardStats() {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalTryons,
    totalRevenue,
    recentOrders,
  ] = await Promise.all([
    adminModel.countUsers(),
    adminModel.countOrders(),
    adminModel.countProducts(),
    adminModel.countTryons(),
    adminModel.getTotalRevenue(),
    adminModel.getRecentOrders(),
  ]);

  return {
    totalUsers,
    totalOrders,
    totalProducts,
    totalTryons,
    totalRevenue,
    recentOrders,
  };
}

async function getOrders() {
  return adminModel.getAllOrders();
}

async function updateOrderStatus(orderId, status) {
  const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Statut invalide");
  }

  await adminModel.updateOrderStatus(orderId, status);

  return {
    success: true,
    status,
  };
}

async function getClients() {
  return adminModel.getAllClients();
}

async function getClient(id) {
  const client = await adminModel.getClientById(id);

  if (!client) {
    throw new Error("Client introuvable");
  }

  return client;
}

async function updateClient(id, data) {
  const allowedStatuses = ["active", "inactive", "suspended"];

  if (!allowedStatuses.includes(data.status)) {
    throw new Error("Statut client invalide");
  }

  const updated = await adminModel.updateClient(id, data);

  if (!updated) {
    throw new Error("Client introuvable");
  }

  return await adminModel.getClientById(id);
}

async function deleteClient(id) {
  const deleted = await adminModel.deleteClient(id);

  if (!deleted) {
    throw new Error("Client introuvable");
  }

  return { success: true };
}

async function getOrderDetails(orderId) {
  const order = await adminModel.getOrderById(orderId);

  if (!order) {
    throw new Error("Commande introuvable");
  }

  const items = await adminModel.getOrderItems(orderId);

  return {
    ...order,
    items,
  };
}

module.exports = {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  getOrderDetails,
};