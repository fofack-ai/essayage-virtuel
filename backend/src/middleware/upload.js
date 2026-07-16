const { uploadProduct, uploadUser, uploadTryon } = require('../config/cloudinary');

// Fabrique un middleware d'upload à partir d'un storage + d'un nom de champ
const makeSingle = (storage) => (fieldName) => {
  return (req, res, next) => {
    storage.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

// Middleware pour image produit (champ "image")
const uploadProductImage = (req, res, next) => {
  uploadProduct.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Middleware pour avatar utilisateur
const uploadUserAvatar = (req, res, next) => {
  uploadUser.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Middleware pour essayage (champ "image")
const uploadTryonImage = (req, res, next) => {
  uploadTryon.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ✅ CORRECTIF BUG 1 — essayage avec nom de champ libre ("photo", "tryonPhoto"…)
//    Range les photos des clients dans tryon/tryons, et non tryon/products.
const uploadTryonSingle = makeSingle(uploadTryon);

// ⚠️ storage PRODUIT — à réserver aux images du catalogue.
const uploadSingle = makeSingle(uploadProduct);

const uploadMultiple = (fieldName, maxCount) => {
  return (req, res, next) => {
    uploadProduct.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

module.exports = {
  uploadProductImage,
  uploadUserAvatar,
  uploadTryonImage,
  uploadTryonSingle,
  uploadSingle,
  uploadMultiple,
};