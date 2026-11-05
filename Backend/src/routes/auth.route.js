const express = require("express");

const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

// Get Current User
router.get("/me", authMiddleware, getCurrentUser);

// Update Profile with Image Upload
router.put(
  "/profile",
  authMiddleware,
  upload.single("profile_image"),
  updateUserProfile
);

module.exports = router;