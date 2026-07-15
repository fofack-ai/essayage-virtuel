const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const guest = require("../../middleware/guest");
const uploadMiddleware = require("../../middleware/upload");
const tryonController = require("../../controllers/v1/tryonController");

// ============================================================
// ROUTES PUBLIQUES (pas d'authentification requise)
// ============================================================

// Statistiques (publiques)
router.get("/stats", tryonController.getTryonStats);

// Création d'un essayage (invité ou connecté)
// Le middleware guest génère un guestId si l'utilisateur n'est pas connecté
// Le contrôleur utilisera req.user.id ou req.guestId
router.post("/", guest, tryonController.createTryon);

// Génération IA d'essayage (invité ou connecté)
router.post(
  "/ai-generate",
  guest,
  uploadMiddleware.uploadSingle("tryonPhoto"),
  tryonController.aiGenerateTryon
);

// Récupération des essais d'un invité (via le cookie guestId)
router.get("/guest", guest, tryonController.getGuestTryons);

// Récupération d'un essayage par son ID (public, car un invité peut vouloir voir le résultat)
router.get("/:id", tryonController.getTryon);

// ============================================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================================

// Récupération des essais d'un utilisateur (seulement ses propres essais ou admin)
router.get("/user/:userId", auth, tryonController.getUserTryons);

// Transfert des essais invités vers le compte connecté
router.post("/transfer", auth, tryonController.transferGuestTryons);

// Upload d'une photo pour essayage (version manuelle, si utilisée)
router.post(
  "/upload",
  auth,
  uploadMiddleware.uploadSingle("photo"),
  tryonController.uploadTryonPhoto
);

// Modification d'un essayage (seulement le propriétaire ou admin)
router.put("/:id", auth, tryonController.updateTryon);

// Suppression d'un essayage (seulement le propriétaire ou admin)
router.delete("/:id", auth, tryonController.deleteTryon);

// ============================================================
// ROUTES ADMIN (accès restreint aux administrateurs)
// ============================================================
// Récupération de tous les essayages (admin)
router.get("/", auth, admin, tryonController.getTryons);

module.exports = router;