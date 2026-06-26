const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Dossier racine des uploads.
 * Résultat attendu :
 * backend/uploads/products
 * backend/uploads/tryons
 * backend/uploads/users
 * backend/uploads/misc
 */
const UPLOAD_ROOT = path.join(__dirname, "../../uploads");

/**
 * Crée un dossier s'il n'existe pas encore.
 */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Détermine le dossier d'upload selon le type demandé.
 */
function getUploadPath(type = "misc") {
  const allowedTypes = ["products", "tryons", "users", "misc"];
  const safeType = allowedTypes.includes(type) ? type : "misc";

  const uploadPath = path.join(UPLOAD_ROOT, safeType);
  ensureDir(uploadPath);

  return uploadPath;
}

/**
 * Storage générique.
 * Par défaut, si aucun type n'est forcé, il déduit le dossier depuis le nom du champ.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let type = "misc";

    if (file.fieldname && file.fieldname.includes("tryon")) {
      type = "tryons";
    } else if (
      file.fieldname &&
      (file.fieldname.includes("product") || file.fieldname === "image")
    ) {
      // Important :
      // Dans la route produit, le champ envoyé est "image".
      // Donc on le force vers uploads/products.
      type = "products";
    } else if (file.fieldname && file.fieldname.includes("user")) {
      type = "users";
    }

    cb(null, getUploadPath(type));
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();

    cb(null, `${file.fieldname}-${baseName}-${uniqueSuffix}${ext}`);
  },
});

/**
 * Storage dédié aux images produits.
 * Il force toujours le dossier uploads/products.
 */
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getUploadPath("products"));
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();

    cb(null, `product-${baseName}-${uniqueSuffix}${ext}`);
  },
});

/**
 * Filtre : accepte uniquement les images.
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers images sont autorisés"), false);
  }
};

/**
 * Upload générique.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

/**
 * Upload dédié aux produits.
 */
const productUpload = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

/**
 * Gestion commune des erreurs Multer.
 */
function handleUploadError(err, res) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "La taille du fichier dépasse la limite autorisée (5MB)",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return null;
}

/**
 * Middleware générique pour un seul fichier.
 * Exemple :
 * uploadSingle("photo")
 * uploadSingle("tryonPhoto")
 */
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      const response = handleUploadError(err, res);
      if (response) return;

      next();
    });
  };
};

/**
 * Middleware dédié aux images produits.
 * Il attend un champ multipart nommé "image".
 * Il stocke toujours dans :
 * backend/uploads/products
 */
const uploadProductImage = (req, res, next) => {
  productUpload.single("image")(req, res, (err) => {
    const response = handleUploadError(err, res);
    if (response) return;

    next();
  });
};

/**
 * Middleware générique pour plusieurs fichiers.
 */
const uploadMultiple = (fieldName, maxCount) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      const response = handleUploadError(err, res);
      if (response) return;

      next();
    });
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadProductImage,
};