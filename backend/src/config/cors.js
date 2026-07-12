require("dotenv").config();

// Origines autorisées à appeler l'API.
// En production, définir FRONTEND_URL sur l'URL réelle du site (https://...).
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

module.exports = {
  origin: function (origin, callback) {
    // Autorise aussi les requêtes sans origine (Postman, curl, app mobile, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Non autorisé par la politique CORS"));
    }
  },
  credentials: true,
};
