const db = require("../../config/database");

async function createOrder(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO orders
     (userId, orderNumber, total, status, paymentMethod, paymentStatus,
      deliveryAddress, deliveryCity, deliveryPhone, deliveryType, deliveryFee)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.orderNumber,
      data.total,
      "pending",
      data.paymentMethod    || "cash_on_delivery",
      data.paymentStatus    || "pending",
      data.deliveryAddress  || null,
      data.deliveryCity     || null,
      data.deliveryPhone    || null,
      data.deliveryType     || "std",
      data.deliveryFee      ?? 0,
    ]
  );
  return result.insertId;
}

async function createOrderItem(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO order_items
     (orderId, productId, productName, productImage, size, color, quantity, price, subtotal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.orderId,
      data.productId    || null,
      data.productName,
      data.productImage || null,
      data.size         || null,
      data.color        || null,
      data.quantity,
      data.price,
      data.subtotal,
    ]
  );
  return result.insertId;
}

async function markCartAsConverted(connection, cartId) {
  await connection.query(
    "UPDATE carts SET status = 'converted' WHERE id = ?",
    [cartId]
  );
}

async function getUserOrders(userId) {
  const [rows] = await db.query(
    `SELECT id, orderNumber, total, status, paymentMethod, paymentStatus,
            deliveryAddress, deliveryCity, deliveryPhone,
            deliveryType, deliveryFee,
            createdAt, updatedAt
     FROM orders
     WHERE userId = ?
     ORDER BY createdAt DESC`,
    [userId]
  );
  return rows;
}

async function getOrderById(orderId, userId) {
  const [rows] = await db.query(
    `SELECT id, userId, orderNumber, total, status, paymentMethod, paymentStatus,
            deliveryAddress, deliveryCity, deliveryPhone,
            deliveryType, deliveryFee,
            createdAt, updatedAt
     FROM orders
     WHERE id = ? AND userId = ?
     LIMIT 1`,
    [orderId, userId]
  );
  return rows[0];
}

async function getOrderItems(orderId) {
  const [rows] = await db.query(
    `SELECT id, productId, productName, productImage, size, color,
            quantity, price, subtotal, createdAt
     FROM order_items
     WHERE orderId = ?`,
    [orderId]
  );
  return rows;
}

async function updatePaymentStatus(orderId, paymentStatus) {
  await db.query(
    `UPDATE orders SET paymentStatus = ? WHERE id = ?`,
    [paymentStatus, orderId]
  );
}

module.exports = {
  createOrder,
  createOrderItem,
  markCartAsConverted,
  getUserOrders,
  getOrderById,
  getOrderItems,
  updatePaymentStatus,
};