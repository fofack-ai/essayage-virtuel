const db = require("../../config/database");

async function getReviews(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.status && filters.status !== "all") {
    conditions.push("status = ?");
    values.push(filters.status);
  }

  if (filters.search) {
    conditions.push("(productName LIKE ? OR clientName LIKE ? OR comment LIKE ?)");
    values.push(
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT
      id,
      productId,
      userId,
      productName AS product,
      clientName AS client,
      rating,
      comment,
      status,
      DATE_FORMAT(createdAt, '%Y-%m-%d') AS date
    FROM reviews
    ${where}
    ORDER BY createdAt DESC
    LIMIT 200
    `,
    values
  );

  return rows;
}

async function getReviewById(id) {
  const [rows] = await db.query(
    "SELECT * FROM reviews WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0];
}

async function createReview(data) {
  const [result] = await db.query(
    `
    INSERT INTO reviews
    (productId, userId, productName, clientName, rating, comment, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.productId || null,
      data.userId || null,
      data.product,
      data.client,
      Number(data.rating || 5),
      data.comment,
      data.status || "pending",
    ]
  );

  return result.insertId;
}

async function updateReview(id, data) {
  await db.query(
    `
    UPDATE reviews
    SET
      productName = ?,
      clientName = ?,
      rating = ?,
      comment = ?,
      status = ?
    WHERE id = ?
    `,
    [
      data.product,
      data.client,
      Number(data.rating || 5),
      data.comment,
      data.status || "pending",
      id,
    ]
  );
}

async function updateReviewStatus(id, status) {
  await db.query(
    "UPDATE reviews SET status = ? WHERE id = ?",
    [status, id]
  );
}

async function deleteReview(id) {
  await db.query("DELETE FROM reviews WHERE id = ?", [id]);
}

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  updateReviewStatus,
  deleteReview,
};