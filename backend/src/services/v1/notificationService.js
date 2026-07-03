const notificationModel = require("../../models/v1/notificationModel");

async function createNotification(body) {
  if (!body.title) {
    throw new Error("Titre requis");
  }

  if (!body.message) {
    throw new Error("Message requis");
  }

  return notificationModel.createNotification({
    type: body.type || "info",
    title: body.title,
    message: body.message,
    isRead: body.isRead || false,
  });
}

async function getNotifications(query) {
  return notificationModel.getNotifications({
    type: query.type,
    read: query.read,
    search: query.search,
  });
}

async function markAsRead(id) {
  const notification = await notificationModel.getNotificationById(id);

  if (!notification) {
    throw new Error("Notification introuvable");
  }

  await notificationModel.markAsRead(id);
}

async function markAllAsRead() {
  await notificationModel.markAllAsRead();
}

async function deleteNotification(id) {
  const notification = await notificationModel.getNotificationById(id);

  if (!notification) {
    throw new Error("Notification introuvable");
  }

  await notificationModel.deleteNotification(id);
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};