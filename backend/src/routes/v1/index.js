const express = require("express");

const router = express.Router();

const authRoutes = require("./auth");
const cartRoutes = require("./cart");
const orderRoutes = require("./order");
const adminRoutes = require("./admin");
const productRoutes = require("./product");
const categoryRoutes = require("./category");
const tryonRoutes = require("./tryon");
const measurementRoutes = require("./measurement");
const activityLogRoutes = require("./activityLog");
const notificationRoutes = require("./notification");
const supportRoutes = require("./support");
const promotionRoutes = require("./promotion");
const reviewRoutes = require("./review");
const settingsRoutes = require("./settings");
const reportRoutes = require("./report");
const paymentRoutes = require("./paymentRoutes");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API TryOn v1 opérationnelle",
  });
});

router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/tryons", tryonRoutes);
router.use("/measurements", measurementRoutes);
router.use("/logs", activityLogRoutes);
router.use("/notifications", notificationRoutes);
router.use("/support", supportRoutes);
router.use("/promotions", promotionRoutes);
router.use("/reviews", reviewRoutes);
router.use("/settings", settingsRoutes);
router.use("/reports", reportRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;