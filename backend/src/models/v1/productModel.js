const db = require("../../config/database");

async function findAll(filters = {}) {
  let query = `
    SELECT
    p.*,
    c.name as categoryName,
    c.slug as categorySlug,

    (
      SELECT imageUrl
      FROM product_images
      WHERE productId = p.id
      AND isMain = 1
      LIMIT 1
    ) AS image,

    (
      SELECT COALESCE(SUM(stock),0)
      FROM product_sizes
      WHERE productId = p.id
    ) AS totalStock
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.status = 'active'
  `;
  const params = [];

  if (filters.categoryId) {
    query += " AND p.categoryId = ?";
    params.push(filters.categoryId);
  }

  if (filters.target) {
    query += " AND p.target = ?";
    params.push(filters.target);
  }

  if (filters.search) {
    query += " AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)";
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY p.createdAt DESC";

  if (filters.limit !== undefined && filters.offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(filters.limit), parseInt(filters.offset));
  } else if (filters.limit !== undefined) {
    query += " LIMIT ?";
    params.push(parseInt(filters.limit));
  }

  const [rows] = await db.query(query, params);
  return rows;
}

async function findFeatured(limit = 8) {
  const [rows] = await db.query(
    `
    SELECT
      p.*,
      c.name as categoryName,
      c.slug as categorySlug
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.status = 'active'
    ORDER BY p.createdAt DESC
    LIMIT ?
    `,
    [limit]
  );
  return rows;
}

async function create(productData) {
  const [result] = await db.query(
    `
    INSERT INTO products
    (categoryId, name, brand, description, price, stock, color, target, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      productData.categoryId || null,
      productData.name,
      productData.brand || null,
      productData.description || null,
      productData.price,
      productData.stock || 0,
      productData.color || null,
      productData.target || 'unisexe',
      productData.status || 'active'
    ]
  );
  return result.insertId;
}

async function update(id, productData) {
  const [result] = await db.query(
    `
    UPDATE products
    SET
      categoryId = ?,
      name = ?,
      brand = ?,
      description = ?,
      price = ?,
      stock = ?,
      color = ?,
      target = ?,
      status = ?,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [
      productData.categoryId || null,
      productData.name,
      productData.brand || null,
      productData.description || null,
      productData.price,
      productData.stock || 0,
      productData.color || null,
      productData.target || 'unisexe',
      productData.status || 'active',
      id
    ]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await db.query(
    "UPDATE products SET status = 'inactive' WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

// Product Images
async function addImage(productId, imageUrl, isMain = false) {
  // If setting as main image, unset other main images for this product
  if (isMain) {
    await db.query(
      "UPDATE product_images SET isMain = FALSE WHERE productId = ?",
      [productId]
    );
  }

  const [result] = await db.query(
    `
    INSERT INTO product_images (productId, imageUrl, isMain)
    VALUES (?, ?, ?)
    `,
    [productId, imageUrl, isMain]
  );
  return result.insertId;
}

async function getImages(productId) {
  const [rows] = await db.query(
    "SELECT * FROM product_images WHERE productId = ? ORDER BY isMain DESC, createdAt ASC",
    [productId]
  );
  return rows;
}

async function deleteImage(imageId) {
  const [result] = await db.query(
    "DELETE FROM product_images WHERE id = ?",
    [imageId]
  );
  return result.affectedRows > 0;
}

// Product Sizes
async function addSize(productId, sizeId, stock = 0) {
  const [result] = await db.query(
    `
    INSERT INTO product_sizes (productId, sizeId, stock)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE stock = VALUES(stock)
    `,
    [productId, sizeId, stock]
  );
  return result.insertId;
}

async function getSizes(productId) {
  const [rows] = await db.query(
    `
    SELECT ps.*, s.label as sizeLabel
    FROM product_sizes ps
    JOIN sizes s ON ps.sizeId = s.id
    WHERE ps.productId = ?
    ORDER BY s.sortOrder
    `,
    [productId]
  );
  return rows;
}

async function updateSizeStock(productId, sizeId, stock) {
  const [result] = await db.query(
    `
    UPDATE product_sizes
    SET stock = ?
    WHERE productId = ? AND sizeId = ?
    `,
    [stock, productId, sizeId]
  );
  return result.affectedRows > 0;
}

async function findById(id) {
  const [rows] = await db.query(
    `
    SELECT
      p.*,
      c.name as categoryName,
      c.slug as categorySlug,
      (SELECT imageUrl FROM product_images WHERE productId = p.id AND isMain = 1 LIMIT 1) AS image
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.id = ? AND p.status = 'active'
    `,
    [id]
  );
  return rows[0];
}

async function decreaseSizeStock(productId, sizeLabel, quantity, connection = db) {
  await connection.query(
    `
    UPDATE product_sizes ps
    JOIN sizes s ON s.id = ps.sizeId
    SET ps.stock = ps.stock - ?
    WHERE ps.productId = ?
      AND s.label = ?
      AND ps.stock >= ?
    `,
    [
      quantity,
      productId,
      sizeLabel,
      quantity,
    ]
  );
}

module.exports = {
  findAll,
  findById,
  findFeatured,
  create,
  update,
  remove,
  addImage,
  getImages,
  deleteImage,
  addSize,
  getSizes,
  updateSizeStock,
  decreaseSizeStock,
};