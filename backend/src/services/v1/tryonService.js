const db = require("../../config/database"); // ✅ AJOUT
const tryonModel = require("../../models/v1/tryonModel");
const userModel = require("../../models/v1/userModel");
const productModel = require("../../models/v1/productModel");
const notificationService = require("./notificationService");

async function getTryons(filters = {}) {
  // Validate userId if provided
  if (filters.userId) {
    const userExists = await userModel.findById(filters.userId);
    if (!userExists) {
      throw new Error("Utilisateur non trouvé");
    }
  }

  // Validate productId if provided
  if (filters.productId) {
    const productExists = await productModel.findById(filters.productId);
    if (!productExists) {
      throw new Error("Produit non trouvé");
    }
  }

  const tryons = await tryonModel.findAll(filters);
  return tryons;
}

async function getTryonById(id) {
  const tryon = await tryonModel.findById(id);

  if (!tryon) {
    throw new Error("Essai non trouvé");
  }

  return tryon;
}

async function getUserTryons(userId, limit = 10) {
  const userExists = await userModel.findById(userId);
  if (!userExists) {
    throw new Error("Utilisateur non trouvé");
  }

  const tryons = await tryonModel.findByUserId(userId, limit);
  return tryons;
}

async function createTryon(tryonData) {
  // ✅ On accepte soit un userId, soit un guestId
  if (!tryonData.userId && !tryonData.guestId) {
    throw new Error("ID utilisateur ou identifiant invité requis");
  }

  if (!tryonData.productId) {
    throw new Error("ID produit requis");
  }

  // ✅ Validation du produit (toujours nécessaire)
  const product = await productModel.findById(tryonData.productId);
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  // ✅ Validation de l'utilisateur seulement si un userId est fourni
  if (tryonData.userId) {
    const user = await userModel.findById(tryonData.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
  }

  // Validation du score si fourni
  if (tryonData.score !== undefined && (tryonData.score < 0 || tryonData.score > 100)) {
    throw new Error("Le score doit être entre 0 et 100");
  }

  // Création de l'essai
  const tryonId = await tryonModel.create(tryonData);
  const newTryon = await tryonModel.findById(tryonId);

  // Notification seulement si utilisateur connecté
  if (tryonData.userId) {
    try {
      const scoreDisplay = tryonData.score !== undefined && tryonData.score !== null
        ? ` avec un score de ${tryonData.score}%`
        : "";

      await notificationService.createUserNotification({
        userId: tryonData.userId,
        type: "product",
        title: "Nouvel essayage virtuel",
        message: `Vous avez essayé "${product.name}"${scoreDisplay}.`,
        isRead: false,
      });
    } catch (err) {
      console.error("Erreur création notification essayage:", err.message);
    }
  }

  return newTryon;
}

async function updateTryon(id, tryonData) {
  const existingTryon = await tryonModel.findById(id);
  if (!existingTryon) {
    throw new Error("Essai non trouvé");
  }

  if (tryonData.userId !== undefined) {
    const user = await userModel.findById(tryonData.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
  }

  if (tryonData.productId !== undefined) {
    const product = await productModel.findById(tryonData.productId);
    if (!product) {
      throw new Error("Produit non trouvé");
    }
  }

  if (tryonData.score !== undefined && (tryonData.score < 0 || tryonData.score > 100)) {
    throw new Error("Le score doit être entre 0 et 100");
  }

  const success = await tryonModel.update(id, tryonData);
  if (!success) {
    throw new Error("Échec de la mise à jour de l'essai");
  }

  return await tryonModel.findById(id);
}

async function deleteTryon(id) {
  const existingTryon = await tryonModel.findById(id);
  if (!existingTryon) {
    throw new Error("Essai non trouvé");
  }

  const success = await tryonModel.remove(id);
  if (!success) {
    throw new Error("Échec de la suppression de l'essai");
  }

  return { success: true, message: "Essai supprimé avec succès" };
}

async function getTryonStats() {
  return await tryonModel.getStats();
}

// ✅ Fonction de transfert des essais invités
async function transferGuestTryons(guestId, userId) {
  const [rows] = await db.query(
    `UPDATE tryons SET userId = ?, guestId = NULL WHERE guestId = ?`,
    [userId, guestId]
  );
  return rows.affectedRows;
}

// (Optionnel) fonction utilitaire, conservée mais non utilisée directement
async function handleTryonPhotoUpload(userId, productId, photoData) {
  // ... (inchangé, si besoin)
}

module.exports = {
  getTryons,
  getTryonById,
  getUserTryons,
  createTryon,
  updateTryon,
  deleteTryon,
  getTryonStats,
  transferGuestTryons,   // ✅ EXPORTÉ
  handleTryonPhotoUpload,
};