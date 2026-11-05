const db = require("../db/db");

// ADMIN ROLE VERIFICATION
const adminMiddleware = (req, res, next) => {

    // console.log("Authenticated user:", req.user);

  // 1. Check authenticated user
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // 2. Verify role from MySQL database
  const sql = "SELECT role FROM users WHERE id = ?";

  db.query(sql, [req.user.id], (error, results) => {
    if (error) {
      console.error("Admin Verification Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to verify admin permissions",
      });
    }

    // 3. Check whether user exists
    if (!results || results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Allow only admin
    if (results[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin permission required.",
      });
    }

    // 5. Save verified role and continue
    req.user.role = results[0].role;
    next();
  });
};

module.exports = adminMiddleware;