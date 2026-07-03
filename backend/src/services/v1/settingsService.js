const settingsModel = require("../../models/v1/settingsModel");
const activityLogModel = require("../../models/v1/activityLogModel");
const notificationModel = require("../../models/v1/notificationModel");

function parseValue(value, type) {
  if (type === "boolean") return value === "true" || value === true;
  if (type === "number") return Number(value || 0);
  if (type === "json") {
    try {
      return JSON.parse(value || "{}");
    } catch {
      return {};
    }
  }
  return value || "";
}

function stringifyValue(value, type) {
  if (type === "json") return JSON.stringify(value || {});
  if (type === "boolean") return value ? "true" : "false";
  return String(value ?? "");
}

function getUserName(user) {
  return user?.name || user?.fullName || "Administrateur";
}

async function getSettings() {
  const rows = await settingsModel.getSettings();

  const settings = {};

  rows.forEach((row) => {
    settings[row.settingKey] = parseValue(row.settingValue, row.settingType);
  });

  return settings;
}

async function saveSettings(body, user) {
  const entries = Object.entries(body || {});

  for (const [key, value] of entries) {
    let type = "text";

    if (typeof value === "boolean") type = "boolean";
    if (typeof value === "number") type = "number";
    if (typeof value === "object" && value !== null) type = "json";

    await settingsModel.upsertSetting({
      key,
      value: stringifyValue(value, type),
      type,
      group: key.split(".")[0] || "general",
    });
  }

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: getUserName(user),
    action: "Paramètres mis à jour",
    severity: "info",
    ipAddress: null,
  });

  await notificationModel.createNotification({
    type: "info",
    title: "Paramètres mis à jour",
    message: "La configuration du dashboard TryOn a été enregistrée.",
  });
}

module.exports = {
  getSettings,
  saveSettings,
};