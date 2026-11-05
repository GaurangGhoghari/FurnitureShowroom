const jwt = require("jsonwebtoken");
const db = require("../db/db");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found in cookies",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    db.query(
      "SELECT status FROM users WHERE id = ?",
      [decoded.id],
      (error, results) => {
        if (error) {
          console.error("Auth database error:", error);

          return res.status(500).json({
            success: false,
            message: "Authentication check failed",
          });
        }

        if (!results || results.length === 0) {
          return res.status(401).json({
            success: false,
            message: "User not found. Please login again.",
          });
        }

        if (results[0].status === "inactive") {
          return res.status(403).json({
            success: false,
            message: "Your account is inactive.",
          });
        }

        req.user = decoded;
        next();
      },
    );

  } catch (error) {
    console.error("JWT Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;