const promotionService = require("../../services/v1/promotionService");

async function getPromotions(req, res) {
  try {
    const promotions = await promotionService.getPromotions(req.query);

    res.json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createPromotion(req, res) {
  try {
    const id = await promotionService.createPromotion(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "Promotion créée",
      data: { id },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function updatePromotion(req, res) {
  try {
    await promotionService.updatePromotion(req.params.id, req.body, req.user);

    res.json({
      success: true,
      message: "Promotion mise à jour",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function deletePromotion(req, res) {
  try {
    await promotionService.deletePromotion(req.params.id, req.user);

    res.json({
      success: true,
      message: "Promotion supprimée",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function togglePromotion(req, res) {
  try {
    await promotionService.togglePromotion(req.params.id, req.body, req.user);

    res.json({
      success: true,
      message: "Statut de la promotion mis à jour",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
};