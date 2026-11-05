const express = require("express");
const router = express.Router();

// Controller
const { getAllUsers,updateUserStatus,getUserProfile} = require("../controllers/adminuser.controller");

// Existing authentication middleware
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");


// GET: All users with search and pagination
router.get("/",  authMiddleware,adminMiddleware,getAllUsers);

// PATCH: Update user active/inactive status
router.patch("/:id/status",authMiddleware,adminMiddleware,updateUserStatus);

// GET SINGLE USER PROFILE
router.get("/:id", authMiddleware, adminMiddleware, getUserProfile);


module.exports = router;