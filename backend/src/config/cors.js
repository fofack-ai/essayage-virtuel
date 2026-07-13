require("dotenv").config();

// FRONTEND_URL peut contenir une ou plusieurs origines séparées par des virgules,
// par exemple : "https://www.votredomaine.com,https://votredomaine.com"
const configuredOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
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