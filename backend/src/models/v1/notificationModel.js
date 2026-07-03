const db = require("../../config/database");

async function createNotification(data) {
  const [result] = await db.query(
    `
    INSERT INTO notifications
    (type, title, message, isRead)
    VALUES (?, ?, ?, ?)
    `,
    [
      data.type || "info",
      data.title,
      data.message,
      data.isRead ? 1 : 0,
    ]
  );

  return result.insertId;
}

async function getNotifications(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.type && filters.type !== "all") {
    conditions.push("type = ?");
    values.push(filters.type);
  }

  if (filters.read === "true") {
    conditions.push("isRead = 1");
  }

  if (filters.read === "false") {
    conditions.push("isRead = 0");
  }

  if (filters.search) {
    conditions.push("(title LIKE ? OR message LIKE ?)");
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT
      id,
      type,
      title,
      message,
      isRead AS \`read\`,
      DATE_FORMAT(createdAt, '%Y-%m-%d') AS date
    FROM notifications
    ${where}
    ORDER BY createdAt DESC
    LIMIT 200
    `,
    values
  );

  return rows;
}

async function getNotificationById(id) {
  const [rows] = await db.query(
    "SELECT * FROM notifications WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0];
}

async function markAsRead(id) {
  await db.query(
    "UPDATE notifications SET isRead = 1 WHERE id = ?",
    [id]
  );
}

async function markAllAsRead() {
  await db.query("UPDATE notifications SET isRead = 1");
}

async function deleteNotification(id) {
  await db.query("DELETE FROM notifications WHERE id = ?", [id]);
}

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};