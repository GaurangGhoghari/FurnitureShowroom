const express = require("express");

const {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  getFeaturedProducts,
  getProductById,
} = require("../controllers/product.controller");

const upload = require("../middleware/upload.middleware");

const router = express.Router();

const productImageUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

router.post("/", productImageUpload, createProduct);

router.get("/", getAllProducts);

router.get("/featured", getFeaturedProducts);

router.get("/admin/all", getAllProductsAdmin);

router.put("/:id", productImageUpload, updateProduct);

router.delete("/:id", deleteProduct);

router.patch("/:id/active", toggleProductActive);

router.get("/:id", getProductById);

module.exports = router;