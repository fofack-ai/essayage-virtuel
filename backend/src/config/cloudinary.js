const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage pour les images produits
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tryon/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 1000, crop: 'limit', quality: 'auto' }],
  },
});

// Storage pour les images utilisateurs
const userStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tryon/users',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

// Storage pour les essayages
const tryonStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tryon/tryons',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const uploadProduct = multer({ storage: productStorage });
const uploadUser = multer({ storage: userStorage });
const uploadTryon = multer({ storage: tryonStorage });

module.exports = {
  cloudinary,
  uploadProduct,
  uploadUser,
  uploadTryon,
};