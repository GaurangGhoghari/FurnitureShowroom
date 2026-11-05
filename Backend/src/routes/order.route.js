const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  placeOrder,
  getMyOrders,
  getOrderDetails,
  getOrderTracking,
  getAllOrders,
  updateOrderStatus,
  getAdminOrderDetails,
} = require("../controllers/order.controller");

// CUSTOMER ROUTES
// Place New Order
router.post("/", authMiddleware, placeOrder);

// Get Logged-in User Orders
router.get("/my-orders", authMiddleware, getMyOrders);

// Get Order Tracking
router.get("/:id/tracking", authMiddleware, getOrderTracking);

// Get Order Details
router.get("/:id", authMiddleware, getOrderDetails);

// ADMIN ROUTES
// Get All Orders
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

// Update Order Status
router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

// Get Single Order Details (Admin)
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getAdminOrderDetails
);

module.exports = router;