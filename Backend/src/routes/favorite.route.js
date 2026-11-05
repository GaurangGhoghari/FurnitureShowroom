const express = require("express");
const router = express.Router();

const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favorite.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Get logged-in user's favorites
router.get("/", authMiddleware, getFavorites);

// Add product to favorites
router.post("/:productId", authMiddleware, addFavorite);

// Remove product from favorites
router.delete("/:productId", authMiddleware, removeFavorite);

module.exports = router;