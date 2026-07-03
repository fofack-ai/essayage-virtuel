const db = require("../../config/database");

async function getTickets(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.status && filters.status !== "all") {
    conditions.push("status = ?");
    values.push(filters.status);
  }

  if (filters.priority && filters.priority !== "all") {
    conditions.push("priority = ?");
    values.push(filters.priority);
  }

  if (filters.search) {
    conditions.push("(fullName LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)");
    values.push(
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT
      id,
      userId,
      fullName AS client,
      email,
      subject,
      message,
      adminResponse,
      status,
      priority,
      DATE_FORMAT(createdAt, '%Y-%m-%d') AS date,
      DATE_FORMAT(updatedAt, '%Y-%m-%d %H:%i:%s') AS updatedAt
    FROM support_tickets
    ${where}
    ORDER BY createdAt DESC
    LIMIT 200
    `,
    values
  );

  return rows;
}

async function getTicketById(id) {
  const [rows] = await db.query(
    "SELECT * FROM support_tickets WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0];
}

async function createTicket(data) {
  const [result] = await db.query(
    `
    INSERT INTO support_tickets
    (userId, fullName, email, subject, message, status, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.userId || null,
      data.fullName,
      data.email,
      data.subject,
      data.message,
      data.status || "open",
      data.priority || "medium",
    ]
  );

  return result.insertId;
}

async function updateTicket(id, data) {
  await db.query(
    `
    UPDATE support_tickets
    SET
      fullName = ?,
      email = ?,
      subject = ?,
      message = ?,
      adminResponse = ?,
      status = ?,
      priority = ?
    WHERE id = ?
    `,
    [
      data.fullName,
      data.email,
      data.subject,
      data.message,
      data.adminResponse || null,
      data.status || "open",
      data.priority || "medium",
      id,
    ]
  );
}

async function deleteTicket(id) {
  await db.query("DELETE FROM support_tickets WHERE id = ?", [id]);
}

async function getFaqs(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.active === "true") conditions.push("isActive = 1");
  if (filters.active === "false") conditions.push("isActive = 0");

  if (filters.search) {
    conditions.push("(question LIKE ? OR answer LIKE ? OR category LIKE ?)");
    values.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT
      id,
      question,
      answer,
      category,
      isActive AS active,
      DATE_FORMAT(createdAt, '%Y-%m-%d') AS date
    FROM faq_items
    ${where}
    ORDER BY createdAt DESC
    LIMIT 200
    `,
    values
  );

  return rows;
}

async function getFaqById(id) {
  const [rows] = await db.query(
    "SELECT * FROM faq_items WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0];
}

async function createFaq(data) {
  const [result] = await db.query(
    `
    INSERT INTO faq_items
    (question, answer, category, isActive)
    VALUES (?, ?, ?, ?)
    `,
    [
      data.question,
      data.answer,
      data.category || "Général",
      data.active === false ? 0 : 1,
    ]
  );

  return result.insertId;
}

async function updateFaq(id, data) {
  await db.query(
    `
    UPDATE faq_items
    SET question = ?, answer = ?, category = ?, isActive = ?
    WHERE id = ?
    `,
    [
      data.question,
      data.answer,
      data.category || "Général",
      data.active === false ? 0 : 1,
      id,
    ]
  );
}

async function deleteFaq(id) {
  await db.query("DELETE FROM faq_items WHERE id = ?", [id]);
}

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
};