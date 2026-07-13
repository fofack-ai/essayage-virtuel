const settingsService = require("../../services/v1/settingsService");

// ✅ NOUVELLE FONCTION - Route publique
async function getPublicSettings(req, res) {
  try {
    // On ne renvoie que les paramètres nécessaires pour le frontend public
    const settings = await settingsService.getSettings();
    
    // Filtrer pour ne renvoyer que ce qui est utile au public
    const publicSettings = {
      maintenanceMode: settings.maintenanceMode || false,
      registrationEnabled: settings.registrationEnabled || true,
      // Ajouter d'autres paramètres publics si besoin
    };

    res.json({
      success: true,
      data: publicSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getSettings(req, res) {
  try {
    const settings = await settingsService.getSettings();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function saveSettings(req, res) {
  try {
    await settingsService.saveSettings(req.body, req.user);

    res.json({
      success: true,
      message: "Paramètres enregistrés",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getSettings,
  saveSettings,
  getPublicSettings, // 👈 EXPORTER LA NOUVELLE FONCTION
};