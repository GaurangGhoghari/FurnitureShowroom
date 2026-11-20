const db = require("../db/db");

// PLACE COD ORDER
const placeOrder = async (req, res) => {
  let connection;

  try {
    const userId = req.user.id;
    const { shipping_address, phone } = req.body;

    if (
      !shipping_address?.trim() ||
      !/^[0-9]{10}$/.test(String(phone || "").trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid shipping address and phone are required",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [carts] = await connection.query(
      "SELECT id FROM cart WHERE user_id = ? FOR UPDATE",
      [userId]
    );

    if (!carts.length) throw new Error("Your cart is empty");

    const cartId = carts[0].id;

    const [items] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price,
              p.image, p.stock, p.active
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       FOR UPDATE`,
      [cartId]
    );

    if (!items.length) throw new Error("Your cart is empty");

    let totalAmount = 0;

    for (const item of items) {
      if (Number(item.active) !== 1) {
        throw new Error(`${item.name} is unavailable`);
      }

      if (
        Number(item.quantity) <= 0 ||
        Number(item.quantity) > Number(item.stock)
      ) {
        throw new Error(`Only ${item.stock} units available for ${item.name}`);
      }

      totalAmount += Number(item.price) * Number(item.quantity);
    }

    totalAmount = Number(totalAmount.toFixed(2));

    const [result] = await connection.query(
      `INSERT INTO orders
       (user_id, total_amount, status, shipping_address, phone,
        payment_method, payment_status)
       VALUES (?, ?, 'Pending', ?, ?, 'COD', 'Pending')`,
      [
        userId,
        totalAmount,
        shipping_address.trim(),
        String(phone).trim(),
      ]
    );

    const orderId = result.insertId;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      await connection.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, product_image,
          quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.name,
          item.image,
          quantity,
          price,
          Number((price * quantity).toFixed(2)),
        ]
      );

      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [quantity, item.product_id]
      );
    }

    await connection.query(
      `INSERT INTO order_status_history
       (order_id, status, note, changed_by)
       VALUES (?, 'Pending', 'COD order placed successfully', ?)`,
      [orderId, userId]
    );

    await connection.query(
      "DELETE FROM cart_items WHERE cart_id = ?",
      [cartId]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      orderId,
      totalAmount,
      status: "Pending",
      paymentMethod: "COD",
      paymentStatus: "Pending",
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Place COD Order Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to place COD order",
    });
  } finally {
    if (connection) connection.release();
  }
};


// ==========================================
// CREATE CARD / ONLINE DEMO PAYMENT ORDER
// ==========================================
const createDemoPaymentOrder = async (req, res) => {
  let connection;

  try {
    const userId = req.user.id;
    const { shipping_address, phone, payment_method } = req.body;

    if (!["Card", "Online"].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid payment method",
      });
    }

    if (
      !shipping_address?.trim() ||
      !/^[0-9]{10}$/.test(String(phone || "").trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid shipping address and phone are required",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [carts] = await connection.query(
      "SELECT id FROM cart WHERE user_id = ? FOR UPDATE",
      [userId]
    );

    if (!carts.length) throw new Error("Your cart is empty");

    const cartId = carts[0].id;

    const [items] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price,
              p.image, p.stock, p.active
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       FOR UPDATE`,
      [cartId]
    );

    if (!items.length) throw new Error("Your cart is empty");

    let totalAmount = 0;

    for (const item of items) {
      if (Number(item.active) !== 1) {
        throw new Error(`${item.name} is unavailable`);
      }

      if (
        Number(item.quantity) <= 0 ||
        Number(item.quantity) > Number(item.stock)
      ) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }

      totalAmount += Number(item.price) * Number(item.quantity);
    }

    totalAmount = Number(totalAmount.toFixed(2));

    const [result] = await connection.query(
      `INSERT INTO orders
       (user_id, total_amount, status, shipping_address, phone,
        payment_method, payment_status)
       VALUES (?, ?, 'Pending', ?, ?, ?, 'Pending')`,
      [
        userId,
        totalAmount,
        shipping_address.trim(),
        String(phone).trim(),
        payment_method,
      ]
    );

    const orderId = result.insertId;

    for (const item of items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);

      await connection.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, product_image,
          quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.name,
          item.image,
          quantity,
          price,
          Number((price * quantity).toFixed(2)),
        ]
      );
    }

    await connection.query(
      `INSERT INTO order_status_history
       (order_id, status, note, changed_by)
       VALUES (?, 'Pending', ?, ?)`,
      [
        orderId,
        `${payment_method} demo payment initiated`,
        userId,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Demo payment order created",
      orderId,
      totalAmount,
      paymentMethod: payment_method,
      paymentStatus: "Pending",
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Create Demo Order Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create demo order",
    });
  } finally {
    if (connection) connection.release();
  }
};


