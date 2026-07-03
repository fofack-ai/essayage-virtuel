const supportModel = require("../../models/v1/supportModel");
const activityLogModel = require("../../models/v1/activityLogModel");
const notificationModel = require("../../models/v1/notificationModel");

async function getTickets(query) {
  return supportModel.getTickets(query);
}

async function createTicket(body, user) {
  if (!body.fullName) throw new Error("Nom requis");
  if (!body.email) throw new Error("Email requis");
  if (!body.subject) throw new Error("Sujet requis");
  if (!body.message) throw new Error("Message requis");

  const id = await supportModel.createTicket({
    userId: user?.id || null,
    fullName: body.fullName,
    email: body.email,
    subject: body.subject,
    message: body.message,
    status: body.status || "open",
    priority: body.priority || "medium",
  });

  await notificationModel.createNotification({
    type: "support",
    title: "Nouveau ticket support",
    message: `${body.fullName} a envoyé un ticket : ${body.subject}`,
  });

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: user?.name || user?.fullName || "Administrateur",
    action: `Ticket support créé : ${body.subject}`,
    severity: "info",
    ipAddress: null,
  });

  return id;
}

async function updateTicket(id, body, user) {
  const ticket = await supportModel.getTicketById(id);
  if (!ticket) throw new Error("Ticket introuvable");

  await supportModel.updateTicket(id, {
    fullName: body.fullName || ticket.fullName,
    email: body.email || ticket.email,
    subject: body.subject || ticket.subject,
    message: body.message || ticket.message,
    adminResponse: body.adminResponse || ticket.adminResponse,
    status: body.status || ticket.status,
    priority: body.priority || ticket.priority,
  });

  await notificationModel.createNotification({
    type: "support",
    title: "Ticket support mis à jour",
    message: `Le ticket "${body.subject || ticket.subject}" est maintenant : ${body.status || ticket.status}`,
  });

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: user?.name || user?.fullName || "Administrateur",
    action: `Ticket support modifié : ${body.subject || ticket.subject}`,
    severity: body.status === "closed" || body.status === "resolved" ? "info" : "warning",
    ipAddress: null,
  });
}

async function deleteTicket(id, user) {
  const ticket = await supportModel.getTicketById(id);
  if (!ticket) throw new Error("Ticket introuvable");

  await supportModel.deleteTicket(id);

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: user?.name || user?.fullName || "Administrateur",
    action: `Ticket support supprimé : ${ticket.subject}`,
    severity: "critical",
    ipAddress: null,
  });
}

async function getFaqs(query) {
  return supportModel.getFaqs(query);
}

async function createFaq(body, user) {
  if (!body.question) throw new Error("Question requise");
  if (!body.answer) throw new Error("Réponse requise");

  const id = await supportModel.createFaq(body);

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: user?.name || user?.fullName || "Administrateur",
    action: `FAQ ajoutée : ${body.question}`,
    severity: "info",
    ipAddress: null,
  });

  return id;
}

async function updateFaq(id, body, user) {
  const faq = await supportModel.getFaqById(id);
  if (!faq) throw new Error("FAQ introuvable");

  await supportModel.updateFaq(id, {
    question: body.question || faq.question,
    answer: body.answer || faq.answer,
    category: body.category || faq.category,
    active: body.active !== undefined ? body.active : Boolean(faq.isActive),
  });

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: user?.name || user?.fullName || "Administrateur",
    action: `FAQ modifiée : ${body.question || faq.question}`,
    severity: "info",
    ipAddress: null,
  });
}

async function deleteFaq(id, user) {
  const faq = await supportModel.getFaqById(id);
  if (!faq) throw new Error("FAQ introuvable");

  await supportModel.deleteFaq(id);

  await activityLogModel.createLog({
    userId: user?.id || null,
    userName: user?.name || user?.fullName || "Administrateur",
    action: `FAQ supprimée : ${faq.question}`,
    severity: "warning",
    ipAddress: null,
  });
}

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
};