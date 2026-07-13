const express = require("express");

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const settingsController = require("../../controllers/v1/settingsController");

const router = express.Router();

// ✅ ROUTE PUBLIQUE - Pas besoin d'authentification
router.get("/public", settingsController.getPublicSettings);

// Routes protégées - Réservées à l'admin
router.get("/", auth, admin, settingsController.getSettings);
router.put("/", auth, admin, settingsController.saveSettings);

module.exports = router;