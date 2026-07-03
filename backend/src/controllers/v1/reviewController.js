const reviewService = require("../../services/v1/reviewService");

async function getReviews(req, res) {
  try {
    const reviews = await reviewService.getReviews(req.query);

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createReview(req, res) {
  try {
    const id = await reviewService.createReview(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "Avis créé",
      data: { id },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateReview(req, res) {
  try {
    await reviewService.updateReview(req.params.id, req.body, req.user);

    res.json({
      success: true,
      message: "Avis mis à jour",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateReviewStatus(req, res) {
  try {
    await reviewService.updateReviewStatus(req.params.id, req.body, req.user);

    res.json({
      success: true,
      message: "Statut de l'avis mis à jour",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteReview(req, res) {
  try {
    await reviewService.deleteReview(req.params.id, req.user);

    res.json({
      success: true,
      message: "Avis supprimé",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getReviews,
  createReview,
  updateReview,
  updateReviewStatus,
  deleteReview,
};