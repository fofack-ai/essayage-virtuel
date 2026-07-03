const express = require("express");

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const notificationController = require("../../controllers/v1/notificationController");

const router = express.Router();

router.get("/", auth, admin, notificationController.getNotifications);
router.post("/", auth, admin, notificationController.createNotification);
router.patch("/:id/read", auth, admin, notificationController.markAsRead);
router.patch("/read-all", auth, admin, notificationController.markAllAsRead);
router.delete("/:id", auth, admin, notificationController.deleteNotification);

module.exports = router;