const express = require("express");

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const promotionController = require("../../controllers/v1/promotionController");

const router = express.Router();

router.get("/", auth, admin, promotionController.getPromotions);
router.post("/", auth, admin, promotionController.createPromotion);
router.put("/:id", auth, admin, promotionController.updatePromotion);
router.put("/:id/toggle", auth, admin, promotionController.togglePromotion);
router.delete("/:id", auth, admin, promotionController.deletePromotion);

module.exports = router;