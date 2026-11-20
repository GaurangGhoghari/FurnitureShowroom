
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  placeOrder,
  createDemoPaymentOrder,
  completeDemoPayment,
  getMyOrders,
  getOrderDetails,
  getOrderTracking,
  getAllOrders,
  updateOrderStatus,
  getAdminOrderDetails,
} = require("../controllers/order.controller");

// ==========================================
// CUSTOMER ROUTES
// ==========================================

// COD Order
router.post("/", authMiddleware, placeOrder);

// Local Demo Payment
router.post(
  "/demo/create",
  authMiddleware,
  createDemoPaymentOrder
);

router.post(
  "/demo/complete",
  authMiddleware,
  completeDemoPayment
);

// My Orders
router.get("/my-orders", authMiddleware, getMyOrders);

// Order Tracking
router.get(
  "/:id/tracking",
  authMiddleware,
  getOrderTracking
);

// Order Details
router.get("/:id", authMiddleware, getOrderDetails);


// ==========================================
// ADMIN ROUTES
// ==========================================

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getAdminOrderDetails
);

module.exports = router;