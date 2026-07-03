const express = require("express");

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const supportController = require("../../controllers/v1/supportController");

const router = express.Router();

router.get("/tickets", auth, admin, supportController.getTickets);
router.post("/tickets", auth, admin, supportController.createTicket);
router.put("/tickets/:id", auth, admin, supportController.updateTicket);
router.delete("/tickets/:id", auth, admin, supportController.deleteTicket);

router.get("/faqs", supportController.getFaqs);

router.post("/faqs", auth, admin, supportController.createFaq);
router.put("/faqs/:id", auth, admin, supportController.updateFaq);
router.delete("/faqs/:id", auth, admin, supportController.deleteFaq);

module.exports = router;