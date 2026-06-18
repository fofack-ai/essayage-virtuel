const db = require("../../config/database");
const cartModel = require("../../models/v1/cartModel");
const orderModel = require("../../models/v1/orderModel");

function generateOrderNumber() {
  const date = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `TRY-${date}-${random}`;
}

async function createOrderFromCart(userId, data) {
  const cart = await cartModel.findActiveCartByUserId(userId);

  if (!cart) {
    throw new Error("Aucun panier actif trouvé");
  }

  const items = await cartModel.getCartItems(cart.id);

  if (!items.length) {
    throw new Error("Votre panier est vide");
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0
  );

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const orderId = await orderModel.createOrder(connection, {
      userId,
      orderNumber: generateOrderNumber(),
      total,
      paymentMethod: data.paymentMethod || "cash_on_delivery",
      paymentStatus:
        data.paymentMethod === "online" ? "pending" : "pending",
      deliveryAddress: data.deliveryAddress,
      deliveryCity: data.deliveryCity,
      deliveryPhone: data.deliveryPhone,
    });

    for (const item of items) {
      await orderModel.createOrderItem(connection, {
        orderId,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      });
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
  const orders = await orderModel.getUserOrders(userId);

  return orders;
}

async function getOrderDetails(orderId, userId) {
  const order = await orderModel.getOrderById(orderId, userId);

  if (!order) {
    throw new Error("Commande introuvable");
  }

  const items = await orderModel.getOrderItems(orderId);

  return {
    ...order,
    items,
  };
}

module.exports = {
  createOrderFromCart,
  getMyOrders,
  getOrderDetails,
};