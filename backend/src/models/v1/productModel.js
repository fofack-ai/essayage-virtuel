const db = require("../../config/database");

// ── findAll avec catégories multiples ──
async function findAll(filters = {}) {
  let query = `
    SELECT
      p.*,
      (
        SELECT imageUrl
        FROM product_images
        WHERE productId = p.id AND isMain = 1
        LIMIT 1
      ) AS image,
      (
        SELECT COALESCE(SUM(stock), 0)
        FROM product_sizes
        WHERE productId = p.id
      ) AS totalStock,
      GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categoryNames,
      GROUP_CONCAT(DISTINCT c.slug ORDER BY c.slug SEPARATOR ',') AS categorySlugs,
      GROUP_CONCAT(DISTINCT c.id ORDER BY c.id SEPARATOR ',') AS categoryIds
    FROM products p
    LEFT JOIN product_categories pc ON pc.productId = p.id
    LEFT JOIN categories c ON c.id = pc.categoryId
    WHERE p.status = 'active'
  `;
  const params = [];

  if (filters.categoryId) {
    query += ` AND p.id IN (
      SELECT productId FROM product_categories WHERE categoryId = ?
    )`;
    params.push(filters.categoryId);
  }

  if (filters.categorySlug) {
    query += ` AND p.id IN (
      SELECT pc2.productId FROM product_categories pc2
      JOIN categories c2 ON c2.id = pc2.categoryId
      WHERE c2.slug = ?
    )`;
    params.push(filters.categorySlug);
  }

  if (filters.target) {
    query += " AND p.target = ?";
    params.push(filters.target);
  }

  if (filters.search) {
    query += " AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)";
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }

  // ── Ordre entrelacé (Homme/Femme/Unisexe) via displayOrder ──
  // Voir la migration SQL : ALTER TABLE products ADD COLUMN displayOrder ...
  query += " GROUP BY p.id ORDER BY p.displayOrder ASC";

  if (filters.limit !== undefined && filters.offset !== undefined) {
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(filters.limit), parseInt(filters.offset));
  } else if (filters.limit !== undefined) {
    query += " LIMIT ?";
    params.push(parseInt(filters.limit));
  }

  const [rows] = await db.query(query, params);

  // Parser les slugs en tableau
  return rows.map((r) => ({
    ...r,
    categorySlugs: r.categorySlugs ? r.categorySlugs.split(",") : [],
    categoryIds: r.categoryIds ? r.categoryIds.split(",").map(Number) : [],
  }));
}

// ── findFeatured avec catégories multiples ──
async function findFeatured(limit = 8) {
  const [rows] = await db.query(
    `
    SELECT
      p.*,
      (
        SELECT imageUrl FROM product_images
        WHERE productId = p.id AND isMain = 1 LIMIT 1
      ) AS image,
      GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categoryNames,
      GROUP_CONCAT(DISTINCT c.slug ORDER BY c.slug SEPARATOR ',') AS categorySlugs
    FROM products p
    LEFT JOIN product_categories pc ON pc.productId = p.id
    LEFT JOIN categories c ON c.id = pc.categoryId
    WHERE p.status = 'active'
    GROUP BY p.id
    ORDER BY p.displayOrder ASC
    LIMIT ?
    `,
    [limit]
  );

  return rows.map((r) => ({
    ...r,
    categorySlugs: r.categorySlugs ? r.categorySlugs.split(",") : [],
  }));
}

// ── findById avec catégories multiples ──
async function findById(id) {
  const [rows] = await db.query(
    `
    SELECT
      p.*,
      (SELECT imageUrl FROM product_images WHERE productId = p.id AND isMain = 1 LIMIT 1) AS image,
      GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categoryNames,
      GROUP_CONCAT(DISTINCT c.slug ORDER BY c.slug SEPARATOR ',') AS categorySlugs,
      GROUP_CONCAT(DISTINCT c.id ORDER BY c.id SEPARATOR ',') AS categoryIds
    FROM products p
    LEFT JOIN product_categories pc ON pc.productId = p.id
    LEFT JOIN categories c ON c.id = pc.categoryId
    WHERE p.id = ?
    GROUP BY p.id
    `,
    [id]
  );

  if (!rows[0]) return null;

  return {
    ...rows[0],
    categorySlugs: rows[0].categorySlugs ? rows[0].categorySlugs.split(",") : [],
    categoryIds: rows[0].categoryIds ? rows[0].categoryIds.split(",").map(Number) : [],
  };
}

