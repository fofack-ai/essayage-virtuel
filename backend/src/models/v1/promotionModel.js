const db = require("../../config/database");

async function getPromotions(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.active === "true") conditions.push("isActive = 1");
  if (filters.active === "false") conditions.push("isActive = 0");

  if (filters.search) {
    conditions.push("(code LIKE ? OR title LIKE ?)");
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT
      id,
      code,
      title,
      type,
      value,
      maxUsage,
      usedCount,
      DATE_FORMAT(expiresAt, '%Y-%m-%d') AS expires,
      isActive AS active,
      DATE_FORMAT(createdAt, '%Y-%m-%d') AS date
    FROM promotions
    ${where}
    ORDER BY createdAt DESC
    LIMIT 200
    `,
    values
  );

  return rows;
}

async function getPromotionById(id) {
  const [rows] = await db.query(
    "SELECT * FROM promotions WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0];
}

async function getPromotionByCode(code) {
  const [rows] = await db.query(
    "SELECT * FROM promotions WHERE code = ? LIMIT 1",
    [code]
  );

  return rows[0];
}

async function createPromotion(data) {
  const [result] = await db.query(
    `
    INSERT INTO promotions
    (code, title, type, value, maxUsage, expiresAt, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.code,
      data.title || null,
      data.type || "percentage",
      data.value,
      data.maxUsage || 100,
      data.expires || null,
      data.active === false ? 0 : 1,
    ]
  );

  return result.insertId;
}

async function updatePromotion(id, data) {
  await db.query(
    `
    UPDATE promotions
    SET
      code = ?,
      title = ?,
      type = ?,
      value = ?,
      maxUsage = ?,
      expiresAt = ?,
      isActive = ?
    WHERE id = ?
    `,
    [
      data.code,
      data.title || null,
      data.type || "percentage",
      data.value,
      data.maxUsage || 100,
      data.expires || null,
      data.active === false ? 0 : 1,
      id,
    ]
  );
}

async function deletePromotion(id) {
  await db.query("DELETE FROM promotions WHERE id = ?", [id]);
}

async function togglePromotion(id, active) {
  await db.query(
    "UPDATE promotions SET isActive = ? WHERE id = ?",
    [active ? 1 : 0, id]
  );
}

module.exports = {
  getPromotions,
  getPromotionById,
  getPromotionByCode,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
};