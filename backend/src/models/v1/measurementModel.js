const db = require("../../config/database");

async function create(userId, data) {
  const [result] = await db.query(
    `
    INSERT INTO user_measurements
    (userId, method, heightCm, shoulderCm, chestCm, waistCm, hipCm, inseamCm,
     isStretchFabric, calibrationRefMm, confidence, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      data.method,
      data.heightCm ?? null,
      data.shoulderCm ?? null,
      data.chestCm ?? null,
      data.waistCm ?? null,
      data.hipCm ?? null,
      data.inseamCm ?? null,
      data.isStretchFabric ? 1 : 0,
      data.calibrationRefMm ?? 85.6,
      data.method === "manual" ? "mesuree" : "estimee",
      data.notes ?? null,
    ]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await db.query("SELECT * FROM user_measurements WHERE id = ?", [id]);
  return rows[0];
}

async function findLatestByUserId(userId) {
  const [rows] = await db.query(
    `SELECT * FROM user_measurements WHERE userId = ? ORDER BY createdAt DESC LIMIT 1`,
    [userId]
  );
  return rows[0];
}

async function findAllByUserId(userId) {
  const [rows] = await db.query(
    `SELECT * FROM user_measurements WHERE userId = ? ORDER BY createdAt DESC`,
    [userId]
  );
  return rows;
}

async function remove(id, userId) {
  const [result] = await db.query(
    "DELETE FROM user_measurements WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
}

module.exports = { create, findById, findLatestByUserId, findAllByUserId, remove };