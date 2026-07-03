const db = require("../../config/database");

function getDateCondition(period, column = "createdAt") {
  if (period === "today") return `DATE(${column}) = CURDATE()`;
  if (period === "week") return `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
  if (period === "month") return `${column} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
  if (period === "year") return `${column} >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`;
  return "1=1";
}

async function getSummary(period) {
  const dateCondition = getDateCondition(period, "createdAt");

  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
      COALESCE(AVG(CASE WHEN status != 'cancelled' THEN total END), 0) AS averageOrder,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS deliveredOrders,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingOrders,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledOrders
    FROM orders
    WHERE ${dateCondition}
  `);

  const [clients] = await db.query(`
    SELECT COUNT(*) AS totalClients
    FROM users
    WHERE role = 'client'
  `);

  const [products] = await db.query(`
    SELECT COUNT(*) AS totalProducts
    FROM products
  `);

  return {
    totalOrders: Number(rows[0]?.totalOrders || 0),
    revenue: Number(rows[0]?.revenue || 0),
    averageOrder: Number(rows[0]?.averageOrder || 0),
    deliveredOrders: Number(rows[0]?.deliveredOrders || 0),
    pendingOrders: Number(rows[0]?.pendingOrders || 0),
    cancelledOrders: Number(rows[0]?.cancelledOrders || 0),
    totalClients: Number(clients[0]?.totalClients || 0),
    totalProducts: Number(products[0]?.totalProducts || 0),
  };
}

async function getSalesEvolution(period) {
  const dateCondition = getDateCondition(period, "createdAt");

  const [rows] = await db.query(`
    SELECT
      DATE_FORMAT(createdAt, '%Y-%m-%d') AS label,
      COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
      COUNT(*) AS orders
    FROM orders
    WHERE ${dateCondition}
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
    ORDER BY label ASC
  `);

  return rows;
}

async function getTopProducts(period) {
  const dateCondition = getDateCondition(period, "o.createdAt");

  const [rows] = await db.query(`
    SELECT
      oi.productName AS name,
      SUM(oi.quantity) AS quantity,
      COALESCE(SUM(oi.subtotal), 0) AS revenue
    FROM order_items oi
    INNER JOIN orders o ON o.id = oi.orderId
    WHERE ${dateCondition}
      AND o.status != 'cancelled'
    GROUP BY oi.productName
    ORDER BY quantity DESC
    LIMIT 10
  `);

  return rows;
}

async function getTopClients(period) {
  const dateCondition = getDateCondition(period, "o.createdAt");

  const [rows] = await db.query(`
    SELECT
      CONCAT(u.firstName, ' ', u.lastName) AS name,
      u.email,
      COUNT(o.id) AS orders,
      COALESCE(SUM(o.total), 0) AS totalSpent
    FROM orders o
    LEFT JOIN users u ON u.id = o.userId
    WHERE ${dateCondition}
      AND o.status != 'cancelled'
    GROUP BY u.id, u.firstName, u.lastName, u.email
    ORDER BY totalSpent DESC
    LIMIT 10
  `);

  return rows;
}

async function getOrderStatus(period) {
  const dateCondition = getDateCondition(period, "createdAt");

  const [rows] = await db.query(`
    SELECT
      status,
      COUNT(*) AS total
    FROM orders
    WHERE ${dateCondition}
    GROUP BY status
  `);

  return rows;
}

async function getPaymentMethods(period) {
  const dateCondition = getDateCondition(period, "createdAt");

  const [rows] = await db.query(`
    SELECT
      paymentMethod AS method,
      COUNT(*) AS total,
      COALESCE(SUM(total), 0) AS amount
    FROM orders
    WHERE ${dateCondition}
      AND status != 'cancelled'
    GROUP BY paymentMethod
  `);

  return rows;
}

async function getStockSummary() {
  const [rows] = await db.query(`
    SELECT
      COUNT(p.id) AS totalProducts,
      SUM(CASE WHEN COALESCE(s.totalStock, 0) = 0 THEN 1 ELSE 0 END) AS outOfStock,
      SUM(CASE WHEN COALESCE(s.totalStock, 0) > 0 AND COALESCE(s.totalStock, 0) <= 5 THEN 1 ELSE 0 END) AS lowStock,
      SUM(CASE WHEN COALESCE(s.totalStock, 0) > 5 THEN 1 ELSE 0 END) AS availableStock
    FROM products p
    LEFT JOIN (
      SELECT productId, SUM(stock) AS totalStock
      FROM product_sizes
      GROUP BY productId
    ) s ON s.productId = p.id
  `);

  return {
    totalProducts: Number(rows[0]?.totalProducts || 0),
    outOfStock: Number(rows[0]?.outOfStock || 0),
    lowStock: Number(rows[0]?.lowStock || 0),
    availableStock: Number(rows[0]?.availableStock || 0),
  };
}

async function getReviewsSummary() {
  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS totalReviews,
      COALESCE(AVG(rating), 0) AS averageRating,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingReviews,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedReviews,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejectedReviews
    FROM reviews
  `);

  return {
    totalReviews: Number(rows[0]?.totalReviews || 0),
    averageRating: Number(rows[0]?.averageRating || 0),
    pendingReviews: Number(rows[0]?.pendingReviews || 0),
    approvedReviews: Number(rows[0]?.approvedReviews || 0),
    rejectedReviews: Number(rows[0]?.rejectedReviews || 0),
  };
}

async function getSupportSummary() {
  const [rows] = await db.query(`
    SELECT
      COUNT(*) AS totalTickets,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS openTickets,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingTickets,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolvedTickets,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closedTickets
    FROM support_tickets
  `);

  return {
    totalTickets: Number(rows[0]?.totalTickets || 0),
    openTickets: Number(rows[0]?.openTickets || 0),
    pendingTickets: Number(rows[0]?.pendingTickets || 0),
    resolvedTickets: Number(rows[0]?.resolvedTickets || 0),
    closedTickets: Number(rows[0]?.closedTickets || 0),
  };
}

module.exports = {
  getSummary,
  getSalesEvolution,
  getTopProducts,
  getTopClients,
  getOrderStatus,
  getPaymentMethods,
  getStockSummary,
  getReviewsSummary,
  getSupportSummary,
};