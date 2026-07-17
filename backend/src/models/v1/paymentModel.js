const db = require("../../config/database");

async function createPayment(connection, data) {
  const [result] = await connection.query(
    `
    INSERT INTO payments
    (
      orderId,
      paymentMethod,
      provider,
      transactionId,
      amount,
      currency,
      status,
      paymentUrl
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.orderId,
      data.paymentMethod,
      data.provider,
      data.transactionId,
      data.amount,
      data.currency,
      data.status,
      data.paymentUrl
    ]
  );

  return result.insertId;
}

async function findByOrderId(orderId) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM payments
    WHERE orderId = ?
    ORDER BY createdAt DESC
    LIMIT 1
    `,
    [orderId]
  );

  return rows[0];
}

async function findById(id) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM payments
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0];
}

async function findByTransactionId(transactionId) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM payments
    WHERE transactionId = ?
    LIMIT 1
    `,
    [transactionId]
  );

  return rows[0];
}

async function updateStatus(id, status) {
  await db.query(
    `
    UPDATE payments
    SET status = ?,
        paidAt = CASE WHEN ? = 'paid' THEN NOW() ELSE paidAt END
    WHERE id = ?
    `,
    [status, status, id]
  );
}

async function updatePaymentUrl(id, paymentUrl, transactionId = null) {
  await db.query(
    `
    UPDATE payments
    SET paymentUrl = ?,
        transactionId = COALESCE(?, transactionId),
        status = 'processing'
    WHERE id = ?
    `,
    [paymentUrl, transactionId, id]
  );
}

module.exports = {
  createPayment,
  findByOrderId,
  findById,
  findByTransactionId,
  updateStatus,
  updatePaymentUrl,
};