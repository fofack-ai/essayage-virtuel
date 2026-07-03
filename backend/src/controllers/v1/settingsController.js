const settingsService = require("../../services/v1/settingsService");

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
};