const db       = require("../../config/database");
const cartModel  = require("../../models/v1/cartModel");
const orderModel = require("../../models/v1/orderModel");
const productModel = require("../../models/v1/productModel");
const paymentModel = require("../../models/v1/paymentModel");
const notificationService = require("./notificationService");

/**
 * Livraison : forfait unique de 2 000 FCFA, Douala uniquement.
 *
 * Le montant est décidé ICI et jamais accepté depuis le client : un frais de
 * port modifiable dans le navigateur n'est pas une fonctionnalité, c'est une
 * faille. Le frontend l'affiche, le serveur le facture.
 *
 * ⚠️ Doit rester synchronisé avec DELIVERY_FEE dans frontend/src/pages/
 * checkout/Checkout.jsx. Le jour où les frais seront zonés par quartier,
 * c'est cette constante qui devient une table — et l'idéal sera alors que le
 * frontend lise le montant renvoyé par le serveur au lieu de le recopier.
 */
const DELIVERY_FEE_DOUALA = 2000;
const DELIVERY_FEES = { std: DELIVERY_FEE_DOUALA, exp: DELIVERY_FEE_DOUALA };

function generateOrderNumber() {
  const date   = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TRY-${date}-${random}`;
}

async function createOrderFromCart(userId, data) {
  // findActiveCartByUserId a été renommée findActiveCartByOwner lors du
  // passage au panier invité : elle prend désormais un propriétaire, compte
  // OU invité, et non plus un identifiant nu. Cet appel n'avait pas suivi.
  const cart = await cartModel.findActiveCartByOwner({ userId });
  if (!cart) throw new Error("Aucun panier actif trouvé");

  const items = await cartModel.getCartItems(cart.id);
  if (!items.length) throw new Error("Votre panier est vide");

  const cartSubtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  const deliveryType = ["std", "exp"].includes(data.deliveryType) ? data.deliveryType : "std";
  const deliveryFee  = DELIVERY_FEES[deliveryType];

  // ✅ PLUS DE PROMO CODE
  const total = cartSubtotal + deliveryFee;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const orderNumber = generateOrderNumber();

    const orderId = await orderModel.createOrder(connection, {
      userId,
      orderNumber,
      total,
      paymentMethod:   data.paymentMethod || "cash_on_delivery",
      paymentStatus:   "pending",
      deliveryAddress: data.deliveryAddress || null,
      deliveryCity:    data.deliveryCity    || null,
      deliveryPhone:   data.deliveryPhone   || null,
      deliveryType,
      deliveryFee,
    });

    // On NE relit PAS la commande ici. getOrderById passe par le pool, pas par
    // `connection` : il ne verrait pas une ligne encore dans la transaction et
    // renverrait undefined. Le `order?.orderNumber || #id` qui suivait masquait
    // ce fait. Le numéro, on vient de le générer — inutile d'aller le chercher.

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

    await paymentModel.createPayment(connection, {
      orderId: orderId,
      paymentMethod: data.paymentMethod || "cash_on_delivery",
      provider: data.paymentMethod === "cash_on_delivery" ? "manual" : "paydunya",
      transactionId: null,
      amount: total,
      currency: "XAF",
      status: data.paymentMethod === "cash_on_delivery" ? "pending" : "processing",
      paymentUrl: null,
    });

    await connection.commit();

    try {
      await notificationService.createUserNotification({
        userId: userId,
        type: "order",
        title: "Commande confirmée",
        message: `Votre commande ${orderNumber} a été validée avec succès. Montant : ${total.toLocaleString()} FCFA.`,
        isRead: false,
      });
    } catch (err) {
      console.error("Erreur création notification commande:", err.message);
    }

    try {
      await notificationService.createAdminNotification({
        adminId: 1,
        type: "order",
        title: "Nouvelle commande",
        message: `Nouvelle commande ${orderNumber} de ${total.toLocaleString()} FCFA.`,
        isRead: false,
      });
    } catch (err) {
      console.error("Erreur création notification admin:", err.message);
    }

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