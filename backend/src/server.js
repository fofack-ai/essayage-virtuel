require("dotenv").config();

const app = require("./app");
const db = require("./config/database");
const { port } = require("./config/environment");

async function startServer() {
  try {
    await db.query("SELECT 1");

    console.log("Connexion MySQL Alwaysdata réussie");

    app.listen(port, () => {
      console.log(`Serveur lancé sur le port ${port}`);
    });
  } catch (error) {
    console.error("Erreur connexion MySQL :", error.message);
    process.exit(1);
  }
}

startServer();