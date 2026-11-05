const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cart.controller");

const authMiddleware = require("../middleware/auth.middleware");

// Get logged-in user's cart
router.get("/", authMiddleware, getCart);

// Add product to cart
router.post("/add", authMiddleware, addToCart);

// Update cart item quantity
router.put("/item/:id", authMiddleware, updateCartItem);

// Remove product from cart
router.delete("/item/:id", authMiddleware, removeCartItem);

module.exports = router;
