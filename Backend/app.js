
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Import Routes
const authRoutes = require("./src/routes/auth.route");
const adminUserRoutes = require("./src/routes/adminuser.route");
const cartRoutes = require("./src/routes/cart.route");
const categoryRoutes = require("./src/routes/category.routes");
const contactRoutes = require("./src/routes/contact.route");
const favoriteRoutes = require("./src/routes/favorite.route");
const orderRoutes = require("./src/routes/order.route");
const productRoutes = require("./src/routes/product.route");
const reviewRoutes = require("./src/routes/review.route");

const app = express();

// Allowed Frontend Origins
const allowedOrigins = [
  "https://furniture-showroom-bice.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const vercelRegex =
        /^https:\/\/furniture-showroom-[a-z0-9-]+-gaurangghoghari0401-8962s-projects\.vercel\.app$/;

      if (vercelRegex.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Legacy Local Uploads
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Furniture Showroom Backend is running!",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Backend Error:", err.message);

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;