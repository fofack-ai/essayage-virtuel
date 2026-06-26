require("dotenv").config();

const app = require("./app");
const db = require("./config/database");
const { port } = require("./config/environment");

async function startServer() {
  try {
    await db.query("SELECT 1");
    
    //Limite de requêtes simultanées pour éviter les erreurs de surcharge du serveur
    /*const connection = await db.getConnection();
    await connection.ping();
    connection.release();*/

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