const express = require("express");

const router = express.Router();

const authRoutes = require("./auth");
const cartRoutes = require("./cart");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API TryOn v1 opérationnelle",
  });
});

router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);

module.exports = router;