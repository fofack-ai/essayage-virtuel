const db = require("../../config/database");

async function findByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  return rows[0];
}

async function findById(id) {
  const [rows] = await db.query(
    `
    SELECT id, firstName, lastName, email, role, phone, address, city, createdAt
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

module.exports = {
  findByEmail,
  findById,
  createUser,
};