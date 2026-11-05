
const express = require("express");
const router = express.Router();

const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
} = require("../controllers/category.controller");

// GET categories with search, status filter and pagination
router.get("/", getCategories);

// ADD category
router.post("/", addCategory);

// UPDATE category
router.put("/:id", updateCategory);

// CHANGE active/inactive status
router.patch("/:id/status", updateCategoryStatus);

// DELETE category
router.delete("/:id", deleteCategory);

module.exports = router;