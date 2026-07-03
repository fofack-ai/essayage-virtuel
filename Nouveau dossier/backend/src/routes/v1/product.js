const express = require("express");

const router = express.Router();
const uploadMiddleware = require("../../middleware/upload");

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const productController = require("../../controllers/v1/productController");

// ============================================================
// ROUTES PUBLIQUES (lecture seule, pas d'authentification)
// ============================================================

// IMPORTANT : les routes fixes (/featured) doivent être déclarées
// AVANT la route dynamique /:id, sinon Express interprète
// "featured" comme un id de produit et /featured ne répond jamais.
router.get("/featured", productController.getProducts);

router.get("/", productController.getProducts);

router.get("/:id/images", productController.getProductImages);

router.get("/:id/sizes", productController.getProductSizes);

router.get("/:id", productController.getProduct);

// ============================================================
// ROUTES PROTÉGÉES — RÉSERVÉES À L'ADMINISTRATEUR
// La modification du catalogue (produits, images, tailles/stock)
// exige le rôle admin : auth vérifie le token, admin vérifie le rôle.
// ============================================================

router.post("/", auth, admin, productController.createProduct);

router.put("/:id", auth, admin, productController.updateProduct);

router.delete("/:id", auth, admin, productController.deleteProduct);

// Images produit
router.post(
  "/:id/images",
  auth,
  admin,
  uploadMiddleware.uploadProductImage,
  productController.addProductImage
);

router.delete(
  "/images/:imageId",
  auth,
  admin,
  productController.deleteProductImage
);

// Tailles / stock
router.post("/:id/sizes", auth, admin, productController.addProductSize);

router.put(
  "/:id/sizes/:sizeId",
  auth,
  admin,
  productController.updateProductSizeStock
);

module.exports = router;
