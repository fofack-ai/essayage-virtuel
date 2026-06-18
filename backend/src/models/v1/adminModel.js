const db = require("../../config/database");

async function countUsers() {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM users");
  return rows[0].total;
}

async function countOrders() {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM orders");
  return rows[0].total;
}

async function countProducts() {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM products");
  return rows[0].total;
}

async function countTryons() {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM tryons");
  return rows[0].total;
}

async function getTotalRevenue() {
  const [rows] = await db.query(
    "SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status != 'cancelled'"
  );

  return rows[0].total;
}

async function getRecentOrders() {
  const [rows] = await db.query(`
    SELECT
      o.id,
      o.orderNumber,
      o.total,
      o.status,
      o.paymentMethod,
      o.paymentStatus,
      o.createdAt,
      u.firstName,
      u.lastName,
      u.email
    FROM orders o
    JOIN users u ON o.userId = u.id
    ORDER BY o.createdAt DESC
    LIMIT 5
  `);

  return rows;
}

async function getAllOrders() {
  const [rows] = await db.query(`
    SELECT
      o.id,
      o.orderNumber,
      o.total,
      o.status,
      o.paymentMethod,
      o.paymentStatus,
      o.deliveryCity,
      o.deliveryPhone,
      o.createdAt,
      u.firstName,
      u.lastName,
      u.email
    FROM orders o
    JOIN users u ON o.userId = u.id
    ORDER BY o.createdAt DESC
  `);

  return rows;
}

async function updateOrderStatus(orderId, status) {
  await db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, orderId]
  );
}

module.exports = {
  countUsers,
  countOrders,
  countProducts,
  countTryons,
  getTotalRevenue,
  getRecentOrders,
  getAllOrders,
  updateOrderStatus,
};