const db = require("../../config/database");

async function getSettings() {
  const [rows] = await db.query(`
    SELECT
      settingKey,
      settingValue,
      settingType,
      groupName
    FROM app_settings
    ORDER BY groupName, settingKey
  `);

  return rows;
}

async function upsertSetting(setting) {
  await db.query(
    `
    INSERT INTO app_settings
    (settingKey, settingValue, settingType, groupName)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      settingValue = VALUES(settingValue),
      settingType = VALUES(settingType),
      groupName = VALUES(groupName)
    `,
    [
      setting.key,
      setting.value,
      setting.type || "text",
      setting.group || "general",
    ]
  );
}

module.exports = {
  getSettings,
  upsertSetting,
};