const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const uploadMiddleware = require("../../middleware/upload");
const tryonController = require("../../controllers/v1/tryonController");

// ============================================================
// ROUTES ADMIN
// ============================================================
router.get("/", auth, admin, tryonController.getTryons);

// ✅ Route publique - pas besoin de auth ni admin
router.get("/stats", tryonController.getTryonStats);

// ============================================================
// ROUTES UTILISATEUR (authentification requise)
// ============================================================
router.get("/user/:userId", auth, tryonController.getUserTryons);
router.post("/", auth, tryonController.createTryon);
router.put("/:id", auth, tryonController.updateTryon);
router.delete("/:id", auth, tryonController.deleteTryon);

router.post(
  "/upload",
  auth,
  uploadMiddleware.uploadSingle("photo"),
  tryonController.uploadTryonPhoto
);

router.post(
  "/ai-generate",
  auth,
  uploadMiddleware.uploadSingle("tryonPhoto"),
  tryonController.aiGenerateTryon
);

module.exports = router;