// ==========================================
// COMPLETE CARD / ONLINE DEMO PAYMENT
// ==========================================
const completeDemoPayment = async (req, res) => {
  let connection;

  try {
    const userId = req.user.id;
    const { orderId, outcome } = req.body;

    if (
      !orderId ||
      !Number.isInteger(Number(orderId)) ||
      !["success", "failure"].includes(outcome)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo payment request",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [orders] = await connection.query(
      `SELECT id, user_id, total_amount, status,
              payment_method, payment_status
       FROM orders
       WHERE id = ? AND user_id = ?
       FOR UPDATE`,
      [Number(orderId), userId]
    );

    if (!orders.length) {
      throw new Error("Order not found");
    }

    const order = orders[0];

    // Only Card and Online demo payments are allowed
    if (!["Card", "Online"].includes(order.payment_method)) {
      throw new Error("Invalid demo payment method");
    }

    // ALREADY PAID: RETURN SUCCESS WITHOUT DEDUCTING STOCK AGAIN
    if (order.payment_status === "Paid") {
      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Demo payment successful",
        orderId: order.id,
        paymentStatus: "Paid",
        orderStatus: order.status,
        paymentMethod: order.payment_method,
      });
    }

    // PREVENT PROCESSING FAILED OR CANCELLED ORDERS AGAIN
    if (
      order.payment_status !== "Pending" ||
      order.status !== "Pending"
    ) {
      throw new Error("This demo payment cannot be processed");
    }

    // DEMO PAYMENT FAILURE
    if (outcome === "failure") {
      await connection.query(
        `UPDATE orders
         SET payment_status = 'Failed',
             status = 'Cancelled'
         WHERE id = ?`,
        [orderId]
      );

      await connection.query(
        `INSERT INTO order_status_history
         (order_id, status, note, changed_by)
         VALUES (?, 'Cancelled', ?, ?)`,
        [
          orderId,
          `${order.payment_method} demo payment failed`,
          userId,
        ]
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        paymentStatus: "Failed",
        orderStatus: "Cancelled",
        message: "Demo payment failed",
        orderId,
      });
    }

    // GET ORDER ITEMS
    const [items] = await connection.query(
      `SELECT product_id, quantity
       FROM order_items
       WHERE order_id = ?`,
      [orderId]
    );

    if (!items.length) {
      throw new Error("Order items not found");
    }

    // VERIFY STOCK
    for (const item of items) {
      const [products] = await connection.query(
        `SELECT stock, active
         FROM products
         WHERE id = ?
         FOR UPDATE`,
        [item.product_id]
      );

      if (
        !products.length ||
        Number(products[0].active) !== 1 ||
        Number(products[0].stock) < Number(item.quantity)
      ) {
        throw new Error("Product stock is no longer available");
      }
    }

    // DEDUCT STOCK ONLY ON FIRST SUCCESSFUL PAYMENT
    for (const item of items) {
      await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // UPDATE ORDER AND PAYMENT STATUS
    await connection.query(
      `UPDATE orders
       SET payment_status = 'Paid',
           status = 'Confirmed'
       WHERE id = ?`,
      [orderId]
    );

    // ADD ORDER HISTORY
    await connection.query(
      `INSERT INTO order_status_history
       (order_id, status, note, changed_by)
       VALUES (?, 'Confirmed', ?, ?)`,
      [
        orderId,
        `${order.payment_method} demo payment successful`,
        userId,
      ]
    );

    // CLEAR PURCHASED PRODUCTS FROM CART
    const [carts] = await connection.query(
      "SELECT id FROM cart WHERE user_id = ? FOR UPDATE",
      [userId]
    );

    if (carts.length) {
      const productIds = items.map((item) => item.product_id);
      const placeholders = productIds.map(() => "?").join(",");

      await connection.query(
        `DELETE FROM cart_items
         WHERE cart_id = ?
         AND product_id IN (${placeholders})`,
        [carts[0].id, ...productIds]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      paymentStatus: "Paid",
      orderStatus: "Confirmed",
      paymentMethod: order.payment_method,
      message: `${order.payment_method} demo payment successful`,
      orderId,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Complete Demo Payment Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Demo payment failed",
    });
  } finally {
    if (connection) connection.release();
  }
};


