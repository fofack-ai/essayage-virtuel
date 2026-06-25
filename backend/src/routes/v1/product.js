const express = require("express");

const router = express.Router();
const uploadMiddleware = require('../../middleware/upload');


const auth = require("../../middleware/auth");
const productController = require("../../controllers/v1/productController");

// Public routes (no authentication required)
router.get(
  "/",
  productController.getProducts
);

router.get(
  "/:id",
  productController.getProduct
);

router.get(
  "/featured",
  productController.getProducts // Will handle featured=true in query
);

// Protected routes (authentication required)
router.post(
  "/",
  auth,
  productController.createProduct
);

router.put(
  "/:id",
  auth,
  productController.updateProduct
);

router.delete(
  "/:id",
  auth,
  productController.deleteProduct
);

// Product Images
router.post(
  "/:id/images",
  auth,
  uploadMiddleware.uploadProductImage,
  productController.addProductImage
);

router.get(
  "/:id/images",
  productController.getProductImages
);

router.delete(
  "/images/:imageId",
  auth,
  productController.deleteProductImage
);

// Product Sizes
router.post(
  "/:id/sizes",
  auth,
  productController.addProductSize
);

router.get(
  "/:id/sizes",
  productController.getProductSizes
);

router.put(
  "/:id/sizes/:sizeId",
  auth,
  productController.updateProductSizeStock
);

module.exports = router;