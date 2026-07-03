const activityLogModel = require("../../models/v1/activityLogModel");

function getUserName(user) {
  return (
    user?.fullName ||
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Administrateur"
  );
}

async function createLog(user, body, ip) {
  if (!body.action) {
    throw new Error("Action requise");
  }

  return activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: body.action,
    severity: body.severity || "info",
    ipAddress: ip || null,
  });
}

async function getLogs(query) {
  return activityLogModel.getLogs({
    severity: query.severity,
    search: query.search,
  });
}

async function deleteLog(id) {
  const log = await activityLogModel.getLogById(id);

  if (!log) {
    throw new Error("Log introuvable");
  }

  await activityLogModel.deleteLog(id);
}

module.exports = {
  createLog,
  getLogs,
  deleteLog,
};