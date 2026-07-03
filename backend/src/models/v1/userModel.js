const db = require("../../config/database");

async function findByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0];
}

async function findByGoogleId(googleId) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE googleId = ? LIMIT 1",
    [googleId]
  );
  return rows[0];
}

async function findById(id) {
  const [rows] = await db.query(
    `
    SELECT 
      id, googleId, firstName, lastName, email, role, phone, address, city,
      avatar, status, createdAt
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );
  return rows[0];
}

async function createUser(data) {
  const [result] = await db.query(
    `
    INSERT INTO users
    (firstName, lastName, email, password, role, phone, address, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.firstName,
      data.lastName,
      data.email,
      data.password,
      data.role || "client",
      data.phone || null,
      data.address || null,
      data.city || null,
    ]
  );

  return result.insertId;
}

async function createGoogleUser(data) {
  const [result] = await db.query(
    `
    INSERT INTO users
    (googleId, firstName, lastName, email, password, role, avatar, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.googleId,
      data.firstName || "Utilisateur",
      data.lastName || "Google",
      data.email,
      null,
      data.role || "client",
      data.avatar || null,
      "active",
    ]
  );

  return result.insertId;
}

async function attachGoogleAccount(userId, googleId, avatar) {
  await db.query(
    `
    UPDATE users
    SET googleId = ?, avatar = ?
    WHERE id = ?
    `,
    [googleId, avatar || null, userId]
  );
}

async function updateProfile(userId, data) {
  const [result] = await db.query(
    `
    UPDATE users
    SET firstName = ?, lastName = ?, phone = ?, email = ?
    WHERE id = ?
    `,
    [data.firstName, data.lastName, data.phone || null, data.email, userId]
  );

  return result.affectedRows > 0;
}

async function saveOtp(userId, otpCode, otpExpiresAt) {
  await db.query(
    `
    UPDATE users
    SET otpCode = ?, otpExpiresAt = ?
    WHERE id = ?
    `,
    [otpCode, otpExpiresAt, userId]
  );
}

async function clearOtp(userId) {
  await db.query(
    `
    UPDATE users
    SET otpCode = NULL, otpExpiresAt = NULL
    WHERE id = ?
    `,
    [userId]
  );
}

async function saveResetToken(userId, resetToken, resetTokenExpiresAt) {
  await db.query(
    `
    UPDATE users
    SET resetToken = ?, resetTokenExpiresAt = ?
    WHERE id = ?
    `,
    [resetToken, resetTokenExpiresAt, userId]
  );
}

async function findByResetToken(resetToken) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM users
    WHERE resetToken = ?
    LIMIT 1
    `,
    [resetToken]
  );

  return rows[0];
}

async function updatePassword(userId, hashedPassword) {
  await db.query(
    `
    UPDATE users
    SET password = ?
    WHERE id = ?
    `,
    [hashedPassword, userId]
  );
}

async function clearResetToken(userId) {
  await db.query(
    `
    UPDATE users
    SET resetToken = NULL, resetTokenExpiresAt = NULL
    WHERE id = ?
    `,
    [userId]
  );
}

module.exports = {
  findByEmail,
  findByGoogleId,
  findById,
  createUser,
  createGoogleUser,
  attachGoogleAccount,
  updateProfile,
  saveOtp,
  clearOtp,
  saveResetToken,
  findByResetToken,
  updatePassword,
  clearResetToken,
};