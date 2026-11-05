import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Get categories with search and server-side pagination
export const getCategories = (params = {}) => {
  return API.get("/categories", { params });
};

// Add a new category
export const addCategory = (data) => {
  return API.post("/categories", data);
};

// Update category name and status
export const updateCategory = (id, data) => {
  return API.put(`/categories/${id}`, data);
};

// Update category status only
export const updateCategoryStatus = (id, is_active) => {
  return API.patch(`/categories/${id}/status`, { is_active });
};

// Delete category
export const deleteCategory = (id) => {
  return API.delete(`/categories/${id}`);
};