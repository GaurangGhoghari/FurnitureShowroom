const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./src/routes/auth.route");
const productRoutes = require("./src/routes/product.route");
const contactRoutes = require("./src/routes/contact.route");
const adminUserRoutes = require("./src/routes/adminuser.route");
const categoryRoutes = require("./src/routes/category.routes");
const cartRoutes = require("./src/routes/cart.route");
const reviewRoutes = require("./src/routes/review.route");
const orderRoutes = require("./src/routes/order.route");
const favoriteRoutes = require("./src/routes/favorite.route");
const path = require("path");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  /^https:\/\/furniture-showroom-[a-z0-9-]+-gaurangghoghari0401-8962s-projects\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.some((allowed) =>
          allowed instanceof RegExp ? allowed.test(origin) : allowed === origin,
        )
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Furniture Showroom Backend is running!",
  });
});

module.exports = app;
