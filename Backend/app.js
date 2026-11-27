
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
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

// Basic HTTP Security
app.disable("x-powered-by");
app.use(helmet());

// General API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Authentication Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

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

// Request Body Limits
app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
    parameterLimit: 100,
  })
);

app.use(cookieParser());

// Legacy Local Uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "src", "uploads"))
);

// Direct Browser Navigation Redirect for Product APIs
app.use("/api/products", (req, res, next) => {
  const acceptHeader = req.get("accept") || "";

  const isBrowserNavigation =
    req.method === "GET" &&
    (
      (
        req.get("sec-fetch-mode") === "navigate" &&
        req.get("sec-fetch-dest") === "document"
      ) ||
      acceptHeader.includes("text/html")
    );

  if (isBrowserNavigation) {
    return res.redirect(
      302,
      "https://furniture-showroom-bice.vercel.app/product"
    );
  }

  next();
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
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

// Global Error Handler
app.use((err, req, res, next) => {
  if (
    err.message &&
    err.message.startsWith("Not allowed by CORS")
  ) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  console.error("Backend Error:", err.message);

  const status =
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status < 500
      ? err.status
      : 500;

  return res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Internal Server Error"
        : err.message,
  });
});

module.exports = app;
