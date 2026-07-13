// backend/src/services/v1/notificationService.js

const notificationModel = require("../../models/v1/notificationModel");

// ─── UTILISATEUR ───

async function createUserNotification(data) {
  if (!data.title) throw new Error("Titre requis");
  if (!data.message) throw new Error("Message requis");
  if (!data.userId) throw new Error("userId requis");

  return notificationModel.createUserNotification({
    userId: data.userId,
    type: data.type || "info",
    title: data.title,
    message: data.message,
    isRead: data.isRead || false,
  });
}

async function getUserNotifications(query) {
  return notificationModel.getUserNotifications({
    userId: query.userId,
    type: query.type,
    read: query.read,
    search: query.search,
  });
}

async function markUserNotificationAsRead(id, userId) {
  const notification = await notificationModel.getUserNotificationById(id, userId);
  if (!notification) throw new Error("Notification introuvable");
  await notificationModel.markUserNotificationAsRead(id, userId);
}

async function markAllUserNotificationsAsRead(userId) {
  await notificationModel.markAllUserNotificationsAsRead(userId);
}

async function deleteUserNotification(id, userId) {
  const notification = await notificationModel.getUserNotificationById(id, userId);
  if (!notification) throw new Error("Notification introuvable");
  await notificationModel.deleteUserNotification(id, userId);
}

async function getUserUnreadCount(userId) {
  return notificationModel.getUserUnreadCount(userId);
}

// ─── ADMIN ───

// backend/src/services/v1/notificationService.js

async function createAdminNotification(data) {
  
  if (!data.title) throw new Error("Titre requis");
  if (!data.message) throw new Error("Message requis");
  if (!data.adminId) throw new Error("adminId requis");

  console.log("📝 createAdminNotification appelé avec:", data);

  const result = await notificationModel.createAdminNotification({
    adminId: data.adminId,
    type: data.type || "info",
    title: data.title,
    message: data.message,
    isRead: data.isRead || false,
  });
  
  console.log("✅ Admin notification créée en base, ID:", result);
  return result;
}

async function getAdminNotifications(query) {
  return notificationModel.getAdminNotifications({
    adminId: query.adminId,
    type: query.type,
    read: query.read,
    search: query.search,
  });
}

async function markAdminNotificationAsRead(id, adminId) {
  const notification = await notificationModel.getAdminNotificationById(id, adminId);
  if (!notification) throw new Error("Notification introuvable");
  await notificationModel.markAdminNotificationAsRead(id, adminId);
}

async function markAllAdminNotificationsAsRead(adminId) {
  await notificationModel.markAllAdminNotificationsAsRead(adminId);
}

async function deleteAdminNotification(id, adminId) {
  const notification = await notificationModel.getAdminNotificationById(id, adminId);
  if (!notification) throw new Error("Notification introuvable");
  await notificationModel.deleteAdminNotification(id, adminId);
}

async function getAdminUnreadCount(adminId) {
  return notificationModel.getAdminUnreadCount(adminId);
}

module.exports = {
  // Utilisateur
  createUserNotification,
  getUserNotifications,
  markUserNotificationAsRead,
  markAllUserNotificationsAsRead,
  deleteUserNotification,
  getUserUnreadCount,
  
  // Admin
  createAdminNotification,
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteAdminNotification,
  getAdminUnreadCount,
};