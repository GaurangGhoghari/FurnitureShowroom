
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./src/routes/auth.route");
const productRoutes = require("./src/routes/product.route");
const contactRoutes = require("./src/routes/contact.route");
const adminUserRoutes = require("./src/routes/adminuser.route");
const categoryRoutes = require("./src/routes/category.routes");
const cartRoutes = require("./src/routes/cart.route");
const reviewRoutes = require("./src/routes/review.route");
const orderRoutes = require("./src/routes/order.route");
const favoriteRoutes = require("./src/routes/favorite.route");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
  /^https:\/\/furniture-showroom-[a-z0-9-]+-gaurangghoghari0401-8962s-projects\.vercel\.app$/,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const isAllowed =
        !origin ||
        allowedOrigins.some((allowed) =>
          allowed instanceof RegExp
            ? allowed.test(origin)
            : allowed === origin
        );

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);

// Local uploads support (Cloudinary use કરતા હો તો આ optional છે)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Furniture Showroom Backend is running!",
  });
});

module.exports = app;
