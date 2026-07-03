const express = require("express");

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const activityLogController = require("../../controllers/v1/activityLogController");

const router = express.Router();

router.get("/", auth, admin, activityLogController.getLogs);
router.post("/", auth, admin, activityLogController.createLog);
router.delete("/:id", auth, admin, activityLogController.deleteLog);

module.exports = router;