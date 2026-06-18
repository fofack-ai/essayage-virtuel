const categoryService = require("../../services/v1/categoryService");

async function getCategories(req, res) {
  try {
    const categories = await categoryService.getAllCategories();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function getCategory(req, res) {
  try {
    let category;

    // Try to get by ID first
    if (req.params.id) {
      category = await categoryService.getCategoryById(req.params.id);
    }
    // Then try to get by slug
    else if (req.params.slug) {
      category = await categoryService.getCategoryBySlug(req.params.slug);
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Catégorie non trouvée"
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.message === "Catégorie non trouvée") {
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

async function createCategory(req, res) {
  try {
    const category = await categoryService.createCategory(req.body);

    return res.status(201).json({
      success: true,
      message: "Catégorie créée avec succès",
      data: category
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function updateCategory(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de la catégorie requis"
      });
    }

    const category = await categoryService.updateCategory(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Catégorie mise à jour avec succès",
      data: category
    });
  } catch (error) {
    if (error.message === "Catégorie non trouvée") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === "Ce slug est déjà utilisé") {
      return res.status(409).json({
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

async function deleteCategory(req, res) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de la catégorie requis"
      });
    }

    await categoryService.deleteCategory(id);

    return res.status(200).json({
      success: true,
      message: "Catégorie supprimée avec succès"
    });
  } catch (error) {
    if (error.message === "Catégorie non trouvée") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error.message === "Impossible de supprimer une catégorie contenant des produits") {
      return res.status(409).json({
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

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};