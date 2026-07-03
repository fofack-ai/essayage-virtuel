const express = require("express");

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const reportController = require("../../controllers/v1/reportController");

const router = express.Router();

router.get("/overview", auth, admin, reportController.getOverview);

module.exports = router;