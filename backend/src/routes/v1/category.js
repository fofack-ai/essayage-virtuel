const express = require("express");

const router = express.Router();

const auth = require("../../middleware/auth");
const categoryController = require("../../controllers/v1/categoryController");

// Public routes (no authentication required)
router.get(
  "/",
  categoryController.getCategories
);

router.get(
  "/:id",
  categoryController.getCategory
);

router.get(
  "/slug/:slug",
  categoryController.getCategory
);

// Protected routes (authentication required)
router.post(
  "/",
  auth,
  categoryController.createCategory
);

router.put(
  "/:id",
  auth,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  auth,
  categoryController.deleteCategory
);

module.exports = router;