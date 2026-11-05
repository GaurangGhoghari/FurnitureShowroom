
import React, { useState, useEffect, useCallback } from "react";
import {
  showSuccess,
  showError,
} from "../../component/Common/Toast";

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";

import DebouncedSearch from "../../component/Debounced/DebouncedSearch";
import Pagination from "../../component/Pagination";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(5);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const isCategoryActive = (value) =>
    value === true || value === 1 || value === "1";

  // Fetch categories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getCategories({
        page: currentPage,
        limit: productsPerPage,
        search,
      });

      const data = response.data;

      setCategories(
        Array.isArray(data.categories) ? data.categories : []
      );

      setTotalCategories(
        Number(data.pagination?.totalCategories ?? 0)
      );

      setTotalPages(Number(data.pagination?.totalPages ?? 0));
    } catch (error) {
      console.error("Fetch categories error:", error);

      const message =
        error.response?.data?.message ||
        "Categories load nahi hui. Backend/API check karo.";

      setErrorMessage(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, productsPerPage, search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Reset page when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, productsPerPage]);

  // Keep current page valid after deleting categories
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleLimitChange = (eventOrValue) => {
    const value =
      typeof eventOrValue === "object" && eventOrValue !== null
        ? eventOrValue.target?.value
        : eventOrValue;

    const nextLimit = Number(value);

    if ([5, 10, 20].includes(nextLimit)) {
      setProductsPerPage(nextLimit);
      setCurrentPage(1);
    }
  };

  // Add or update category
  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      showError("Please enter category name.");
      return;
    }

    if (name.length > 100) {
      showError("Category name cannot exceed 100 characters.");
      return;
    }

    if (!/^[\p{L}\p{N} &-]+$/u.test(name)) {
      showError(
        "Only letters, numbers, spaces, & and - are allowed."
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      if (editingId !== null) {
        await updateCategory(editingId, {
          category: name,
          is_active: isActive,
        });

        showSuccess("Category updated successfully.");
      } else {
        await addCategory({
          category: name,
          is_active: isActive,
        });

        showSuccess("Category added successfully.");
      }

      setCategoryName("");
      setIsActive(true);
      setEditingId(null);
      setCurrentPage(1);

      // Refresh categories
      if (currentPage === 1) {
        await loadCategories();
      }
    } catch (error) {
      console.error("Save category error:", error);

      showError(
        error.response?.data?.message ||
          "Category save nahi hui. Backend terminal check karo."
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit category
  const handleEdit = (item) => {
    setEditingId(item.id);
    setCategoryName(item.category);
    setIsActive(isCategoryActive(item.is_active));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete category
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setErrorMessage("");

      await deleteCategory(id);

      showSuccess("Category deleted successfully.");

      await loadCategories();
    } catch (error) {
      console.error("Delete category error:", error);

      showError(
        error.response?.data?.message ||
          "Category delete nahi hui."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setCategoryName("");
    setIsActive(true);
    setEditingId(null);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 font-sans text-stone-800 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Page heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-800" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                CraftStudio / Inventory
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-wide text-stone-900 sm:text-4xl">
              Category Management
            </h1>

            <p className="mt-1 text-xs text-stone-600 sm:text-sm">
              Manage and organize your showroom furniture categories
            </p>
          </div>
        </div>

        {/* Add/Edit form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-8"
        >
          <div className="mb-5 flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900">
              {editingId !== null ? "Edit Category" : "Add New Category"}
            </h2>

            {editingId !== null && (
              <span className="rounded-full border border-amber-200/60 bg-amber-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                Editing #{editingId}
              </span>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="categoryName"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
              >
                Category Name *
              </label>

              <input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(event) =>
                  setCategoryName(event.target.value)
                }
                placeholder="e.g. Living Room Sofas, Solid Teak Tables"
                maxLength={100}
                className="w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-4 py-3 text-sm font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10"
                required
              />
            </div>

            <div>
              <label
                htmlFor="categoryStatus"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
              >
                Status
              </label>

              <select
                id="categoryStatus"
                value={String(isActive)}
                onChange={(event) =>
                  setIsActive(event.target.value === "true")
                }
                className="w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-4 py-3 text-sm font-medium text-stone-800 outline-none transition focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10"
              >
                <option value="true">Active (Visible in Catalog)</option>
                <option value="false">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Category"
                  : "Add Category"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-xl border border-stone-200/80 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Categories table */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs">
          <div className="flex flex-col gap-4 border-b border-stone-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900">
                Categories ({totalCategories})
              </h2>

              <p className="mt-0.5 text-xs text-stone-500">
                Full taxonomy and segment classifications
              </p>
            </div>

            <div className="w-full sm:w-80">
              <DebouncedSearch
                value={search}
                onSearch={setSearch}
                placeholder="Search categories..."
                delay={500}
              />
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mx-6 my-4 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-900 shadow-2xs"
            >
              <span>{errorMessage}</span>

              <button
                type="button"
                onClick={loadCategories}
                className="font-bold underline hover:text-rose-950"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-650px border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200/80 bg-amber-100/30 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-14 text-center text-xs text-stone-500"
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-14 text-center text-xs text-stone-500"
                    >
                      {search
                        ? "No matching categories found."
                        : "No categories found."}
                    </td>
                  </tr>
                ) : (
                  categories.map((item) => {
                    const active = isCategoryActive(item.is_active);

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-amber-50/20"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-stone-400">
                          #{item.id}
                        </td>

                        <td className="px-6 py-4 font-serif font-bold text-stone-900">
                          {item.category}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${
                              active
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border border-stone-200 bg-stone-100 text-stone-600"
                            }`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              disabled={saving || deletingId !== null}
                              className="rounded-xl border border-stone-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 active:scale-95 disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId !== null || saving}
                              className="rounded-xl border border-stone-200/80 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 shadow-2xs transition hover:border-rose-200 hover:bg-rose-50 active:scale-95 disabled:opacity-50"
                            >
                              {deletingId === item.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && (
            <div className="border-t border-stone-100 p-5">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                productsPerPage={productsPerPage}
                onLimitChange={handleLimitChange}
                limitOptions={[5, 10, 20]}
                showLimitSelector={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;