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

    if (chestCm === undefined && waistCm === undefined && hipCm === undefined) {
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
 * le résultat dans son carnet de mesures (confidence "estimee").
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
    if (saveToProfile) {
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

module.exports = { saveMeasurements, getLatestMeasurements, recommendSize, estimateSize };