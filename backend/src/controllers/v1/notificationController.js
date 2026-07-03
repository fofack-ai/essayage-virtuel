const notificationService = require("../../services/v1/notificationService");

async function createNotification(req, res) {
  try {
    const id = await notificationService.createNotification(req.body);

    return res.status(201).json({
      success: true,
      message: "Notification créée",
      data: { id },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getNotifications(req, res) {
  try {
    const notifications = await notificationService.getNotifications(req.query);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function markAsRead(req, res) {
  try {
    await notificationService.markAsRead(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Notification marquée comme lue",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function markAllAsRead(req, res) {
  try {
    await notificationService.markAllAsRead();

    return res.status(200).json({
      success: true,
      message: "Toutes les notifications ont été marquées comme lues",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteNotification(req, res) {
  try {
    await notificationService.deleteNotification(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Notification supprimée",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};