// backend/src/controllers/v1/notificationController.js

const notificationService = require("../../services/v1/notificationService");

// ─── UTILISATEUR ───

async function getUserNotifications(req, res) {
  try {
    const userId = req.user.id;
    
    // Vérifier que l'utilisateur n'est pas admin (ou autoriser les deux)
    // Si admin, il utilise getAdminNotifications
    if (req.user.role === 'admin') {
      return getAdminNotifications(req, res);
    }

    const filters = {
      userId: userId,
      type: req.query.type,
      read: req.query.read,
      search: req.query.search,
    };

    const notifications = await notificationService.getUserNotifications(filters);
    const unreadCount = await notificationService.getUserUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function markUserNotificationAsRead(req, res) {
  try {
    const userId = req.user.id;
    await notificationService.markUserNotificationAsRead(req.params.id, userId);

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

async function markAllUserNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;
    await notificationService.markAllUserNotificationsAsRead(userId);

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

async function deleteUserNotification(req, res) {
  try {
    const userId = req.user.id;
    await notificationService.deleteUserNotification(req.params.id, userId);

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

// ─── ADMIN ───

// backend/src/controllers/v1/notificationController.js

async function getAdminNotifications(req, res) {
  try {
    const adminId = req.user.id;
    console.log("🔔 Récupération notifications admin pour adminId:", adminId);

    const filters = {
      adminId: adminId,
      type: req.query.type,
      read: req.query.read,
      search: req.query.search,
    };

    const notifications = await notificationService.getAdminNotifications(filters);
    const unreadCount = await notificationService.getAdminUnreadCount(adminId);

    console.log("✅ Notifications admin trouvées:", notifications.length);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("❌ Erreur getAdminNotifications:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function markAdminNotificationAsRead(req, res) {
  try {
    const adminId = req.user.id;
    await notificationService.markAdminNotificationAsRead(req.params.id, adminId);

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

async function markAllAdminNotificationsAsRead(req, res) {
  try {
    const adminId = req.user.id;
    await notificationService.markAllAdminNotificationsAsRead(adminId);

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

async function deleteAdminNotification(req, res) {
  try {
    const adminId = req.user.id;
    await notificationService.deleteAdminNotification(req.params.id, adminId);

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

// ─── MAIN ENTRY POINT ───

async function getNotifications(req, res) {
  if (req.user.role === 'admin') {
    return getAdminNotifications(req, res);
  }
  return getUserNotifications(req, res);
}

async function markAsRead(req, res) {
  if (req.user.role === 'admin') {
    return markAdminNotificationAsRead(req, res);
  }
  return markUserNotificationAsRead(req, res);
}

async function markAllAsRead(req, res) {
  if (req.user.role === 'admin') {
    return markAllAdminNotificationsAsRead(req, res);
  }
  return markAllUserNotificationsAsRead(req, res);
}

async function deleteNotification(req, res) {
  if (req.user.role === 'admin') {
    return deleteAdminNotification(req, res);
  }
  return deleteUserNotification(req, res);
}

// ─── CRÉATION DE NOTIFICATIONS ───

async function createNotification(req, res) {
  try {
    const { userId, adminId, type, title, message } = req.body;

    console.log("📝 createNotification reçu:", { userId, adminId, type, title, message });

    let id;
    if (adminId) {
      console.log("✅ Création notification admin pour adminId:", adminId);
      id = await notificationService.createAdminNotification({
        adminId,
        type,
        title,
        message,
      });
    } else if (userId) {
      console.log("✅ Création notification utilisateur pour userId:", userId);
      id = await notificationService.createUserNotification({
        userId,
        type,
        title,
        message,
      });
    } else {
      // 👇 Utiliser un admin existant (par exemple l'ID 21)
      const defaultAdminId = 21; // ou 13, 19, 25 selon celui que vous voulez
      console.log("⚠️ Aucun ID fourni, utilisation adminId par défaut:", defaultAdminId);
      id = await notificationService.createAdminNotification({
        adminId: defaultAdminId,
        type,
        title,
        message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Notification créée",
      data: { id },
    });
  } catch (error) {
    console.error("❌ Erreur createNotification:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};