const db       = require("../../config/database");
const cartModel  = require("../../models/v1/cartModel");
const orderModel = require("../../models/v1/orderModel");
const productModel = require("../../models/v1/productModel");

const DELIVERY_FEES = { std: 0, exp: 2000 };

// Le backend est la source de vérité pour les codes promo
const VALID_PROMOS = { TRYON10: 10, BIENVENUE: 15 };

function generateOrderNumber() {
  const date   = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TRY-${date}-${random}`;
}

async function createOrderFromCart(userId, data) {
  const cart = await cartModel.findActiveCartByUserId(userId);
  if (!cart) throw new Error("Aucun panier actif trouvé");

  const items = await cartModel.getCartItems(cart.id);
  if (!items.length) throw new Error("Votre panier est vide");

  // Total calculé depuis la DB (on ne fait pas confiance au client)
  const cartSubtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  // Frais de livraison
  const deliveryType = ["std", "exp"].includes(data.deliveryType) ? data.deliveryType : "std";
  const deliveryFee  = DELIVERY_FEES[deliveryType];

  // Code promo (revalidé côté serveur)
  const promoCode = data.promoCode ? data.promoCode.toUpperCase().trim() : null;
  const promoPct  = (promoCode && VALID_PROMOS[promoCode]) ? VALID_PROMOS[promoCode] : 0;
  const promoDiscount = Math.round(cartSubtotal * promoPct / 100);

  const total = cartSubtotal + deliveryFee - promoDiscount;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const orderId = await orderModel.createOrder(connection, {
      userId,
      orderNumber:     generateOrderNumber(),
      total,
      paymentMethod:   data.paymentMethod || "cash_on_delivery",
      paymentStatus:   "pending",
      deliveryAddress: data.deliveryAddress || null,
      deliveryCity:    data.deliveryCity    || null,
      deliveryPhone:   data.deliveryPhone   || null,
      deliveryType,
      deliveryFee,
      promoCode,
      promoDiscount,
    });

    for (const item of items) {

      await orderModel.createOrderItem(connection, {
        orderId,
        productId:    item.productId,
        productName:  item.productName,
        productImage: item.productImage,
        size:         item.size,
        color:        item.color,
        quantity:     item.quantity,
        price:        item.price,
        subtotal:     item.subtotal,
      });

      if (item.size) {
        await productModel.decreaseSizeStock(
          item.productId,
          item.size,
          item.quantity,
          connection
        );
      }
    }

    await orderModel.markCartAsConverted(connection, cart.id);
    await connection.commit();

    return getOrderDetails(orderId, userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getMyOrders(userId) {
  return orderModel.getUserOrders(userId);
}

async function getOrderDetails(orderId, userId) {
  const order = await orderModel.getOrderById(orderId, userId);
  if (!order) throw new Error("Commande introuvable");
  const items = await orderModel.getOrderItems(orderId);
  return { ...order, items };
}

module.exports = { createOrderFromCart, getMyOrders, getOrderDetails };