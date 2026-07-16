const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const guest = require("../../middleware/guest");
const measurementController = require("../../controllers/v1/measurementController");

// ============================================================
// ROUTES PUBLIQUES — accessibles sans compte
// Objectif (demande de l'encadreur) : mettre l'essayage virtuel et la
// recommandation de taille en avant, sans obliger le client à s'inscrire.
// ============================================================

// Estimation de la taille à partir de taille + poids + morphologie
router.post("/estimate", guest, measurementController.estimateSize);

// Recommandation à partir de mensurations fournies dans le corps de requête
router.post("/recommend", guest, measurementController.recommendSize);

// Verdict d'ajustement pour TOUTES les tailles (XS -> XXL)
router.post("/fit", guest, measurementController.evaluateFit);

// ============================================================
// ROUTES PROTÉGÉES — nécessitent un compte (persistance du profil)
// ============================================================

// Enregistrement des mensurations dans le profil
router.post("/", auth, measurementController.saveMeasurements);

// Dernières mensurations enregistrées
router.get("/latest", auth, measurementController.getLatestMeasurements);

module.exports = router;