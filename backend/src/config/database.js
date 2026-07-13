const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Aiven impose une connexion chiffrée (SSL mode REQUIRED).
// On charge le certificat CA téléchargé depuis la console Aiven.
const caPath = process.env.DB_CA_PATH
  ? path.resolve(process.env.DB_CA_PATH)
  : null;

const ssl = caPath
  ? { ca: fs.readFileSync(caPath), rejectUnauthorized: true }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  waitForConnections: true,
  connectionLimit: 6,
  queueLimit: 0,
});

module.exports = pool;