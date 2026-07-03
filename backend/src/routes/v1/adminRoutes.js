const activityLogController = require("../../controllers/v1/activityLogController");
router.get("/logs", auth, admin, activityLogController.getLogs);
router.post("/logs", auth, admin, activityLogController.createLog);
router.delete("/logs/:id", auth, admin, activityLogController.deleteLog);