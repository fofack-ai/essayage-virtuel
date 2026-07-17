const tryonService = require("../../services/v1/tryonService");
const aiTryonService = require('../../services/v1/aiTryonService');
const tryonModel     = require('../../models/v1/tryonModel');
const productModel   = require('../../models/v1/productModel');
const path           = require('path');
const fs             = require('fs');

/**
 * Vérifie que l'utilisateur connecté est propriétaire de l'essayage
 * (ou administrateur). Lève une erreur 403 sinon.
 */
async function assertOwnerOrAdmin(req, tryonId) {
  if (req.user && req.user.role === "admin") return;

  const tryon = await tryonService.getTryonById(tryonId); // lève "Essai non trouvé" si absent

  if (!req.user || tryon.userId !== req.user.id) {
    const err = new Error("Accès non autorisé à cet essayage");
    err.statusCode = 403;
    throw err;
  }
}

/**
 * Transfère les essayages d'un invité vers un compte utilisateur après connexion
 */
async function transferGuestTryons(req, res) {
  try {
    const guestId = req.cookies?.guestId;
    if (!guestId) {
      return res.status(400).json({ success: false, message: 'Aucun essai invité à transférer' });
    }
    await tryonService.transferGuestTryons(guestId, req.user.id);

    // Le navigateur n'efface un cookie que si les attributs correspondent à
    // ceux de la pose. En production le front est sur vercel.app et l'API sur
    // onrender.com : le cookie a été posé avec SameSite=None; Secure. Sans
    // les répéter ici, le Set-Cookie d'expiration est rejeté et le guestId
    // survit — il ressusciterait un vieux panier invité à la déconnexion.
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('guestId', {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });
    return res.status(200).json({ success: true, message: 'Essayages transférés avec succès' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Récupère les essayages d'un invité via son guestId (cookie)
 */
async function getGuestTryons(req, res) {
  try {
    const guestId = req.guestId;
    if (!guestId) {
      return res.status(400).json({ success: false, message: 'Aucun identifiant invité' });
    }
    const tryons = await tryonService.getTryons({ guestId });
    return res.status(200).json({
      success: true,
      count: tryons.length,
      data: tryons
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

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

    // Un client ne peut consulter que ses propres essayages.
    // Seul un admin peut consulter ceux d'un autre utilisateur.
    if (req.user.role !== "admin" && parseInt(userId) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé aux essayages d'un autre utilisateur"
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
    let tryonData = req.body;

    // Si l'utilisateur est connecté, on utilise son id, sinon guestId
    tryonData.userId = req.user?.id || null;
    tryonData.guestId = req.user?.id ? null : req.guestId;

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

    await assertOwnerOrAdmin(req, tryonId);

    const tryonData = req.body;

    const tryon = await tryonService.updateTryon(tryonId, tryonData);

    return res.status(200).json({
      success: true,
      message: "Essayage mis à jour avec succès",
      data: tryon
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
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

    await assertOwnerOrAdmin(req, tryonId);

    await tryonService.deleteTryon(tryonId);

    return res.status(200).json({
      success: true,
      message: "Essai supprimé avec succès"
    });
  } catch (error) {
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
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
// Cette route est conservée mais peut être retirée si vous utilisez uniquement /ai-generate
async function uploadTryonPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier photo uploadé"
      });
    }

    const { productId, score, recommendedSize, notes, isLatest } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID produit requis"
      });
    }

    // Construire les URLs
    const userPhotoUrl = `/uploads/tryons/${req.file.filename}`;
    const resultImageUrl = `/uploads/tryons/${req.file.filename}`; // À adapter si traitement

    // Créer l'objet tryon avec userId ou guestId
    const tryonData = {
      userId: req.user?.id || null,
      guestId: req.user?.id ? null : req.guestId,
      productId: parseInt(productId),
      userPhoto: userPhotoUrl,
      resultImage: resultImageUrl,
      score: score !== undefined && score !== "" ? parseInt(score) : null,
      recommendedSize: recommendedSize || null,
      notes: notes || null,
      isLatest: isLatest === 'true'
    };

    // Valider le score
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
    if (error.message === "Produit non trouvé") {
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

/**
 * POST /api/v1/tryons/ai-generate
 * Reçoit la photo utilisateur (multipart) + productId, renvoie l'image générée par l'IA.
 * Sauvegarde l'essai même pour les invités (guestId)
 */
async function aiGenerateTryon(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo utilisateur requise (champ: tryonPhoto)' });
    }

    const productId = req.body.productId ? parseInt(req.body.productId) : null;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId requis' });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Récupérer l'image du produit
    let imageField = product.image || product.image_url || product.imageUrl;
    if (!imageField) {
      const images = await productModel.getImages(productId);
      const mainImg = images.find(img => img.isMain === 1 || img.isMain === true) || images[0];
      imageField = mainImg?.imageUrl || null;
    }

    if (!imageField) {
      return res.status(400).json({
        success: false,
        message: `Aucune image trouvée pour "${product.name}". Ajoutez-en une via l'admin.`
      });
    }

    // ✅ CORRECTIF — l'image produit est une URL Cloudinary : on la transmet
    //    telle quelle. aiTryonService sait charger une URL comme un fichier
    //    local (utile en développement).
    const productImagePath = imageField;

    // req.file.path = URL Cloudinary fournie par multer-storage-cloudinary
    const userPhotoPath = req.file.path;

    console.log(`[aiGenerateTryon] userId=${req.user?.id || 'guest'} guestId=${req.guestId} productId=${productId}`);

const aiResult = await aiTryonService.generateVirtualTryon(
  userPhotoPath,
  productImagePath,
  { name: product.name, categoryName: product.categoryName }   // ← indispensable
);

    // --- SAUVEGARDE SYSTÉMATIQUE (même pour les invités) ---
    const tryonData = {
      userId: req.user?.id || null,
      guestId: req.user?.id ? null : req.guestId,
      productId,
      userPhoto: userPhotoPath,   // URL Cloudinary
      resultImage: aiResult.servedPath,
      score: req.body.score ? parseInt(req.body.score) : null,
      recommendedSize: req.body.recommendedSize || null,
      notes: `IA (${aiResult.strategy}) — ${new Date().toLocaleDateString('fr-FR')}`,
      isLatest: true,
    };

    let tryon = null;
    try {
      const tryonId = await tryonModel.create(tryonData);
      tryon = await tryonModel.findById(tryonId);
    } catch (dbErr) {
      console.warn('[aiGenerateTryon] Sauvegarde DB non bloquante :', dbErr.message);
    }
    // --- FIN SAUVEGARDE ---

    return res.status(200).json({
      success: true,
      message: 'Essayage IA généré avec succès',
      data: {
        resultImageUrl: aiResult.servedPath,
        strategy:       aiResult.strategy,
        generatedAt:    aiResult.generatedAt,
        personDesc:     aiResult.personDesc,
        garmentDesc:    aiResult.garmentDesc,
        tryon,          // peut être null si la sauvegarde a échoué
      }
    });

  } catch (error) {
    console.error('[aiGenerateTryon] Erreur :', error.message);
    if (error.message.includes('OPENAI_API_KEY') || error.message.includes('REPLICATE_API')) {
      return res.status(503).json({ success: false, message: 'Clé API manquante : ' + error.message });
    }
    if (error.message.includes('content_policy') || error.message.includes('safety')) {
      return res.status(422).json({ success: false, message: 'Photo refusée par OpenAI. Essayez avec une autre.' });
    }
    return res.status(500).json({ success: false, message: 'Erreur génération IA : ' + error.message });
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
  uploadTryonPhoto,
  aiGenerateTryon,
  transferGuestTryons,
  getGuestTryons,   // Nouvelle fonction exportée
};