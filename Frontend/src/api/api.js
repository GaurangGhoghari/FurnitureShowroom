
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

// ========== AUTH API ==========

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getCurrentUser = () => API.get("/auth/me");
export const logoutUser = () => API.post("/auth/logout");
export const updateUserProfile = (data) => API.put("/auth/profile", data);


// ========== USER PRODUCT API ==========

export const getProducts = (params = {}) =>
  API.get("/products", {
    params: { page: 1, limit: 8, ...params },
  });

export const getProductById = (id) => API.get(`/products/${id}`);
export const addProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

export const toggleProductStatus = (id) =>
  API.patch(`/products/${id}/active`, {});


// ========== CONTACT API ==========

export const submitContactForm = (data) => API.post("/contact", data);


// ========== ADMIN USER API ==========

export const getAdminUsers = (params = {}) =>
  API.get("/admin/users", { params });

export const updateAdminUserStatus = (id, status) =>
  API.patch(`/admin/users/${id}/status`, { status });

export const getAdminUserProfile = (id) =>
  API.get(`/admin/users/${id}`);


// ========== ADMIN PRODUCT API ==========

export const getAdminProducts = (
  page = 1,
  limit = 3,
  search = "",
  status = "all",
  sortBy = "name_asc",
  category = "all"
) =>
  API.get("/products/admin/all", {
    params: { page, limit, search, status, sortBy, category },
  });


// ========== CATEGORY API ==========

export const getCategories = (params = {}) =>
  API.get("/categories", { params });

export const addCategory = (data) => API.post("/categories", data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);

export const updateCategoryStatus = (id, is_active) =>
  API.patch(`/categories/${id}/status`, { is_active });

export const deleteCategory = (id) =>
  API.delete(`/categories/${id}`);


// ========== CART API ==========

export const getCart = () => API.get("/cart");

export const addToCart = (product_id, quantity = 1) =>
  API.post("/cart/add", { product_id, quantity });

export const updateCartItem = (id, quantity) =>
  API.put(`/cart/item/${id}`, { quantity });

export const removeCartItem = (id) =>
  API.delete(`/cart/item/${id}`);

export const getFeaturedProducts = () =>
  API.get("/products/featured");


// ========== PRODUCT REVIEW API ==========

export const getProductReviews = (productId) =>
  API.get(`/reviews/${productId}`);

export const addProductReview = (data) =>
  API.post("/reviews", data);

export const updateProductReview = (id, data) =>
  API.put(`/reviews/${id}`, data);

export const deleteProductReview = (id) =>
  API.delete(`/reviews/${id}`);


// ========== ORDER API ==========

// COD
export const placeOrder = async (data) => {
  const response = await API.post("/orders", data);
  return response.data;
};

// Local Demo Payment - Create Order
export const createDemoPaymentOrder = async (data) => {
  const response = await API.post("/orders/demo/create", data);
  return response.data;
};

// Local Demo Payment - Complete Order
export const completeDemoPayment = async (orderId, outcome) => {
  const response = await API.post("/orders/demo/complete", {
    orderId,
    outcome,
  });

  return response.data;
};

// My Orders
export const getMyOrders = async () => {
  const response = await API.get("/orders/my-orders");
  return response.data;
};

// Single Order
export const getOrderDetails = async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data;
};

// Order Tracking
export const getOrderTracking = async (id) => {
  const response = await API.get(`/orders/${id}/tracking`);
  return response.data;
};


// ========== ADMIN ORDER API ==========

export const getAllOrders = async () => {
  const response = await API.get("/orders/admin/all");
  return response.data;
};

export const updateOrderStatus = async (id, status, note = "") => {
  const response = await API.put(`/orders/admin/${id}/status`, {
    status,
    note,
  });

  return response.data;
};

export const getAdminOrderDetails = async (id) => {
  const response = await API.get(`/orders/admin/${id}`);
  return response.data;
};


// ========== FAVORITES API ==========

export const getFavorites = () => API.get("/favorites");

export const addFavorite = (productId) =>
  API.post(`/favorites/${productId}`);

export const removeFavorite = (productId) =>
  API.delete(`/favorites/${productId}`);

export default API;