const productModel = require("../../models/v1/productModel");

async function getAllProducts(filters = {}) {
  // Add featured filter if requested
  if (filters.featured) {
    const featuredProducts = await productModel.findFeatured(filters.limit || 10);
    return featuredProducts;
  }

  // Default behavior - get all products with filters
  const products = await productModel.findAll(filters);
  return products;
}

async function getProductById(id) {
  const product = await productModel.findById(id);

  if (!product) {
    throw new Error("Produit non trouvé");
  }

  // Get additional data: images and sizes
  const [images, sizes] = await Promise.all([
    productModel.getImages(id),
    productModel.getSizes(id)
  ]);

  return {
    ...product,
    images,
    sizes
  };
}

async function createProduct(productData) {
  // Validate required fields
  if (!productData.name || !productData.price) {
    throw new Error("Nom et prix du produit sont obligatoires");
  }

  // Validate price is positive
  if (productData.price <= 0) {
    throw new Error("Le prix doit être positif");
  }

  // Validate stock
  if (productData.stock !== undefined && productData.stock < 0) {
    throw new Error("Le stock ne peut pas être négatif");
  }

  const productId = await productModel.create(productData);
  return await productModel.findById(productId);
}

async function updateProduct(id, productData) {
  // Check if product exists
  const existingProduct = await productModel.findById(id);
  if (!existingProduct) {
    throw new Error("Produit non trouvé");
  }

  // Validate price if provided
  if (productData.price !== undefined && productData.price <= 0) {
    throw new Error("Le prix doit être positif");
  }

  // Validate stock if provided
  if (productData.stock !== undefined && productData.stock < 0) {
    throw new Error("Le stock ne peut pas être négatif");
  }

  const success = await productModel.update(id, productData);
  if (!success) {
    throw new Error("Échec de la mise à jour du produit");
  }

  return await productModel.findById(id);
}

async function deleteProduct(id) {
  // Check if product exists
  const existingProduct = await productModel.findById(id);
  if (!existingProduct) {
    throw new Error("Produit non trouvé");
  }

  const success = await productModel.remove(id);
  if (!success) {
    throw new Error("Échec de la suppression du produit");
  }

  return { success: true, message: "Produit supprimé avec succès" };
}

// Product Images
async function addProductImage(productId, imageUrl, isMain = false) {
  // Check if product exists
  const product = await productModel.findById(productId);
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  const imageId = await productModel.addImage(productId, imageUrl, isMain);
  return { id: imageId, productId, imageUrl, isMain };
}

async function getProductImages(productId) {
  // Check if product exists
  const product = await productModel.findById(productId);
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  return await productModel.getImages(productId);
}

async function deleteProductImage(imageId) {
  const success = await productModel.deleteImage(imageId);
  if (!success) {
    throw new Error("Échec de la suppression de l'image");
  }

  return { success: true, message: "Image supprimée avec succès" };
}

// Product Sizes
async function addProductSize(productId, sizeId, stock = 0) {
  // Check if product exists
  const product = await productModel.findById(productId);
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  // Validate sizeId
  if (!sizeId) {
    throw new Error("ID de taille requis");
  }

  const sizeIdResult = await productModel.addSize(productId, sizeId, stock);
  return { id: sizeIdResult, productId, sizeId, stock };
}

async function getProductSizes(productId) {
  // Check if product exists
  const product = await productModel.findById(productId);
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  return await productModel.getSizes(productId);
}

async function updateProductSizeStock(productId, sizeId, stock) {
  // Check if product exists
  const product = await productModel.findById(productId);
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  // Validate stock
  if (stock < 0) {
    throw new Error("Le stock ne peut pas être négatif");
  }

  const success = await productModel.updateSizeStock(productId, sizeId, stock);
  if (!success) {
    throw new Error("Échec de la mise à jour du stock");
  }

  return { success: true, message: "Stock mis à jour avec succès" };
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  getProductImages,
  deleteProductImage,
  addProductSize,
  getProductSizes,
  updateProductSizeStock,
};