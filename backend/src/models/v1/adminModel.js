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
    LEFT JOIN users u ON o.userId = u.id
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
    LEFT JOIN users u ON o.userId = u.id
    ORDER BY o.createdAt DESC
  `);

  return rows;
}

async function updateOrderStatus(orderId, status) {
  const [result] = await db.query(
    "UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [status, orderId]
  );

  return result.affectedRows > 0;
}

async function getAllClients() {
  const [rows] = await db.query(`
    SELECT
      u.id,
      u.firstName,
      u.lastName,
      u.email,
      u.role,
      u.phone,
      u.address,
      u.city,
      u.status,
      u.createdAt,
      COUNT(DISTINCT o.id) AS orders,
      COUNT(DISTINCT t.id) AS tryons,
      COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0 END), 0) AS totalSpent
    FROM users u
    LEFT JOIN orders o ON o.userId = u.id
    LEFT JOIN tryons t ON t.userId = u.id
    WHERE u.role = 'client'
    GROUP BY u.id
    ORDER BY u.createdAt DESC
  `);

  return rows;
}

async function getClientById(id) {
  const [rows] = await db.query(`
    SELECT
      u.id,
      u.firstName,
      u.lastName,
      u.email,
      u.role,
      u.phone,
      u.address,
      u.city,
      u.status,
      u.createdAt,
      COUNT(DISTINCT o.id) AS orders,
      COUNT(DISTINCT t.id) AS tryons,
      COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0 END), 0) AS totalSpent
    FROM users u
    LEFT JOIN orders o ON o.userId = u.id
    LEFT JOIN tryons t ON t.userId = u.id
    WHERE u.id = ?
    GROUP BY u.id
    LIMIT 1
  `, [id]);

  return rows[0];
}

async function updateClient(id, data) {
  const [result] = await db.query(
    `
    UPDATE users
    SET firstName = ?, lastName = ?, phone = ?, address = ?, city = ?, status = ?
    WHERE id = ? AND role = 'client'
    `,
    [
      data.firstName,
      data.lastName,
      data.phone || null,
      data.address || null,
      data.city || null,
      data.status || "active",
      id,
    ]
  );

  return result.affectedRows > 0;
}

async function deleteClient(id) {
  const [result] = await db.query(
    `
    UPDATE users
    SET status = 'inactive'
    WHERE id = ? AND role = 'client'
    `,
    [id]
  );

  return result.affectedRows > 0;
}

async function getOrderById(orderId) {
  const [rows] = await db.query(
    `
    SELECT
      o.id,
      o.userId,
      o.orderNumber,
      o.total,
      o.status,
      o.paymentMethod,
      o.paymentStatus,
      o.deliveryAddress,
      o.deliveryCity,
      o.deliveryPhone,
      o.createdAt,
      o.updatedAt,
      u.firstName,
      u.lastName,
      u.email
    FROM orders o
    LEFT JOIN users u ON o.userId = u.id
    WHERE o.id = ?
    LIMIT 1
    `,
    [orderId]
  );

  return rows[0];
}

async function getOrderItems(orderId) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      productId,
      productName,
      productImage,
      size,
      color,
      quantity,
      price,
      subtotal,
      createdAt
    FROM order_items
    WHERE orderId = ?
    `,
    [orderId]
  );

  return rows;
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
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getOrderById,
  getOrderItems,
};