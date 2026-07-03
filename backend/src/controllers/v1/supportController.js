const supportService = require("../../services/v1/supportService");

async function getTickets(req, res) {
  try {
    const tickets = await supportService.getTickets(req.query);

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createTicket(req, res) {
  try {
    const id = await supportService.createTicket(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "Ticket créé",
      data: { id },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateTicket(req, res) {
  try {
    await supportService.updateTicket(req.params.id, req.body, req.user);

    res.json({
      success: true,
      message: "Ticket mis à jour",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteTicket(req, res) {
  try {
    await supportService.deleteTicket(req.params.id, req.user);

    res.json({
      success: true,
      message: "Ticket supprimé",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getFaqs(req, res) {
  try {
    const faqs = await supportService.getFaqs(req.query);

    res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createFaq(req, res) {
  try {
    const id = await supportService.createFaq(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "FAQ créée",
      data: { id },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateFaq(req, res) {
  try {
    await supportService.updateFaq(req.params.id, req.body, req.user);

    res.json({
      success: true,
      message: "FAQ mise à jour",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteFaq(req, res) {
  try {
    await supportService.deleteFaq(req.params.id, req.user);

    res.json({
      success: true,
      message: "FAQ supprimée",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
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