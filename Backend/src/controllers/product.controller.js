const db = require("../db/db");
const fs = require("fs");
const path = require("path");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

// Convert uploaded file into image URL
const getImageUrl = (file) => {
  if (!file) return null;
  return `${SERVER_URL}/uploads/${file.filename}`;
};

// Parse images stored in MySQL
const parseImages = (images) => {
  if (!images) return [];

  if (Array.isArray(images)) return images;

  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

// Get all uploaded files from request
const getUploadedFiles = (files = {}) => {
  return Object.values(files).flat();
};

// Delete uploaded files if request fails
const cleanupUploadedFiles = (files = []) => {
  files.forEach((file) => {
    const filePath = path.join(__dirname, "../../uploads", file.filename);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Uploaded File Cleanup Error:", error.message);
    }
  });
};

// Delete an image from uploads folder
const removeImageFile = (imageUrl) => {
  if (!imageUrl) return;

  try {
    const parsedUrl = new URL(imageUrl, SERVER_URL);

    // Only delete files from our uploads directory
    if (parsedUrl.origin !== new URL(SERVER_URL).origin) return;
    if (!parsedUrl.pathname.startsWith("/uploads/")) return;

    const filename = path.posix.basename(parsedUrl.pathname);

    if (!filename || filename === "." || filename === "..") return;

    const uploadsDirectory = path.resolve(__dirname, "../../uploads");
    const imagePath = path.resolve(uploadsDirectory, filename);

    // Prevent deleting files outside uploads folder
    if (!imagePath.startsWith(uploadsDirectory + path.sep)) return;

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error("Image Delete Error:", error.message);
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock, is_featured } =
      req.body;

    const featuredValue =
      is_featured === true ||
      is_featured === 1 ||
      is_featured === "1" ||
      is_featured === "true"
        ? 1
        : 0;

    const uploadedFiles = getUploadedFiles(req.files);
    const mainImageFile = req.files?.image?.[0];
    const additionalFiles = req.files?.images || [];

    if (!mainImageFile) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Please upload one main product image",
      });
    }

    if (additionalFiles.length < 1) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Please upload at least one additional image",
      });
    }

    if (additionalFiles.length > 10) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Maximum 10 additional images are allowed",
      });
    }

    if (!name?.trim() || price === undefined || price === "") {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Product name and price are required",
      });
    }

    const numericPrice = Number(price);
    const numericStock = stock === undefined || stock === "" ? 0 : Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      cleanupUploadedFiles(uploadedFiles);
      return res.status(400).json({
        message: "Please enter a valid price",
      });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      cleanupUploadedFiles(uploadedFiles);
      return res.status(400).json({
        message: "Stock must be a non-negative whole number",
      });
    }

    const image = getImageUrl(mainImageFile);
    const images = additionalFiles.map((file) => getImageUrl(file));

    const sql = `
      INSERT INTO products
      (name, category, description, price, image, images, stock, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().query(sql, [
      name.trim(),
      category?.trim() || null,
      description || null,
      numericPrice,
      image,
      JSON.stringify(images),
      numericStock,
      featuredValue,
    ]);

    return res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId,
      image,
      images,
    });
  } catch (error) {
    cleanupUploadedFiles(getUploadedFiles(req.files));

    console.error("Create Product Error:", error);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};

// GET ALL ACTIVE PRODUCTS WITH FILTERS + SEARCH + SORT + PAGINATION
const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const allowedLimits = [4, 8, 12, 20];
    const requestedLimit = parseInt(req.query.limit, 10) || 4;
    const limit = allowedLimits.includes(requestedLimit)
      ? requestedLimit
      : 4;

    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const availability = String(req.query.availability || "all").trim();

    const minPrice =
      req.query.minPrice !== undefined && req.query.minPrice !== ""
        ? Number(req.query.minPrice)
        : null;

    const maxPrice =
      req.query.maxPrice !== undefined && req.query.maxPrice !== ""
        ? Number(req.query.maxPrice)
        : null;

    const sortOptions = {
      featured: "id DESC",
      "price-low": "price ASC",
      "price-high": "price DESC",
      name: "name ASC",
    };

    const sortBy = String(req.query.sortBy || "featured");
    const orderBy = sortOptions[sortBy] || sortOptions.featured;

    if (
      (minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) ||
      (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0))
    ) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return res.status(400).json({
        message: "Minimum price cannot exceed maximum price",
      });
    }

    if (!["all", "in-stock", "out-of-stock"].includes(availability)) {
      return res.status(400).json({
        message: "Invalid availability filter",
      });
    }

    const conditions = ["active = 1"];
    const queryParams = [];

    if (search) {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category && category.toLowerCase() !== "all") {
      conditions.push("category = ?");
      queryParams.push(category);
    }

    if (minPrice !== null) {
      conditions.push("price >= ?");
      queryParams.push(minPrice);
    }

    if (maxPrice !== null) {
      conditions.push("price <= ?");
      queryParams.push(maxPrice);
    }

    if (availability === "in-stock") {
      conditions.push("stock > 0");
    } else if (availability === "out-of-stock") {
      conditions.push("stock <= 0");
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;
    const offset = (page - 1) * limit;

    const [countResult] = await db.promise().query(
      `SELECT COUNT(*) AS totalProducts
       FROM products
       ${whereClause}`,
      queryParams,
    );

    const totalProducts = Number(countResult[0].totalProducts);
    const totalPages = Math.ceil(totalProducts / limit);

    const [products] = await db.promise().query(
      `SELECT *
       FROM products
       ${whereClause}
       ORDER BY ${orderBy}, id DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    return res.status(200).json({
      message: "Active Products fetched successfully",
      products,
      pagination: {
        currentPage: page,
        limit,
        totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get Active Products Error:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

// ADMIN: GET ALL PRODUCTS WITH SEARCH + CATEGORY + STATUS + PAGINATION
const getAllProductsAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const allowedLimits = [3, 5, 10, 20];
    const requestedLimit = parseInt(req.query.limit, 10) || 3;
    const limit = allowedLimits.includes(requestedLimit)
      ? requestedLimit
      : 3;

    const search = (req.query.search || "").trim();
    const status = req.query.status || "all";
    const category = (req.query.category || "").trim();

    const sortOptions = {
      name_asc: "name ASC",
      name_desc: "name DESC",
      price_asc: "price ASC",
      price_desc: "price DESC",
      stock_asc: "stock ASC",
      stock_desc: "stock DESC",
    };

    const sortBy = String(req.query.sortBy || "name_asc");
    const orderBy = sortOptions[sortBy] || sortOptions.name_asc;

    const offset = (page - 1) * limit;
    const conditions = [];
    const queryParams = [];

    if (search) {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category && category.toLowerCase() !== "all") {
      conditions.push("category = ?");
      queryParams.push(category);
    }

    if (status === "active") {
      conditions.push("active = 1");
    } else if (status === "inactive") {
      conditions.push("active = 0");
    } else if (status !== "all") {
      return res.status(400).json({
        message: "Invalid product status",
      });
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [countResult] = await db.promise().query(
      `SELECT COUNT(*) AS totalProducts
       FROM products
       ${whereClause}`,
      queryParams,
    );

    const totalProducts = Number(countResult[0].totalProducts);
    const totalPages = Math.ceil(totalProducts / limit);

    const [products] = await db.promise().query(
      `SELECT *
       FROM products
       ${whereClause}
       ORDER BY ${orderBy}, id ASC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    );

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
      pagination: {
        currentPage: page,
        limit,
        totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get Admin Products Error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin products",
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  const uploadedFiles = getUploadedFiles(req.files);

  try {
    const { id } = req.params;
    const { name, category, description, price, stock, is_featured } =
      req.body;

    if (!name?.trim() || price === undefined || price === "") {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Product name and price are required",
      });
    }

    const numericPrice = Number(price);
    const numericStock = stock === undefined || stock === "" ? 0 : Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      cleanupUploadedFiles(uploadedFiles);
      return res.status(400).json({
        message: "Please enter a valid price",
      });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      cleanupUploadedFiles(uploadedFiles);
      return res.status(400).json({
        message: "Stock must be a non-negative whole number",
      });
    }

    const featuredValue =
      is_featured === true ||
      is_featured === 1 ||
      is_featured === "1" ||
      is_featured === "true"
        ? 1
        : 0;

    const [existingProducts] = await db
      .promise()
      .query("SELECT image, images FROM products WHERE id = ?", [id]);

    if (existingProducts.length === 0) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(404).json({
        message: "Product not found",
      });
    }

    const existingProduct = existingProducts[0];

    const newMainFile = req.files?.image?.[0];

    const image = newMainFile
      ? getImageUrl(newMainFile)
      : existingProduct.image;

    const oldImages = parseImages(existingProduct.images);

    let requestedRemovedImages = [];

    try {
      if (req.body.removedImages) {
        requestedRemovedImages = JSON.parse(req.body.removedImages);
      }
    } catch (error) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Invalid removed images data",
      });
    }

    if (!Array.isArray(requestedRemovedImages)) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Invalid removed images data",
      });
    }

    // Only accept URLs that actually belong to this product
    const validRemovedImages = [
      ...new Set(
        requestedRemovedImages.filter(
          (url) => typeof url === "string" && oldImages.includes(url),
        ),
      ),
    ];

    // Keep old images that were not selected for deletion
    const remainingImages = oldImages.filter(
      (url) => !validRemovedImages.includes(url),
    );

    // Add newly uploaded additional images
    const newAdditionalFiles = req.files?.images || [];
    const newImages = newAdditionalFiles.map((file) => getImageUrl(file));

    const images = [...remainingImages, ...newImages];

    if (!image) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Please upload one main product image",
      });
    }

    if (images.length < 1) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Please keep or upload at least one additional image",
      });
    }

    if (images.length > 10) {
      cleanupUploadedFiles(uploadedFiles);

      return res.status(400).json({
        message: "Maximum 10 additional images are allowed",
      });
    }

    const sql = `
      UPDATE products
      SET
        name = ?,
        category = ?,
        description = ?,
        price = ?,
        image = ?,
        images = ?,
        stock = ?,
        is_featured = ?
      WHERE id = ?
    `;

    await db.promise().query(sql, [
      name.trim(),
      category?.trim() || null,
      description || null,
      numericPrice,
      image,
      JSON.stringify(images),
      numericStock,
      featuredValue,
      id,
    ]);

    // Remove old main image only after successful DB update
    if (newMainFile && existingProduct.image) {
      removeImageFile(existingProduct.image);
    }

    // Remove only the additional images selected by the admin
    validRemovedImages.forEach((imageUrl) => {
      removeImageFile(imageUrl);
    });

    return res.status(200).json({
      message: "Product updated successfully",
      image,
      images,
    });
  } catch (error) {
    cleanupUploadedFiles(uploadedFiles);

    console.error("Update Product Error:", error);

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db
      .promise()
      .query("SELECT image, images FROM products WHERE id = ?", [id]);

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = products[0];

    await db.promise().query("DELETE FROM products WHERE id = ?", [id]);

    removeImageFile(product.image);

    const additionalImages = parseImages(product.images);

    additionalImages.forEach((imageUrl) => {
      removeImageFile(imageUrl);
    });

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

// ACTIVATE / DEACTIVATE PRODUCT
const toggleProductActive = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db
      .promise()
      .query("SELECT active FROM products WHERE id = ?", [id]);

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const currentActive = Number(products[0].active);
    const newActive = currentActive === 1 ? 0 : 1;

    await db
      .promise()
      .query("UPDATE products SET active = ? WHERE id = ?", [newActive, id]);

    return res.status(200).json({
      message:
        newActive === 1
          ? "Product activated successfully"
          : "Product deactivated successfully",
      active: newActive,
    });
  } catch (error) {
    console.error("Toggle Product Active Error:", error);

    return res.status(500).json({
      message: "Failed to change product status",
    });
  }
};

// GET SINGLE PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.promise().query(
      `SELECT *
       FROM products
       WHERE id = ? AND active = 1
       LIMIT 1`,
      [id],
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product: products[0],
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// GET FEATURED PRODUCTS
const getFeaturedProducts = async (req, res) => {
  try {
    const [products] = await db.promise().query(
      `SELECT *
       FROM products
       WHERE active = 1
         AND is_featured = 1
       ORDER BY created_at DESC, id DESC
       LIMIT 12`,
    );

    return res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      products,
      totalProducts: products.length,
    });
  } catch (error) {
    console.error("Get Featured Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  getFeaturedProducts,
  getProductById,
};