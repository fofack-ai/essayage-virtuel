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

module.exports = {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
};