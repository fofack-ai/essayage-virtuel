const db       = require("../../config/database");
const cartModel  = require("../../models/v1/cartModel");
const orderModel = require("../../models/v1/orderModel");
const productModel = require("../../models/v1/productModel");
const paymentModel = require("../../models/v1/paymentModel");
const notificationService = require("./notificationService");

const DELIVERY_FEES = { std: 0, exp: 2000 };

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

  const cartSubtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  const deliveryType = ["std", "exp"].includes(data.deliveryType) ? data.deliveryType : "std";
  const deliveryFee  = DELIVERY_FEES[deliveryType];

  // ✅ PLUS DE PROMO CODE
  const total = cartSubtotal + deliveryFee;

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
    });

    const order = await orderModel.getOrderById(orderId, userId);
    const orderNumber = order?.orderNumber || `#${orderId}`;

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