const mysql = require("mysql2/promise");
require("dotenv").config();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

module.exports = {
  origin: function (origin, callback) {
    // Autorise aussi les requêtes sans origine (Postman, curl, l'app mobile, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Non autorisé par la politique CORS"));
    }
  },
  credentials: true,
};