// ==========================================
// GET LOGGED-IN USER ORDERS
// ==========================================
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.promise().query(
      `SELECT
         o.id, o.total_amount, o.status, o.shipping_address,
         o.phone, o.payment_method, o.payment_status,
         o.created_at, o.updated_at,
         COUNT(oi.id) AS total_products
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};


// ==========================================
// GET SINGLE ORDER DETAILS
// ==========================================
const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const [orders] = await db.promise().query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ?",
      [orderId, userId]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const [items] = await db.promise().query(
      `SELECT id, product_id, product_name, product_image,
              quantity, price, subtotal
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [orderId]
    );

    return res.status(200).json({
      success: true,
      order: { ...orders[0], items },
    });
  } catch (error) {
    console.error("Get Order Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};


// ==========================================
// GET ORDER TRACKING
// ==========================================
const getOrderTracking = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const [orders] = await db.promise().query(
      `SELECT id, status, created_at, updated_at
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const [history] = await db.promise().query(
      `SELECT status, note, changed_at
       FROM order_status_history
       WHERE order_id = ?
       ORDER BY changed_at ASC, id ASC`,
      [orderId]
    );

    return res.status(200).json({
      success: true,
      order: orders[0],
      tracking: history,
    });
  } catch (error) {
    console.error("Get Order Tracking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order tracking",
    });
  }
};


// ==========================================
// ADMIN: GET ALL ORDERS
// ==========================================
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.promise().query(
      `SELECT
         o.id, o.user_id, o.total_amount, o.status,
         o.shipping_address, o.phone, o.payment_method,
         o.payment_status, o.created_at, o.updated_at,
         COUNT(oi.id) AS total_products
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Admin Get All Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch all orders",
    });
  }
};


// ==========================================
// ADMIN: UPDATE ORDER STATUS
// ==========================================
const updateOrderStatus = async (req, res) => {
  let connection;

  try {
    const adminId = req.user.id;
    const orderId = req.params.id;
    const { status, note } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [orders] = await connection.query(
      "SELECT id, status FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );

    if (!orders.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldStatus = orders[0].status;

    if (oldStatus === status) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Order already has this status",
      });
    }

    await connection.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    );

    await connection.query(
      `INSERT INTO order_status_history
       (order_id, status, note, changed_by)
       VALUES (?, ?, ?, ?)`,
      [
        orderId,
        status,
        note?.trim() ||
          `Order status changed from ${oldStatus} to ${status}`,
        adminId,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      status,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Admin Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  } finally {
    if (connection) connection.release();
  }
};


// ==========================================
// ADMIN: GET SINGLE ORDER DETAILS
// ==========================================
const getAdminOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    const [orders] = await db.promise().query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const [items] = await db.promise().query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId]
    );

    return res.status(200).json({
      success: true,
      order: { ...orders[0], items },
    });
  } catch (error) {
    console.error("Admin Order Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  placeOrder,
  createDemoPaymentOrder,
  completeDemoPayment,
  getMyOrders,
  getOrderDetails,
  getOrderTracking,
  getAllOrders,
  updateOrderStatus,
  getAdminOrderDetails,
};
