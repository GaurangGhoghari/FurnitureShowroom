
const express = require("express");
const router = express.Router();

const {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Get product reviews - Public
router.get("/:productId", getProductReviews);

// Add review - Login required
router.post("/", authMiddleware, addReview);

// Update own review - Login required
router.put("/:id", authMiddleware, updateReview);

// Delete own review - Login required
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;