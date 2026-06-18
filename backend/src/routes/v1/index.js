const express = require("express");

const router = express.Router();

const authRoutes = require("./auth");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API TryOn v1 opérationnelle",
  });
});

router.use(
  "/auth",
  authRoutes
);

module.exports = router;