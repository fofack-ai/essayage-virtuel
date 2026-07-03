const db = require("../../config/database");

async function createLog(data) {
  const [result] = await db.query(
    `
    INSERT INTO activity_logs
    (userId, userName, action, severity, ipAddress)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.userId || null,
      data.userName || "Administrateur",
      data.action,
      data.severity || "info",
      data.ipAddress || null,
    ]
  );

  return result.insertId;
}

async function getLogs(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.severity && filters.severity !== "all") {
    conditions.push("severity = ?");
    values.push(filters.severity);
  }

  if (filters.search) {
    conditions.push("(userName LIKE ? OR action LIKE ? OR ipAddress LIKE ?)");
    values.push(
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`
    );
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [rows] = await db.query(
    `
    SELECT
      id,
      userId,
      userName AS user,
      action,
      severity,
      ipAddress AS ip,
      DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') AS date
    FROM activity_logs
    ${where}
    ORDER BY createdAt DESC
    LIMIT 200
    `,
    values
  );

  return rows;
}

async function getLogById(id) {
  const [rows] = await db.query(
    "SELECT * FROM activity_logs WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0];
}

async function deleteLog(id) {
  await db.query("DELETE FROM activity_logs WHERE id = ?", [id]);
}

module.exports = {
  createLog,
  getLogs,
  getLogById,
  deleteLog,
};