const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const measurementController = require("../../controllers/v1/measurementController");

// Toutes les routes de mesures exigent d'être connecté :
// un carnet de mesures est personnel à chaque client.

// Enregistrer une mensuration (saisie manuelle ou guidée par photo)
router.post("/", auth, measurementController.saveMeasurements);

// Dernière mensuration enregistrée du client connecté
router.get("/latest", auth, measurementController.getLatestMeasurements);

// Recommander une taille à partir de mesures réelles (ou de la dernière enregistrée)
router.post("/recommend", auth, measurementController.recommendSize);

// Mode Express : estimer la taille à partir de taille + poids + morphologie
router.post("/estimate", auth, measurementController.estimateSize);

module.exports = router;