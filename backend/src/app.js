const cookieParser = require('cookie-parser');
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const passport = require("./config/passport");

const corsOptions = require("./config/cors");
const v1Routes = require("./routes/v1");

const app = express();

// Derrière un proxy (Render, Railway, Nginx…) pour que le rate-limit et les
// IP clientes soient corrects.
app.set("trust proxy", 1);

// --- Sécurité HTTP ---
// crossOriginResourcePolicy désactivé : sinon les images /uploads servies au
// frontend (autre origine) seraient bloquées par le navigateur.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(passport.initialize());
app.use(cookieParser());

// --- Limitation de débit ---
// Global : garde-fou anti-abus. Auth : plus strict (anti brute-force login).
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de requêtes. Réessayez plus tard." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de tentatives. Réessayez dans quelques minutes.",
  },
});

app.use("/api/", globalLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/forgot-password", authLimiter);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API TryOn opérationnelle",
  });
});

// Toutes les routes v1 (auth, products, orders, payments, etc.) sont montées
// UNE seule fois ici. L'ancien app.js montait /payments une 2e fois : doublon
// supprimé (les routes payment sont déjà incluses dans routes/v1/index.js).
app.use("/api/v1", v1Routes);

// --- 404 : route inconnue -> JSON propre (pas de page HTML) ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
});

// --- Gestionnaire d'erreurs global ---
// Attrape les erreurs CORS, JSON malformé, et toute exception non gérée.
// Renvoie toujours du JSON, jamais une stack trace brute au client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes("CORS")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  if (err && err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ success: false, message: "Corps de requête JSON invalide" });
  }

  console.error("Erreur non gérée :", err);
  return res.status(500).json({
    success: false,
    message: "Une erreur interne est survenue. Réessayez plus tard.",
  });
});

module.exports = app;
