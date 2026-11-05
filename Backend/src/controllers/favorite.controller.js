
const db = require("../db/db");

// GET ALL FAVORITES
const getFavorites = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      p.*,
      f.created_at AS favorited_at
    FROM favorites f
    JOIN products p ON p.id = f.product_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Get Favorites Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch favorites",
      });
    }

    return res.status(200).json({
      success: true,
      favorites: results,
    });
  });
};

// ADD FAVORITE
const addFavorite = (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const sql = `
    INSERT IGNORE INTO favorites (user_id, product_id)
    VALUES (?, ?)
  `;

  db.query(sql, [userId, productId], (err, result) => {
    if (err) {
      console.error("Add Favorite Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to add favorite",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        result.affectedRows === 0
          ? "Product already in favorites"
          : "Product added to favorites",
    });
  });
};

// REMOVE FAVORITE
const removeFavorite = (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  const sql = `
    DELETE FROM favorites
    WHERE user_id = ? AND product_id = ?
  `;

  db.query(sql, [userId, productId], (err, result) => {
    if (err) {
      console.error("Remove Favorite Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to remove favorite",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        result.affectedRows > 0
          ? "Favorite removed successfully"
          : "Favorite not found",
    });
  });
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
