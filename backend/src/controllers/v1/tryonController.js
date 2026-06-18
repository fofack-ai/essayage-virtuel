const tryonService = require("../../services/v1/tryonService");

async function getTryons(req, res) {
  try {
    const filters = {
      userId: req.query.userId,
      productId: req.query.productId,
      isLatest: req.query.isLatest === 'true' ? true : req.query.isLatest === 'false' ? false : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const tryons = await tryonService.getTryons(filters);

    return res.status(200).json({
      success: true,
      count: tryons.length,
      data: tryons
    });
  } catch (error) {
    if (error.message === "Utilisateur non trouvé" || error.message === "Produit non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function getTryon(req, res) {
  try {
    const tryonId = req.params.id;

    if (!tryonId) {
      return res.status(400).json({
        success: false,
        message: "ID de l'essai requis"
      });
    }

    const tryon = await tryonService.getTryonById(tryonId);

    return res.status(200).json({
      success: true,
      data: tryon
    });
  } catch (error) {
    if (error.message === "Essai non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function getUserTryons(req, res) {
  try {
    const userId = req.params.userId;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur requis"
      });
    }

    const tryons = await tryonService.getUserTryons(userId, limit);

    return res.status(200).json({
      success: true,
      count: tryons.length,
      data: tryons
    });
  } catch (error) {
    if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function createTryon(req, res) {
  try {
    // Handle file upload data from middleware
    // In a real app, this would come from multer middleware
    let tryonData = req.body;

    // If files were uploaded, they would be in req.files
    // For now, we expect URLs to be in the body after processing

    const tryon = await tryonService.createTryon(tryonData);

    return res.status(201).json({
      success: true,
      message: "Essayage enregistré avec succès",
      data: tryon
    });
  } catch (error) {
    if (error.message === "Utilisateur non trouvé" || error.message === "Produit non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === "Le score doit être entre 0 et 100") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function updateTryon(req, res) {
  try {
    const tryonId = req.params.id;
    if (!tryonId) {
      return res.status(400).json({
        success: false,
        message: "ID de l'essai requis"
      });
    }

    const tryonData = req.body;

    const tryon = await tryonService.updateTryon(tryonId, tryonData);

    return res.status(200).json({
      success: true,
      message: "Essayage mis à jour avec succès",
      data: tryon
    });
  } catch (error) {
    if (error.message === "Essai non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === "Utilisateur non trouvé" || error.message === "Produit non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === "Le score doit être entre 0 et 100") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function deleteTryon(req, res) {
  try {
    const tryonId = req.params.id;

    if (!tryonId) {
      return res.status(400).json({
        success: false,
        message: "ID de l'essai requis"
      });
    }

    await tryonService.deleteTryon(tryonId);

    return res.status(200).json({
      success: true,
      message: "Essai supprimé avec succès"
    });
  } catch (error) {
    if (error.message === "Essai non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function getTryonStats(req, res) {
  try {
    const stats = await tryonService.getTryonStats();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques"
    });
  }
}

// Photo upload handler (used with multer middleware)
async function uploadTryonPhoto(req, res) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier photo uploadé"
      });
    }

    const { userId, productId, score, recommendedSize, notes, isLatest } = req.body;

    // Validate required fields
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur et ID produit requis"
      });
    }

    // Construct photo URLs
    const userPhotoUrl = `/uploads/tryons/${req.file.filename}`;
    // For result image, we could process it differently or use the same for now
    const resultImageUrl = `/uploads/tryons/${req.file.filename}`; // In real app, this might be processed

    // Create tryon record with photo URLs
    const tryonData = {
      userId: parseInt(userId),
      productId: parseInt(productId),
      userPhoto: userPhotoUrl,
      resultImage: resultImageUrl,
      score: score !== undefined && score !== "" ? parseInt(score) : null,
      recommendedSize: recommendedSize || null,
      notes: notes || null,
      isLatest: isLatest === 'true'
    };

    // Validate score range
    if (tryonData.score !== null && (tryonData.score < 0 || tryonData.score > 100)) {
      return res.status(400).json({
        success: false,
        message: "Le score doit être entre 0 et 100"
      });
    }

    const tryon = await tryonService.createTryon(tryonData);

    return res.status(201).json({
      success: true,
      message: "Photo d'essayage uploadée et essai enregistré avec succès",
      data: tryon
    });
  } catch (error) {
    if (error.message === "Utilisateur non trouvé" || error.message === "Produit non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === "Le score doit être entre 0 et 100") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload de la photo: " + error.message
    });
  }
}

module.exports = {
  getTryons,
  getTryon,
  getUserTryons,
  createTryon,
  updateTryon,
  deleteTryon,
  getTryonStats,
  uploadTryonPhoto
};