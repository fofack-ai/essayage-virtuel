const productService = require("../../services/v1/productService");

async function getProducts(req, res) {
  try {
    const filters = {
      categoryId: req.query.categoryId,
      target: req.query.target,
      search: req.query.search,
      featured: req.query.featured === 'true',
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const products = await productService.getAllProducts(filters);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function getProduct(req, res) {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID du produit requis"
      });
    }

    const product = await productService.getProductById(productId);

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.message === "Produit non trouvé") {
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

async function createProduct(req, res) {
  try {
    // Handle file upload if present
    let productData = req.body;

    // If there's an uploaded image, add it to product data
    // Note: Actual file upload handling would be in middleware
    // For now, we expect imageUrl in the body if provided

    const product = await productService.createProduct(productData);

    return res.status(201).json({
      success: true,
      message: "Produit créé avec succès",
      data: product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function updateProduct(req, res) {
  try {
    const productId = req.params.id;
    const productData = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID du produit requis"
      });
    }

    const product = await productService.updateProduct(productId, productData);

    return res.status(200).json({
      success: true,
      message: "Produit mis à jour avec succès",
      data: product
    });
  } catch (error) {
    if (error.message === "Produit non trouvé") {
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

async function deleteProduct(req, res) {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID du produit requis"
      });
    }

    await productService.deleteProduct(productId);

    return res.status(200).json({
      success: true,
      message: "Produit supprimé avec succès"
    });
  } catch (error) {
    if (error.message === "Produit non trouvé") {
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

// Product Images
async function addProductImage(req, res) {
  try {
    const productId = req.params.id; // Note: route uses :id, not :productId

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID du produit requis"
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier image uploadé"
      });
    }

    // Construct image URL
    const imageUrl = req.file.path; // Cloudinary retourne l'URL directement dans req.file.path
    const isMain = req.body.isMain === 'true';

    const image = await productService.addProductImage(
      productId,
      imageUrl,
      isMain
    );

    return res.status(201).json({
      success: true,
      message: "Image ajoutée avec succès",
      data: image
    });
  } catch (error) {
    if (error.message === "Produit non trouvé") {
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

async function getProductImages(req, res) {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID du produit requis"
      });
    }

    const images = await productService.getProductImages(productId);

    return res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    if (error.message === "Produit non trouvé") {
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

async function deleteProductImage(req, res) {
  try {
    const imageId = req.params.imageId;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "ID de l'image requis"
      });
    }

    await productService.deleteProductImage(imageId);

    return res.status(200).json({
      success: true,
      message: "Image supprimée avec succès"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Product Sizes
async function addProductSize(req, res) {
  try {
    const productId = req.params.id;
    const { sizeId, stock } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID du produit requis"
      });
    }

    if (!sizeId) {
      return res.status(400).json({
        success: false,
        message: "ID de taille requis"
      });
    }

    const size = await productService.addProductSize(
      productId,
      sizeId,
      stock || 0
    );

    return res.status(201).json({
      success: true,
      message: "Taille ajoutée au produit avec succès",
      data: size
    });
  } catch (error) {
    if (error.message === "Produit non trouvé") {
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

async function getProductSizes(req, res) {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID du produit requis"
      });
    }

    const sizes = await productService.getProductSizes(productId);

    return res.status(200).json({
      success: true,
      count: sizes.length,
      data: sizes
    });
  } catch (error) {
    if (error.message === "Produit non trouvé") {
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

async function updateProductSizeStock(req, res) {
  try {
    const productId = req.params.id;
    const sizeId = req.params.sizeId;
    const { stock } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ID du produit requis"
      });
    }

    if (!sizeId) {
      return res.status(400).json({
        success: false,
        message: "ID de taille requis"
      });
    }

    if (stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Stock requis"
      });
    }

    const result = await productService.updateProductSizeStock(
      productId,
      sizeId,
      stock
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    if (error.message === "Produit non trouvé") {
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

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  getProductImages,
  deleteProductImage,
  addProductSize,
  getProductSizes,
  updateProductSizeStock
};