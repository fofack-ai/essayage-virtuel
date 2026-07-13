// backend/src/models/v1/notificationModel.js

const db = require("../../config/database");

// ─── NOTIFICATIONS UTILISATEUR ───

async function createUserNotification(data) {
  const [result] = await db.query(
    `
    INSERT INTO user_notifications
    (userId, type, title, message, isRead)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.userId,
      data.type || "info",
      data.title,
      data.message,
      data.isRead ? 1 : 0,
    ]
  );
  return result.insertId;
}

async function getUserNotifications(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.userId) {
    conditions.push("userId = ?");
    values.push(filters.userId);
  }

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
      userId,
      type,
      title,
      message,
      isRead AS \`read\`,
      DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') AS date,
      DATE_FORMAT(createdAt, '%Y-%m-%d') AS createdAt
    FROM user_notifications
    ${where}
    ORDER BY createdAt DESC
    LIMIT 200
    `,
    values
  );

  return rows;
}

async function getUserNotificationById(id, userId) {
  const [rows] = await db.query(
    "SELECT * FROM user_notifications WHERE id = ? AND userId = ? LIMIT 1",
    [id, userId]
  );
  return rows[0];
}

async function getUserUnreadCount(userId) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM user_notifications WHERE userId = ? AND isRead = 0",
    [userId]
  );
  return rows[0]?.count || 0;
}

async function markUserNotificationAsRead(id, userId) {
  await db.query(
    "UPDATE user_notifications SET isRead = 1 WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

async function markAllUserNotificationsAsRead(userId) {
  await db.query(
    "UPDATE user_notifications SET isRead = 1 WHERE userId = ?",
    [userId]
  );
}

async function deleteUserNotification(id, userId) {
  await db.query(
    "DELETE FROM user_notifications WHERE id = ? AND userId = ?",
    [id, userId]
  );
}

// ─── NOTIFICATIONS ADMIN ───

// backend/src/models/v1/notificationModel.js

async function createAdminNotification(data) {
  console.log("📝 SQL: INSERT INTO admin_notifications avec:", data);
  
  const [result] = await db.query(
    `
    INSERT INTO admin_notifications
    (adminId, type, title, message, isRead)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      data.adminId,
      data.type || "info",
      data.title,
      data.message,
      data.isRead ? 1 : 0,
    ]
  );
  
  console.log("✅ Admin notification insérée, insertId:", result.insertId);
  return result.insertId;
}

async function getAdminNotifications(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.adminId) {
    conditions.push("adminId = ?");
    values.push(filters.adminId);
  }

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
      adminId,
      type,
      title,
      message,
      isRead AS \`read\`,
      DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') AS date,
      DATE_FORMAT(createdAt, '%Y-%m-%d') AS createdAt
    FROM admin_notifications
    ${where}
    ORDER BY createdAt DESC
    LIMIT 200
    `,
    values
  );

  return rows;
}

async function getAdminNotificationById(id, adminId) {
  const [rows] = await db.query(
    "SELECT * FROM admin_notifications WHERE id = ? AND adminId = ? LIMIT 1",
    [id, adminId]
  );
  return rows[0];
}

async function getAdminUnreadCount(adminId) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM admin_notifications WHERE adminId = ? AND isRead = 0",
    [adminId]
  );
  return rows[0]?.count || 0;
}

async function markAdminNotificationAsRead(id, adminId) {
  await db.query(
    "UPDATE admin_notifications SET isRead = 1 WHERE id = ? AND adminId = ?",
    [id, adminId]
  );
}

async function markAllAdminNotificationsAsRead(adminId) {
  await db.query(
    "UPDATE admin_notifications SET isRead = 1 WHERE adminId = ?",
    [adminId]
  );
}

async function deleteAdminNotification(id, adminId) {
  await db.query(
    "DELETE FROM admin_notifications WHERE id = ? AND adminId = ?",
    [id, adminId]
  );
}

// ─── EXPORTS ───

module.exports = {
  // Utilisateur
  createUserNotification,
  getUserNotifications,
  getUserNotificationById,
  getUserUnreadCount,
  markUserNotificationAsRead,
  markAllUserNotificationsAsRead,
  deleteUserNotification,
  
  // Admin
  createAdminNotification,
  getAdminNotifications,
  getAdminNotificationById,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteAdminNotification,
};