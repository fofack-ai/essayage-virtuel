const express = require("express");

const router = express.Router();

const authRoutes = require("./auth");
const cartRoutes = require("./cart");
const orderRoutes = require("./order");
const adminRoutes = require("./admin");

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

module.exports = router;