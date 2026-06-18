const categoryModel = require("../../models/v1/categoryModel");

async function getAllCategories() {
  const categories = await categoryModel.findAll();
  return categories;
}

async function getCategoryById(id) {
  const category = await categoryModel.findById(id);

  if (!category) {
    throw new Error("Catégorie non trouvée");
  }

  return category;
}

async function getCategoryBySlug(slug) {
  const category = await categoryModel.findBySlug(slug);

  if (!category) {
    throw new Error("Catégorie non trouvée");
  }

  return category;
}

async function createCategory(categoryData) {
  // Validate required fields
  if (!categoryData.name || !categoryData.slug) {
    throw new Error("Nom et slug de la catégorie sont obligatoires");
  }

  // Check if slug already exists
  const existingCategory = await categoryModel.findBySlug(categoryData.slug);
  if (existingCategory) {
    throw new Error("Ce slug est déjà utilisé");
  }

  const categoryId = await categoryModel.createCategory(categoryData);
  return await categoryModel.findById(categoryId);
}

async function updateCategory(id, categoryData) {
  // Check if category exists
  const existingCategory = await categoryModel.findById(id);
  if (!existingCategory) {
    throw new Error("Catégorie non trouvée");
  }

  // If slug is being updated, check if it's already taken
  if (categoryData.slug && categoryData.slug !== existingCategory.slug) {
    const existingCategoryWithSlug = await categoryModel.findBySlug(categoryData.slug);
    if (existingCategoryWithSlug) {
      throw new Error("Ce slug est déjà utilisé");
    }
  }

  const success = await categoryModel.updateCategory(id, categoryData);
  if (!success) {
    throw new Error("Échec de la mise à jour de la catégorie");
  }

  return await categoryModel.findById(id);
}

async function deleteCategory(id) {
  // Check if category exists
  const existingCategory = await categoryModel.findById(id);
  if (!existingCategory) {
    throw new Error("Catégorie non trouvée");
  }

  const success = await categoryModel.removeCategory(id);
  if (!success) {
    throw new Error("Échec de la suppression de la catégorie");
  }

  return { success: true, message: "Catégorie supprimée avec succès" };
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};