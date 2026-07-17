const measurementService = require("../../services/v1/measurementService");
const productModel = require("../../models/v1/productModel");

/** POST /api/v1/measurements — enregistre une mensuration (photo_guided ou manual) */
async function saveMeasurements(req, res) {
  try {
    const userId = req.user.id;
    const measurement = await measurementService.saveMeasurements(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Mensurations enregistrées avec succès",
      data: measurement,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
}

/** GET /api/v1/measurements/latest — dernière mensuration de l'utilisateur connecté */
async function getLatestMeasurements(req, res) {
  try {
    const measurement = await measurementService.getLatest(req.user.id);
    return res.status(200).json({ success: true, data: measurement });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/v1/measurements/recommend
 * Body: { productId, chestCm?, waistCm?, hipCm?, isStretchFabric? }
 * Si les mesures ne sont pas fournies, utilise la dernière mensuration enregistrée.
 */
async function recommendSize(req, res) {
  try {
    let { productId, chestCm, waistCm, hipCm, isStretchFabric } = req.body;

    // Aucune mesure fournie : on retombe sur le profil enregistré, mais
    // uniquement si le client est connecté (les invités n'en ont pas).
    if (chestCm === undefined && waistCm === undefined && hipCm === undefined) {
      if (!req.user) {
        return res.status(400).json({
          success: false,
          message: "Renseignez vos mensurations ou votre taille et votre poids.",
        });
      }
      const latest = await measurementService.getLatest(req.user.id);
      chestCm = latest.chestCm;
      waistCm = latest.waistCm;
      hipCm = latest.hipCm;
      isStretchFabric = latest.isStretchFabric;
    }

    let categoryName = "";
    if (productId) {
      const product = await productModel.findById(productId);
      categoryName = product?.categoryName || "";
    }

    const result = measurementService.recommendSize({
      chestCm,
      waistCm,
      hipCm,
      categoryName,
      isStretchFabric,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/v1/measurements/estimate
 * Body: { heightCm, weightKg, morphology, productId?, saveToProfile? }
 *
 * Mode "Express" : le client donne taille + poids + morphologie, on estime
 * ses tours, on en déduit la taille recommandée, et on peut enregistrer
 * le résultat dans son carnet de mesures.
 */
async function estimateSize(req, res) {
  try {
    const { heightCm, weightKg, morphology, productId, saveToProfile } = req.body;

    // 1. Estimer les tours à partir de taille + poids + morphologie
    const estimated = measurementService.estimateFromHeightWeight({
      heightCm,
      weightKg,
      morphology,
    });

    // 2. Récupérer la catégorie du produit (pour l'aisance) si fournie
    let categoryName = "";
    if (productId) {
      const product = await productModel.findById(productId);
      categoryName = product?.categoryName || "";
    }

    // 3. En déduire la taille recommandée via le moteur existant
    const recommendation = measurementService.recommendSize({
      chestCm: estimated.chestCm,
      waistCm: estimated.waistCm,
      hipCm: estimated.hipCm,
      categoryName,
      isStretchFabric: false,
    });

    // 4. Optionnel : mémoriser dans le carnet de mesures du client
    if (saveToProfile && req.user) {
      await measurementService.saveMeasurements(req.user.id, {
        method: "manual",
        heightCm: heightCm,
        chestCm: estimated.chestCm,
        waistCm: estimated.waistCm,
        hipCm: estimated.hipCm,
        isStretchFabric: false,
        notes: `Estimation express (${morphology}, ${weightKg} kg)`,
      });
    }

    return res.status(200).json({
      success: true,
      data: { ...estimated, ...recommendation },
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/v1/measurements/fit
 * Renvoie le verdict d'ajustement pour TOUTES les tailles.
 * Accepte soit des mensurations directes, soit taille + poids + morphologie.
 * Accessible sans compte.
 */
async function evaluateFit(req, res) {
  try {
    let {
      chestCm,
      waistCm,
      hipCm,
      heightCm,
      weightKg,
      morphology,
      productId,
      isStretchFabric,
      // Ratios morphologiques sans unité, mesurés par MediaPipe sur la photo.
      // Facultatifs : leur absence fait retomber sur l'estimation IMC seule.
      shoulderRatio,
      hipRatio,
      photoQuality,
    } = req.body;

    let estimated = null;

    // Si le client n'a donné que sa taille et son poids, on estime ses tours.
    // La photo, si elle a été analysée, affine la carrure ; sinon l'IMC suffit.
    if (chestCm === undefined && waistCm === undefined && hipCm === undefined) {
      estimated = measurementService.estimateFromPhotoAndBody({
        heightCm,
        weightKg,
        morphology,
        shoulderRatio,
        hipRatio,
        photoQuality,
      });
      chestCm = estimated.chestCm;
      waistCm = estimated.waistCm;
      hipCm = estimated.hipCm;
    }

    // Catégorie du produit : sert à appliquer la bonne aisance
    let categoryName = "";
    if (productId) {
      const product = await productModel.findById(productId);
      categoryName = product?.categoryName || product?.category || "";
    }

    const sizes = measurementService.evaluateAllSizes({
      chestCm,
      waistCm,
      hipCm,
      categoryName,
      isStretchFabric,
    });

    const recommendation = measurementService.recommendSize({
      chestCm,
      waistCm,
      hipCm,
      categoryName,
      isStretchFabric,
    });

    return res.status(200).json({
      success: true,
      data: {
        measurements: { chestCm, waistCm, hipCm },
        estimated,
        recommendedSize: recommendation.recommendedSize,
        // Sans photo, on plafonne la confiance affichée : annoncer 100 % sur
        // une estimation purement statistique serait mentir au client.
        confidence:
          estimated && !estimated.photoUsed
            ? Math.min(recommendation.score, 80)
            : recommendation.score,
        photoUsed: estimated ? Boolean(estimated.photoUsed) : false,
        photoNote: estimated ? estimated.photoNote || null : null,
        sizes,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
}

module.exports = {
  saveMeasurements,
  getLatestMeasurements,
  recommendSize,
  estimateSize,
  evaluateFit,
};