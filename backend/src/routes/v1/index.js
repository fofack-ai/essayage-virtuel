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

module.exports = router;