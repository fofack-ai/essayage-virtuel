const express = require("express");

const auth = require("../../middleware/auth");
const admin = require("../../middleware/admin");
const reviewController = require("../../controllers/v1/reviewController");

const router = express.Router();

router.get("/", auth, admin, reviewController.getReviews);
router.post("/", auth, admin, reviewController.createReview);
router.put("/:id", auth, admin, reviewController.updateReview);
router.put("/:id/status", auth, admin, reviewController.updateReviewStatus);
router.delete("/:id", auth, admin, reviewController.deleteReview);

module.exports = router;