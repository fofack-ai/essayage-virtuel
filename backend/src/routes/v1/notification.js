// backend/src/routes/v1/notification.js

const express = require("express");
const auth = require("../../middleware/auth");
const notificationController = require("../../controllers/v1/notificationController");

const router = express.Router();

// ✅ Toutes les routes utilisent le middleware auth
router.get("/", auth, notificationController.getNotifications);
router.post("/", auth, notificationController.createNotification);
router.patch("/:id/read", auth, notificationController.markAsRead);
router.patch("/read-all", auth, notificationController.markAllAsRead);
router.delete("/:id", auth, notificationController.deleteNotification);

module.exports = router;