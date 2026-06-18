const cartModel = require("../../models/v1/cartModel");

async function getOrCreateCart(userId) {
  let cart = await cartModel.findActiveCartByUserId(userId);

  if (!cart) {
    const cartId = await cartModel.createCart(userId);
    cart = {
      id: cartId,
      userId,
      status: "active",
    };
  }

  return cart;
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  const items = await cartModel.getCartItems(cart.id);

  const total = items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );

  const count = items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  return {
    cartId: cart.id,
    items,
    total,
    count,
  };
}

async function addToCart(userId, data) {
  const cart = await getOrCreateCart(userId);

  if (!data.productName || !data.price) {
    throw new Error("Nom du produit et prix obligatoires");
  }

  const quantity = Number(data.quantity || 1);

  const existingItem = await cartModel.findItem(
    cart.id,
    data.productId || null,
    data.size || null,
    data.color || null
  );

  if (existingItem) {
    await cartModel.updateItemQuantity(
      existingItem.id,
      existingItem.quantity + quantity
    );
  } else {
    await cartModel.addItem({
      cartId: cart.id,
      productId: data.productId || null,
      productName: data.productName,
      productImage: data.productImage || null,
      size: data.size || null,
      color: data.color || null,
      quantity,
      price: data.price,
    });
  }

  return getCart(userId);
}

async function updateCartItem(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);

  const item = await cartModel.getItemById(
    itemId,
    cart.id
  );

  if (!item) {
    throw new Error("Article introuvable dans le panier");
  }

  const newQuantity = Number(quantity);

  if (newQuantity <= 0) {
    await cartModel.removeItem(itemId, cart.id);
  } else {
    await cartModel.updateItemQuantity(
      itemId,
      newQuantity
    );
  }

  return getCart(userId);
}

async function removeCartItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);

  const item = await cartModel.getItemById(
    itemId,
    cart.id
  );

  if (!item) {
    throw new Error("Article introuvable dans le panier");
  }

  await cartModel.removeItem(itemId, cart.id);

  return getCart(userId);
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);

  await cartModel.clearCart(cart.id);

  return getCart(userId);
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};