const tryonModel = require("../../models/v1/tryonModel");
const userModel = require("../../models/v1/userModel");
const productModel = require("../../models/v1/productModel");

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
  // Validate userId
  const userExists = await userModel.findById(userId);
  if (!userExists) {
    throw new Error("Utilisateur non trouvé");
  }

  const tryons = await tryonModel.findByUserId(userId, limit);
  return tryons;
}

async function createTryon(tryonData) {
  // Validate required fields
  if (!tryonData.userId) {
    throw new Error("ID utilisateur requis");
  }

  if (!tryonData.productId) {
    throw new Error("ID produit requis");
  }

  // Validate user exists
  const user = await userModel.findById(tryonData.userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  // Validate product exists
  const product = await productModel.findById(tryonData.productId);
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  // Validate score if provided
  if (tryonData.score !== undefined && (tryonData.score < 0 || tryonData.score > 100)) {
    throw new Error("Le score doit être entre 0 et 100");
  }

  // If this is set as latest, the model will handle unsetting others
  const tryonId = await tryonModel.create(tryonData);
  return await tryonModel.findById(tryonId);
}

async function updateTryon(id, tryonData) {
  // Check if tryon exists
  const existingTryon = await tryonModel.findById(id);
  if (!existingTryon) {
    throw new Error("Essai non trouvé");
  }

  // Validate userId if being updated
  if (tryonData.userId !== undefined) {
    const user = await userModel.findById(tryonData.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
  }

  // Validate productId if being updated
  if (tryonData.productId !== undefined) {
    const product = await productModel.findById(tryonData.productId);
    if (!product) {
      throw new Error("Produit non trouvé");
    }
  }

  // Validate score if provided
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
  // Check if tryon exists
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
  const stats = await tryonModel.getStats();
  return stats;
}

// Handle photo upload for tryon
async function handleTryonPhotoUpload(userId, productId, photoData) {
  // Validate user and product
  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const product = await productModel.findById(productId);
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  // Validate photo data
  if (!photoData || !photoData.buffer) {
    throw new Error("Données de photo manquantes");
  }

  // In a real implementation, you would save the file to disk or cloud storage
  // and return the URL. For now, we'll simulate this.
  // The actual file handling would be done in middleware/upload.js

  // For this implementation, we expect the photoUrl to be provided
  // after file processing by middleware
  return {
    userPhoto: photoData.url || null,
    resultImage: photoData.resultUrl || null
  };
}

module.exports = {
  getTryons,
  getTryonById,
  getUserTryons,
  createTryon,
  updateTryon,
  deleteTryon,
  getTryonStats,
  handleTryonPhotoUpload
};