// ── create ──
async function create(productData) {
  const [result] = await db.query(
    `INSERT INTO products
    (categoryId, name, brand, description, price, stock, color, target, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      productData.categoryId || null,
      productData.name,
      productData.brand || null,
      productData.description || null,
      productData.price,
      productData.stock || 0,
      productData.color || null,
      productData.target || "unisexe",
      productData.status || "active",
    ]
  );

  const productId = result.insertId;

  // Insérer dans product_categories si categoryIds fournis
  if (productData.categoryIds && productData.categoryIds.length > 0) {
    await setCategories(productId, productData.categoryIds);
  } else if (productData.categoryId) {
    await setCategories(productId, [productData.categoryId]);
  }

  return productId;
}

// ── update ──
async function update(id, productData) {
  const [result] = await db.query(
    `UPDATE products SET
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
    WHERE id = ?`,
    [
      productData.categoryId || null,
      productData.name,
      productData.brand || null,
      productData.description || null,
      productData.price,
      productData.stock || 0,
      productData.color || null,
      productData.target || "unisexe",
      productData.status || "active",
      id,
    ]
  );

  // Mettre à jour product_categories si fournis
  if (productData.categoryIds && productData.categoryIds.length > 0) {
    await setCategories(id, productData.categoryIds);
  } else if (productData.categoryId) {
    await setCategories(id, [productData.categoryId]);
  }

  return result.affectedRows > 0;
}

// ── setCategories : remplace toutes les catégories d'un produit ──
async function setCategories(productId, categoryIds) {
  await db.query("DELETE FROM product_categories WHERE productId = ?", [productId]);
  if (categoryIds.length === 0) return;
  const values = categoryIds.map((cId) => [productId, cId]);
  await db.query(
    "INSERT INTO product_categories (productId, categoryId) VALUES ?",
    [values]
  );
}

// ── getCategories d'un produit ──
async function getCategories(productId) {
  const [rows] = await db.query(
    `SELECT c.* FROM categories c
     JOIN product_categories pc ON pc.categoryId = c.id
     WHERE pc.productId = ?
     ORDER BY c.name`,
    [productId]
  );
  return rows;
}

// ── remove ──
async function remove(id) {
  const [orderItems] = await db.query(
    "SELECT COUNT(*) as count FROM order_items WHERE productId = ?",
    [id]
  );
  if (orderItems[0].count > 0) {
    throw new Error("Impossible de supprimer un produit qui a des commandes");
  }

  await db.query("DELETE FROM product_categories WHERE productId = ?", [id]);
  await db.query("DELETE FROM product_images WHERE productId = ?", [id]);
  await db.query("DELETE FROM product_sizes WHERE productId = ?", [id]);

  const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// ── Images ──
async function addImage(productId, imageUrl, isMain = false) {
  if (isMain) {
    await db.query("UPDATE product_images SET isMain = FALSE WHERE productId = ?", [productId]);
  }
  const [result] = await db.query(
    "INSERT INTO product_images (productId, imageUrl, isMain) VALUES (?, ?, ?)",
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
  const [result] = await db.query("DELETE FROM product_images WHERE id = ?", [imageId]);
  return result.affectedRows > 0;
}

// ── Tailles ──
async function addSize(productId, sizeId, stock = 0) {
  const [result] = await db.query(
    `INSERT INTO product_sizes (productId, sizeId, stock)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE stock = VALUES(stock)`,
    [productId, sizeId, stock]
  );
  return result.insertId;
}

async function getSizes(productId) {
  const [rows] = await db.query(
    `SELECT ps.*, s.label as sizeLabel
     FROM product_sizes ps
     JOIN sizes s ON ps.sizeId = s.id
     WHERE ps.productId = ?
     ORDER BY s.sortOrder`,
    [productId]
  );
  return rows;
}

async function updateSizeStock(productId, sizeId, stock) {
  const [result] = await db.query(
    "UPDATE product_sizes SET stock = ? WHERE productId = ? AND sizeId = ?",
    [stock, productId, sizeId]
  );
  return result.affectedRows > 0;
}

async function decreaseSizeStock(productId, sizeLabel, quantity, connection = db) {
  const [result] = await connection.query(
    `UPDATE product_sizes ps
     JOIN sizes s ON s.id = ps.sizeId
     SET ps.stock = ps.stock - ?
     WHERE ps.productId = ? AND s.label = ? AND ps.stock >= ?`,
    [quantity, productId, sizeLabel, quantity]
  );
  if (result.affectedRows === 0) {
    throw new Error(`Stock insuffisant pour la taille ${sizeLabel} (quantité demandée : ${quantity})`);
  }
}

module.exports = {
  findAll,
  findById,
  findFeatured,
  create,
  update,
  remove,
  setCategories,
  getCategories,
  addImage,
  getImages,
  deleteImage,
  addSize,
  getSizes,
  updateSizeStock,
  decreaseSizeStock,
};