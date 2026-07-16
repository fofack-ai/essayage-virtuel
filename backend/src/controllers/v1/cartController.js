const cartService = require("../../services/v1/cartService");

async function getCart(req, res) {
  try {
    const cart = await cartService.getCart(req.owner);

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function addToCart(req, res) {
  try {
    const cart = await cartService.addToCart(req.owner, req.body);

    return res.status(201).json({
      success: true,
      message: "Produit ajouté au panier",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function updateCartItem(req, res) {
  try {
    const cart = await cartService.updateCartItem(
      req.owner,
      req.params.itemId,
      req.body.quantity
    );

    return res.status(200).json({
      success: true,
      message: "Quantité mise à jour",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function removeCartItem(req, res) {
  try {
    const cart = await cartService.removeCartItem(
      req.owner,
      req.params.itemId
    );

    return res.status(200).json({
      success: true,
      message: "Produit supprimé du panier",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function clearCart(req, res) {
  try {
    const cart = await cartService.clearCart(req.owner);

    return res.status(200).json({
      success: true,
      message: "Panier vidé",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/v1/cart/merge
 * Rapatrie le panier constitué en tant qu'invité dans le panier du compte.
 */
async function mergeGuestCart(req, res) {
  try {
    const cart = await cartService.mergeGuestCart(
      req.user.id,
      req.cookies?.guestId
    );

    const message = cart.skipped.length
      ? `Panier fusionné. ${cart.skipped.length} article(s) indisponible(s) n'ont pas pu être repris.`
      : "Panier fusionné";

    return res.status(200).json({ success: true, message, data: cart });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
};