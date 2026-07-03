const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const uploadMiddleware = require("../../middleware/upload");
const tryonController = require("../../controllers/v1/tryonController");

// ============================================================
// ROUTES ADMIN
// La liste globale des essayages et les statistiques exposent
// les photos personnelles des clients : elles ne doivent JAMAIS
// être publiques. Seul l'admin (dashboard) y a accès.
// ============================================================

router.get("/", auth, admin, tryonController.getTryons);

router.get("/stats", auth, admin, tryonController.getTryonStats);

// ============================================================
// ROUTES UTILISATEUR (authentification requise)
// Le controller vérifie que l'utilisateur n'accède / ne modifie
// que SES propres essayages (sauf s'il est admin).
// ============================================================

router.get("/user/:userId", auth, tryonController.getUserTryons);

router.post("/", auth, tryonController.createTryon);

router.put("/:id", auth, tryonController.updateTryon);

router.delete("/:id", auth, tryonController.deleteTryon);

// Upload de photo d'essayage
router.post(
  "/upload",
  auth,
  uploadMiddleware.uploadSingle("photo"),
  tryonController.uploadTryonPhoto
);

// Génération IA
// multipart/form-data : champ "tryonPhoto" (image) + body "productId"
router.post(
  "/ai-generate",
  auth,
  uploadMiddleware.uploadSingle("tryonPhoto"),
  tryonController.aiGenerateTryon
);

module.exports = router;
