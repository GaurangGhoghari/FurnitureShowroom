
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

  const CategoryStatus = ({ active }) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide sm:text-[11px] ${
        active
          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border border-stone-200 bg-stone-100 text-stone-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-600" : "bg-stone-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );

  const CategoryActions = ({ item }) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleEdit(item)}
        disabled={saving || deletingId !== null}
        className="flex-1 rounded-xl border border-stone-200/80 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-3.5 sm:py-1.5"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => handleDelete(item.id)}
        disabled={deletingId !== null || saving}
        className="flex-1 rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-rose-700 shadow-2xs transition hover:border-rose-200 hover:bg-rose-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-3.5 sm:py-1.5"
      >
        {deletingId === item.id ? "Deleting..." : "Delete"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDFBF7] px-3 py-5 font-sans text-stone-800 sm:p-6 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">

        {/* Page Heading */}
        <div className="flex flex-col gap-3 border-b border-stone-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-800" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-800 sm:text-[11px] sm:tracking-[0.2em]">
                CraftStudio / Inventory
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold tracking-wide text-stone-900 sm:text-3xl lg:text-4xl">
              Category Management
            </h1>

            <p className="mt-1 text-xs leading-relaxed text-stone-600 sm:text-sm">
              Manage and organize your showroom furniture categories
            </p>
          </div>
        </div>

        {/* Add / Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6 lg:p-8"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <h2 className="font-serif text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
              {editingId !== null ? "Edit Category" : "Add New Category"}
            </h2>

            {editingId !== null && (
              <span className="rounded-full border border-amber-200/60 bg-amber-100/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-900 sm:text-[11px]">
                Editing #{editingId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="min-w-0">
              <label
                htmlFor="categoryName"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-stone-700 sm:text-xs"
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
                className="w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-3.5 py-3 text-xs font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10 sm:px-4 sm:text-sm"
                required
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="categoryStatus"
                className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-stone-700 sm:text-xs"
              >
                Status
              </label>

              <select
                id="categoryStatus"
                value={String(isActive)}
                onChange={(event) =>
                  setIsActive(event.target.value === "true")
                }
                className="w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-3.5 py-3 text-xs font-medium text-stone-800 outline-none transition focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10 sm:px-4 sm:text-sm"
              >
                <option value="true">Active (Visible in Catalog)</option>
                <option value="false">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-5 flex flex-col gap-2.5 border-t border-stone-100 pt-5 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                className="w-full rounded-xl border border-stone-200/80 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-700 transition hover:bg-stone-50 disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Categories Section */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs sm:rounded-3xl">

          {/* Section Header */}
          <div className="flex flex-col gap-4 border-b border-stone-100 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
                Categories ({totalCategories})
              </h2>

              <p className="mt-0.5 text-xs text-stone-500">
                Full taxonomy and segment classifications
              </p>
            </div>

            <div className="w-full lg:w-80">
              <DebouncedSearch
                value={search}
                onSearch={setSearch}
                placeholder="Search categories..."
                delay={500}
              />
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="mx-3 my-4 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-900 shadow-2xs sm:mx-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="break-words">{errorMessage}</span>

              <button
                type="button"
                onClick={loadCategories}
                className="self-start font-bold underline hover:text-rose-950 sm:self-auto"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="py-16 text-center text-xs text-stone-500">
              <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-amber-800/20 border-t-amber-800" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="px-4 py-14 text-center text-xs text-stone-500">
              {search
                ? "No matching categories found."
                : "No categories found."}
            </div>
          ) : (
            <>
              {/* Mobile Category Cards */}
              <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
                {categories.map((item) => {
                  const active = isCategoryActive(item.is_active);

                  return (
                    <div
                      key={item.id}
                      className="min-w-0 rounded-2xl border border-stone-200/80 bg-[#FDFBF7]/60 p-4 transition hover:border-amber-800/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-800/10 bg-amber-100/60 font-serif text-sm font-bold text-amber-900">
                            {item.category?.[0]?.toUpperCase() || "C"}
                          </div>

                          <div className="min-w-0">
                            <p className="text-[9px] font-semibold uppercase tracking-widest text-stone-400">
                              Category #{item.id}
                            </p>

                            <h3 className="mt-1 break-words font-serif text-base font-bold text-stone-900">
                              {item.category}
                            </h3>
                          </div>
                        </div>

                        <CategoryStatus active={active} />
                      </div>

                      <div className="mt-4 border-t border-stone-200/70 pt-3">
                        <CategoryActions item={item} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tablet / Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[650px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200/80 bg-amber-100/30 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                      <th className="w-[15%] px-6 py-4">ID</th>
                      <th className="w-[40%] px-6 py-4">
                        Category Name
                      </th>
                      <th className="w-[20%] px-6 py-4">Status</th>
                      <th className="w-[25%] px-6 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {categories.map((item) => {
                      const active = isCategoryActive(item.is_active);

                      return (
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-amber-50/20"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-stone-400">
                            #{item.id}
                          </td>

                          <td className="break-words px-6 py-4 font-serif font-bold text-stone-900">
                            {item.category}
                          </td>

                          <td className="px-6 py-4">
                            <CategoryStatus active={active} />
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <CategoryActions item={item} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && (
            <div className="border-t border-stone-100 p-3 sm:p-5">
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