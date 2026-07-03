const activityLogService = require("../../services/v1/activityLogService");

async function createLog(req, res) {
  try {
    const logId = await activityLogService.createLog(
      req.user,
      req.body,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "Log enregistré",
      data: { id: logId },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getLogs(req, res) {
  try {
    const logs = await activityLogService.getLogs(req.query);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteLog(req, res) {
  try {
    await activityLogService.deleteLog(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Log supprimé",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createLog,
  getLogs,
  deleteLog,
};