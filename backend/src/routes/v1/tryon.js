const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const guest = require("../../middleware/guest");
const uploadMiddleware = require("../../middleware/upload");
const tryonController = require("../../controllers/v1/tryonController");

// ============================================================
// ROUTES PUBLIQUES (pas d'authentification)
// ============================================================

// Statistiques
router.get("/stats", tryonController.getTryonStats);

// Création d'un essayage (invité ou connecté)
router.post("/", guest, tryonController.createTryon);

// Génération IA
router.post(
  "/ai-generate",
  guest,
  uploadMiddleware.uploadTryonSingle("tryonPhoto"),  // avant: uploadSingle
  tryonController.aiGenerateTryon
);

// Récupération des essais d'un invité
router.get("/guest", guest, tryonController.getGuestTryons);

// Récupération d'un essayage par ID (public)
router.get("/:id", tryonController.getTryon);

// ============================================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================================

// Récupération des essais d'un utilisateur
router.get("/user/:userId", auth, tryonController.getUserTryons);

// Transfert des essais invités vers le compte
router.post("/transfer", auth, tryonController.transferGuestTryons);

// Upload photo manuel (si utilisé)
router.post(
  "/upload",
  auth,
  uploadMiddleware.uploadSingle("photo"),
  tryonController.uploadTryonPhoto
);

// Modification / suppression
router.put("/:id", auth, tryonController.updateTryon);
router.delete("/:id", auth, tryonController.deleteTryon);

// ============================================================
// ROUTES ADMIN (accès restreint)
// ============================================================
router.get("/", auth, admin, tryonController.getTryons);

module.exports = router;