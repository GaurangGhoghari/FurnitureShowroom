const db = require("../db/db");

//GET USER CART 
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [cartRows] = await db.promise().query(
      "SELECT id FROM cart WHERE user_id = ?",
      [userId]
    );

    if (cartRows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }

    const cartId = cartRows[0].id;

    const [items] = await db.promise().query(
      `SELECT
          ci.id AS cart_item_id,
          ci.product_id,
          ci.quantity,
          p.name,
          p.price,
          p.image,
          p.stock
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       ORDER BY ci.id DESC`,
      [cartId]
    );

    const totalItems = items.reduce(
      (total, item) => total + Number(item.quantity),
      0
    );

    const totalAmount = items.reduce(
      (total, item) =>
        total + Number(item.price) * Number(item.quantity),
      0
    );

    return res.status(200).json({
      success: true,
      items,
      totalItems,
      totalAmount,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

//ADD PRODUCT TO CART 
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.body.product_id);
    const quantity = Number(req.body.quantity ?? 1);

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID and quantity are required",
      });
    }

    // Check product and available stock
    const [products] = await db.promise().query(
      "SELECT id, name, price, stock FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    // Find user's cart
    let [carts] = await db.promise().query(
      "SELECT id FROM cart WHERE user_id = ?",
      [userId]
    );

    let cartId;

    if (carts.length === 0) {
      const [cartResult] = await db.promise().query(
        "INSERT INTO cart (user_id) VALUES (?)",
        [userId]
      );

      cartId = cartResult.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Check whether product already exists in cart
    const [existingItems] = await db.promise().query(
      `SELECT id, quantity
       FROM cart_items
       WHERE cart_id = ? AND product_id = ?`,
      [cartId, productId]
    );

    const existingQuantity =
      existingItems.length > 0
        ? Number(existingItems[0].quantity)
        : 0;

    const newQuantity = existingQuantity + quantity;

    if (newQuantity > Number(product.stock)) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items are available in stock`,
      });
    }

    if (existingItems.length > 0) {
      await db.promise().query(
        "UPDATE cart_items SET quantity = ? WHERE id = ?",
        [newQuantity, existingItems[0].id]
      );
    } else {
      await db.promise().query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [cartId, productId, quantity]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

//UPDATE CART QUANTITY 
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = Number(req.params.id);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isInteger(cartItemId) ||
      cartItemId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid cart item ID and quantity are required",
      });
    }

    const [items] = await db.promise().query(
      `SELECT ci.id, p.stock
       FROM cart_items ci
       INNER JOIN cart c ON ci.cart_id = c.id
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [cartItemId, userId]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (quantity > Number(items[0].stock)) {
      return res.status(400).json({
        success: false,
        message: `Only ${items[0].stock} items are available in stock`,
      });
    }

    await db.promise().query(
      "UPDATE cart_items SET quantity = ? WHERE id = ?",
      [quantity, cartItemId]
    );

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
    });
  } catch (error) {
    console.error("Update Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart quantity",
    });
  }
};

//REMOVE CART ITEM
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = Number(req.params.id);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid cart item ID is required",
      });
    }

    const [result] = await db.promise().query(
      `DELETE ci
       FROM cart_items ci
       INNER JOIN cart c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [cartItemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};

module.exports = {getCart,addToCart,updateCartItem, removeCartItem,};