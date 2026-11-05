
const db = require("../db/db");

// GET ALL REVIEWS OF A PRODUCT
const getProductReviews = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    const [products] = await db.promise().query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [reviews] = await db.promise().query(
      `SELECT id, product_id, user_id, rating, review,
              created_at, updated_at
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY created_at DESC`,
      [productId]
    );

    const [summary] = await db.promise().query(
      `SELECT
         COUNT(*) AS totalReviews,
         COALESCE(AVG(rating), 0) AS averageRating
       FROM product_reviews
       WHERE product_id = ?`,
      [productId]
    );

    return res.status(200).json({
      success: true,
      reviews,
      totalReviews: Number(summary[0].totalReviews),
      averageRating: Number(summary[0].averageRating),
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// ADD PRODUCT REVIEW
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.body.product_id);
    const rating = Number(req.body.rating);
    const review = String(req.body.review || "").trim();

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Review is required",
      });
    }

    const [products] = await db.promise().query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await db.promise().query(
      `INSERT INTO product_reviews
       (product_id, user_id, rating, review)
       VALUES (?, ?, ?, ?)`,
      [productId, userId, rating, review]
    );

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    console.error("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

// UPDATE OWN REVIEW
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = Number(req.params.id);
    const rating = Number(req.body.rating);
    const review = String(req.body.review || "").trim();

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid review ID is required",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Review is required",
      });
    }

    const [result] = await db.promise().query(
      `UPDATE product_reviews
       SET rating = ?, review = ?
       WHERE id = ? AND user_id = ?`,
      [rating, review, reviewId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Update Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

// DELETE OWN REVIEW
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid review ID is required",
      });
    }

    const [result] = await db.promise().query(
      `DELETE FROM product_reviews
       WHERE id = ? AND user_id = ?`,
      [reviewId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
};