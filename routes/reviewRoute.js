const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const reviewController = require("../controller/reviewsController");

// Send review
router.post("/reviews", ensureAuth, reviewController.createReview);


module.exports = router;

