const reportService = require("../../services/v1/reportService");

async function getOverview(req, res) {
  try {
    const data = await reportService.getOverview(req.query);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getOverview,
};