const db = require("../../config/database");

/**
 * Retrouve le panier actif d'un porteur.
 * @param {{userId?: number, guestId?: string}} owner
 */
async function findActiveCartByOwner(owner) {
  const [field, value] = owner.userId
    ? ["userId", owner.userId]
    : ["guestId", owner.guestId];

  const [rows] = await db.query(
    `SELECT * FROM carts WHERE ${field} = ? AND status = 'active' LIMIT 1`,
    [value]
  );

  return rows[0];
}

/** Crée un panier pour un compte OU un invité (l'autre colonne reste NULL). */
async function createCart(owner) {
  const [result] = await db.query(
    "INSERT INTO carts (userId, guestId, status) VALUES (?, ?, 'active')",
    [owner.userId || null, owner.guestId || null]
  );

  return result.insertId;
}

async function findItem(cartId, productId, size, color) {
  const [rows] = await db.query(
    `
    SELECT * FROM cart_items
    WHERE cartId = ?
    AND productId = ?
    AND size <=> ?
    AND color <=> ?
    LIMIT 1
    `,
    [cartId, productId, size || null, color || null]
  );

  return rows[0];
}

async function addItem(data) {
  const [result] = await db.query(
    `
    INSERT INTO cart_items
    (cartId, productId, productName, productImage, size, color, quantity, price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.cartId,
      data.productId || null,
      data.productName,
      data.productImage || null,
      data.size || null,
      data.color || null,
      data.quantity || 1,
      data.price,
    ]
  );

  return result.insertId;
}

async function updateItemQuantity(itemId, quantity) {
  await db.query(
    "UPDATE cart_items SET quantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [quantity, itemId]
  );
}

async function removeItem(cartItemId) {
  await db.query('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
}

async function clearCart(cartId) {
  await db.query('DELETE FROM cart_items WHERE cartId = ?', [cartId]);
}

/** Clôt un panier après fusion (on garde la trace au lieu de supprimer). */
async function closeCart(cartId) {
  await db.query("UPDATE carts SET status = 'merged' WHERE id = ?", [cartId]);
}

async function getCartItems(cartId) {
  const [rows] = await db.query(
    `
    SELECT
      ci.id,
      ci.productId,
      ci.productName,
      ci.productImage,
      ci.size,
      ci.color,
      ci.quantity,
      ci.price,
      (ci.quantity * ci.price) AS subtotal,
      ci.createdAt,
      ci.updatedAt,
      COALESCE(ps.stock, 0) AS sizeStock
    FROM cart_items ci
    LEFT JOIN sizes s
      ON s.label = ci.size
    LEFT JOIN product_sizes ps
      ON ps.productId = ci.productId
      AND ps.sizeId = s.id
    WHERE ci.cartId = ?
    ORDER BY ci.createdAt DESC
    `,
    [cartId]
  );

  return rows;
}

async function getItemById(itemId, cartId) {
  const [rows] = await db.query(
    "SELECT * FROM cart_items WHERE id = ? AND cartId = ? LIMIT 1",
    [itemId, cartId]
  );

  return rows[0];
}

module.exports = {
  findActiveCartByOwner,
  createCart,
  findItem,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  closeCart,
  getCartItems,
  getItemById,
};