
const db = require("../db/db");

// GET CATEGORIES: SEARCH + STATUS FILTER + PAGINATION
const getCategories = async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status = req.query.status || "all";

    // Validate page and limit
    const pageValue = Number(req.query.page ?? 1);
    const limitValue = Number(req.query.limit ?? 5);

    if (
      !Number.isSafeInteger(pageValue) ||
      pageValue < 1 ||
      !Number.isSafeInteger(limitValue) ||
      limitValue < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers",
      });
    }

    // Prevent excessively large requests
    const page = pageValue;
    const limit = Math.min(limitValue, 100);
    const offset = (page - 1) * limit;

    if (!Number.isSafeInteger(offset)) {
      return res.status(400).json({
        success: false,
        message: "Requested page is too large",
      });
    }

    if (!["all", "active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be all, active, or inactive",
      });
    }

    // Build WHERE conditions once for both queries
    const conditions = ["category LIKE ?"];
    const params = [`%${search}%`];

    if (status === "active") {
      conditions.push("is_active = TRUE");
    } else if (status === "inactive") {
      conditions.push("is_active = FALSE");
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total matching categories BEFORE pagination
    const [countRows] = await db.promise().query(
      `SELECT COUNT(*) AS total
       FROM categories
       ${whereClause}`,
      params
    );

    const totalCategories = Number(countRows[0].total);
    const totalPages = Math.ceil(totalCategories / limit);

    // If the requested page is beyond the last page, return empty data
    const [categories] = await db.promise().query(
      `SELECT id, category, is_active, created_at, updated_at
       FROM categories
       ${whereClause}
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      categories,
      pagination: {
        currentPage: page,
        limit,
        totalCategories,
        totalPages,
      },
      filters: {
        search,
        status,
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ADD CATEGORY
const addCategory = async (req, res) => {
  try {
    const { category, is_active = true } = req.body;

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const name = category.trim();

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot exceed 100 characters",
      });
    }

    if (!/^[\p{L}\p{N} &-]+$/u.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Special characters are not allowed",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be true or false",
      });
    }

    const [existing] = await db.promise().query(
      "SELECT id FROM categories WHERE LOWER(category) = LOWER(?)",
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const [result] = await db.promise().query(
      "INSERT INTO categories (category, is_active) VALUES (?, ?)",
      [name, is_active]
    );

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Add category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add category",
    });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, is_active } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const name = category.trim();

    if (name.length > 100 || !/^[\p{L}\p{N} &-]+$/u.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category name",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be true or false",
      });
    }

    const [existing] = await db.promise().query(
      `SELECT id
       FROM categories
       WHERE LOWER(category) = LOWER(?) AND id != ?`,
      [name, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const [result] = await db.promise().query(
      `UPDATE categories
       SET category = ?, is_active = ?
       WHERE id = ?`,
      [name, is_active, id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.promise().query(
        "SELECT id FROM categories WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const [products] = await db.promise().query(
      "SELECT id FROM products WHERE category_id = ? LIMIT 1",
      [id]
    );

    if (products.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This category is used by products. Deactivate it instead.",
      });
    }

    const [result] = await db.promise().query(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

// CHANGE ACTIVE / INACTIVE STATUS
const updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be true or false",
      });
    }

    const [result] = await db.promise().query(
      "UPDATE categories SET is_active = ? WHERE id = ?",
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.promise().query(
        "SELECT id FROM categories WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Category status updated successfully",
    });
  } catch (error) {
    console.error("Update category status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};

module.exports = {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
};
