const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const uploadMiddleware = require("../../middleware/upload");
const tryonController = require("../../controllers/v1/tryonController");

// Public routes (no authentication required for history)
router.get(
  "/",
  tryonController.getTryons
);

router.get(
  "/stats",
  tryonController.getTryonStats
);

// Protected routes (authentication required)
router.get(
  "/user/:userId",
  auth,
  tryonController.getUserTryons
);

router.post(
  "/",
  auth,
  tryonController.createTryon
);

router.put(
  "/:id",
  auth,
  tryonController.updateTryon
);

router.delete(
  "/:id",
  auth,
  tryonController.deleteTryon
);

// Photo upload route
router.post(
  "/upload",
  auth,
  uploadMiddleware.uploadSingle("photo"),
  tryonController.uploadTryonPhoto
);


// Route génération IA
// multipart/form-data : champ "tryonPhoto" (image) + body "productId"
router.post(
  '/ai-generate',
  auth,
  uploadMiddleware.uploadSingle('tryonPhoto'),
  tryonController.aiGenerateTryon
);

module.exports = router;