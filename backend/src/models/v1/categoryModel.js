const db = require("../../config/database");

async function findAll() {
  const [rows] = await db.query(
    "SELECT * FROM categories ORDER BY name ASC"
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    "SELECT * FROM categories WHERE id = ?",
    [id]
  );
  return rows[0];
}

async function findBySlug(slug) {
  const [rows] = await db.query(
    "SELECT * FROM categories WHERE slug = ?",
    [slug]
  );
  return rows[0];
}

async function create(categoryData) {
  const [result] = await db.query(
    `
    INSERT INTO categories
    (name, slug)
    VALUES (?, ?)
    `,
    [
      categoryData.name,
      categoryData.slug
    ]
  );
  return result.insertId;
}

async function update(id, categoryData) {
  const [result] = await db.query(
    `
    UPDATE categories
    SET
      name = ?,
      slug = ?,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [
      categoryData.name,
      categoryData.slug,
      id
    ]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  // Check if category has products first
  const [productCount] = await db.query(
    "SELECT COUNT(*) as count FROM products WHERE categoryId = ?",
    [id]
  );

  if (productCount[0].count > 0) {
    throw new Error("Impossible de supprimer une catégorie contenant des produits");
  }

  const [result] = await db.query(
    "DELETE FROM categories WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  remove
};