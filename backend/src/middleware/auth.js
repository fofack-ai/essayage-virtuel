const { verifyToken } = require("../utils/jwt");
const settingsService = require("../services/v1/settingsService");

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token manquant",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;

    // 👇 VÉRIFIER LE MODE MAINTENANCE POUR LES CLIENTS
    // Si l'utilisateur n'est PAS admin
    if (decoded.role !== 'admin') {
      const maintenanceMode = await settingsService.getSetting('maintenanceMode', false);
      
      if (maintenanceMode) {
        return res.status(403).json({
          success: false,
          message: "maintenance_mode",
          error: "Site en maintenance. Seuls les administrateurs peuvent accéder.",
        });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }
}

module.exports = auth;