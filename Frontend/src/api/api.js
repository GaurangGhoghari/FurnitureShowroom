import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ======== AUTH API ==========
export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const getCurrentUser = () => {
  return API.get("/auth/me");
};

export const logoutUser = () => {
  return API.post("/auth/logout");
};

export const updateUserProfile = (data) => {
  return API.put("/auth/profile", data);
};

// ========= USER PRODUCT API ==========

export const getProducts = (params = {}) => {
  return API.get("/products", {
    params: {
      page: 1,
      limit: 8,
      ...params,
    },
  });
};

export const getProductById = (id) => {
  return API.get(`/products/${id}`);
};

export const addProduct = (data) => {
  return API.post("/products", data);
};

export const updateProduct = (id, data) => {
  return API.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return API.delete(`/products/${id}`);
};

export const toggleProductStatus = (id) => {
  return API.patch(`/products/${id}/active`, {});
};

// ========= CONTACT API ==========

export const submitContactForm = (data) => {
  return API.post("/contact", data);
};

// ========== ADMIN USER API ==========

export const getAdminUsers = (params = {}) => {
  return API.get("/admin/users", { params });
};

export const updateAdminUserStatus = (id, status) => {
  return API.patch(`/admin/users/${id}/status`, { status });
};

// GET SINGLE USER PROFILE (ADMIN)
export const getAdminUserProfile = (id) => {
  return API.get(`/admin/users/${id}`);
};

// ========== ADMIN PRODUCT API ============

export const getAdminProducts = (
  page = 1,
  limit = 3,
  search = "",
  status = "all",
  sortBy = "name_asc",
  category = "all"
) => {
  return API.get("/products/admin/all", {
    params: {
      page,
      limit,
      search,
      status,
      sortBy,
      category,
    },
  });
};

// ========== CATEGORY API ==========

export const getCategories = (params = {}) => {
  return API.get("/categories", { params });
};

export const addCategory = (data) => {
  return API.post("/categories", data);
};

export const updateCategory = (id, data) => {
  return API.put(`/categories/${id}`, data);
};

export const updateCategoryStatus = (id, is_active) => {
  return API.patch(`/categories/${id}/status`, { is_active });
};

export const deleteCategory = (id) => {
  return API.delete(`/categories/${id}`);
};

// ============ CART API ===========

export const getCart = () => {
  return API.get("/cart");
};

export const addToCart = (product_id, quantity = 1) => {
  return API.post("/cart/add", {
    product_id,
    quantity,
  });
};

export const updateCartItem = (id, quantity) => {
  return API.put(`/cart/item/${id}`, {
    quantity,
  });
};

export const removeCartItem = (id) => {
  return API.delete(`/cart/item/${id}`);
};

export const getFeaturedProducts = () => API.get("/products/featured");

// ======== PRODUCT REVIEW API =========

export const getProductReviews = (productId) => {
  return API.get(`/reviews/${productId}`);
};

export const addProductReview = (data) => {
  return API.post("/reviews", data);
};

export const updateProductReview = (id, data) => {
  return API.put(`/reviews/${id}`, data);
};

export const deleteProductReview = (id) => {
  return API.delete(`/reviews/${id}`);
};

// ================= ORDER APIs =================

export const placeOrder = async (data) => {
  const response = await API.post("/orders", data);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await API.get("/orders/my-orders");
  return response.data;
};

export const getOrderDetails = async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data;
};

export const getOrderTracking = async (id) => {
  const response = await API.get(`/orders/${id}/tracking`);
  return response.data;
};

// ADMIN ORDERS API

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

//====== FAVORITES API =====
export const getFavorites = () => {
  return API.get("/favorites");
};

export const addFavorite = (productId) => {
  return API.post(`/favorites/${productId}`);
};

export const removeFavorite = (productId) => {
  return API.delete(`/favorites/${productId}`);
};

export default API;
