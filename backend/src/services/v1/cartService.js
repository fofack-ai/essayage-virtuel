const cartModel = require("../../models/v1/cartModel");
const db = require("../../config/database");

async function getOrCreateCart(owner) {
  let cart = await cartModel.findActiveCartByOwner(owner);

  if (!cart) {
    const cartId = await cartModel.createCart(owner);
    cart = {
      id: cartId,
      userId: owner.userId || null,
      guestId: owner.guestId || null,
      status: "active",
    };
  }

  return cart;
}

async function getProductDetails(productId) {
  const [rows] = await db.query(
    `
    SELECT
      p.id,
      p.name,
      p.price,
      pi.imageUrl AS image
    FROM products p
    LEFT JOIN product_images pi
      ON pi.productId = p.id
      AND pi.isMain = 1
    WHERE p.id = ?
      AND p.status = 'active'
    LIMIT 1
    `,
    [productId]
  );

  if (rows.length === 0) {
    throw new Error("Produit non trouvé ou inactif");
  }

  return rows[0];
}

async function getSizeStock(productId, size) {
  if (!size) return null;

  const [rows] = await db.query(
    `
    SELECT ps.stock
    FROM product_sizes ps
    JOIN sizes s ON s.id = ps.sizeId
    WHERE ps.productId = ?
      AND s.label = ?
    LIMIT 1
    `,
    [productId, size]
  );

  return rows[0] ? Number(rows[0].stock || 0) : 0;
}

async function getCart(owner) {
  const cart = await getOrCreateCart(owner);
  const items = await cartModel.getCartItems(cart.id);

  const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const count = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  return {
    cartId: cart.id,
    items,
    total,
    count,
  };
}

async function addToCart(owner, data) {
  if (!data.productId) {
    throw new Error("ID du produit requis");
  }

  const quantity = data.quantity !== undefined ? Number(data.quantity) : 1;
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error("La quantité doit être un nombre positif");
  }

  const product = await getProductDetails(data.productId);
  const sizeStock = await getSizeStock(product.id, data.size || null);

  if (data.size && sizeStock <= 0) {
    throw new Error(`La taille ${data.size} n'est pas disponible en stock.`);
  }

  const cart = await getOrCreateCart(owner);

  const existingItem = await cartModel.findItem(
    cart.id,
    product.id,
    data.size || null,
    data.color || null
  );

  if (existingItem) {
    const nextQuantity = Number(existingItem.quantity) + quantity;

    if (data.size && sizeStock !== null && nextQuantity > sizeStock) {
      throw new Error(
        `Ce produit en taille ${data.size} n'est disponible qu'en ${sizeStock} exemplaire(s) en stock.`
      );
    }

    await cartModel.updateItemQuantity(existingItem.id, nextQuantity);
  } else {
    await cartModel.addItem({
      cartId: cart.id,
      productId: product.id,
      productName: product.name,
      productImage: product.image || null,
      size: data.size || null,
      color: data.color || null,
      quantity,
      price: product.price,
    });
  }

  return getCart(owner);
}

async function updateCartItem(owner, itemId, quantity) {
  const cart = await getOrCreateCart(owner);
  const item = await cartModel.getItemById(itemId, cart.id);

  if (!item) {
    throw new Error("Article introuvable dans le panier");
  }

  const newQuantity = Number(quantity);
  const sizeStock = await getSizeStock(item.productId, item.size || null);

  if (item.size && sizeStock !== null && newQuantity > sizeStock) {
    throw new Error(
      `Ce produit en taille ${item.size} n'est disponible qu'en ${sizeStock} exemplaire(s) en stock.`
    );
  }

  if (newQuantity <= 0) {
    await cartModel.removeItem(itemId, cart.id);
  } else {
    await cartModel.updateItemQuantity(itemId, newQuantity);
  }

  return getCart(owner);
}

async function removeCartItem(owner, itemId) {
  const cart = await getOrCreateCart(owner);
  const item = await cartModel.getItemById(itemId, cart.id);

  if (!item) {
    throw new Error("Article introuvable dans le panier");
  }

  await cartModel.removeItem(itemId, cart.id);

  return getCart(owner);
}

async function clearCart(owner) {
  const cart = await getOrCreateCart(owner);
  await cartModel.clearCart(cart.id);

  return getCart(owner);
}

/**
 * Fusionne le panier invité dans celui du compte après connexion.
 * Fusion TOLÉRANTE : un article devenu indisponible est ignoré, le reste
 * du panier est conservé. Les articles écartés sont retournés à l'appelant
 * pour pouvoir en informer le client.
 */
async function mergeGuestCart(userId, guestId) {
  const owner = { userId };
  if (!guestId) return { ...(await getCart(owner)), skipped: [] };

  const guestCart = await cartModel.findActiveCartByOwner({ guestId });
  if (!guestCart) return { ...(await getCart(owner)), skipped: [] };

  const items = await cartModel.getCartItems(guestCart.id);
  const skipped = [];

  for (const item of items) {
    try {
      await addToCart(owner, {
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      });
    } catch (error) {
      // Stock épuisé ou produit désactivé : on n'interrompt pas la fusion.
      skipped.push({
        productName: item.productName,
        size: item.size,
        reason: error.message,
      });
    }
  }

  await cartModel.closeCart(guestCart.id);

  return { ...(await getCart(owner)), skipped };
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
};