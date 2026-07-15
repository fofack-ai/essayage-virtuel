const { uploadProduct, uploadUser, uploadTryon } = require('../config/cloudinary');

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

// Middleware pour essayage
const uploadTryonImage = (req, res, next) => {
  uploadTryon.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Compatibilité avec les anciennes routes
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    uploadProduct.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  };
};

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
  uploadSingle,
  uploadMultiple,
};