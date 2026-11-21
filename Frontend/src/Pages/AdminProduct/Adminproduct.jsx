
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Pagination from "../../component/Pagination";
import {
  Sofa,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  Layers,
  ImagePlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import DebouncedSearch from "../../component/Debounced/DebouncedSearch";

import {
  getAdminProducts,
  addProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  getCategories,
} from "../../api/api";

const DEFAULT_PRODUCTS_PER_PAGE = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ADDITIONAL_IMAGES = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_LIMITS = [3, 5, 10, 20];

const initialFormData = {
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  image: null,
  images: [],
  is_featured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(
    DEFAULT_PRODUCTS_PER_PAGE,
  );
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...initialFormData });

  const [existingMainImage, setExistingMainImage] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");

  const requestIdRef = useRef(0);

  // FETCH CATEGORIES
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        const response = await getCategories({
          status: "active",
          page: 1,
          limit: 100,
        });

        if (cancelled) return;

        const list = response.data?.categories;
        setCategories(Array.isArray(list) ? list : []);
      } catch (error) {
        if (!cancelled) {
          console.error("Fetch Categories Error:", error);
          toast.error("Failed to load categories.");
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // FETCH PRODUCTS
  const fetchProducts = useCallback(
    async (
      page = currentPage,
      search = searchTerm,
      status = statusFilter,
      limit = productsPerPage,
      sort = sortBy,
      category = categoryFilter,
    ) => {
      const requestedPage = Math.max(1, Number(page) || 1);

      const requestedLimit = ALLOWED_LIMITS.includes(Number(limit))
        ? Number(limit)
        : DEFAULT_PRODUCTS_PER_PAGE;

      const requestedSearch = (search || "").trim();
      const requestedStatus = status || "all";
      const requestedSort = sort || "name_asc";
      const requestedCategory = category || "all";

      const requestId = ++requestIdRef.current;

      setLoading(true);

      try {
        const response = await getAdminProducts(
          requestedPage,
          requestedLimit,
          requestedSearch,
          requestedStatus,
          requestedSort,
          requestedCategory,
        );

        if (requestId !== requestIdRef.current) return;

        const data = response.data;
        const productList = data?.products;
        const pagination = data?.pagination;

        if (!Array.isArray(productList) || !pagination) {
          throw new Error(
            "Invalid API response: products or pagination missing.",
          );
        }

        const total = Math.max(0, Number(pagination.totalProducts) || 0);
        const pages = Math.max(0, Number(pagination.totalPages) || 0);

        setTotalProducts(total);
        setTotalPages(pages);

        if (total === 0 || pages === 0) {
          setProducts([]);

          if (requestedPage !== 1) {
            setCurrentPage(1);
          }

          return;
        }

        if (requestedPage > pages) {
          setCurrentPage(pages);
          return;
        }

        setProducts(productList);
      } catch (error) {
        if (requestId !== requestIdRef.current) return;

        console.error("Fetch Products Error:", error);

        setProducts([]);
        setTotalProducts(0);
        setTotalPages(0);

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch products.",
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [
      currentPage,
      searchTerm,
      statusFilter,
      productsPerPage,
      sortBy,
      categoryFilter,
    ],
  );

  // FETCH WHEN FILTERS / PAGE CHANGE
  useEffect(() => {
    fetchProducts();

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchProducts]);

  // SORTING
  const handleSort = (field) => {
    const [currentField, currentOrder] = sortBy.split("_");

    const nextOrder =
      currentField === field && currentOrder === "asc" ? "desc" : "asc";

    setSortBy(`${field}_${nextOrder}`);
    setCurrentPage(1);
  };

  // SEARCH
  const handleSearch = useCallback((value) => {
    const nextSearch = (value || "").trim();

    setSearchTerm((previous) =>
      previous === nextSearch ? previous : nextSearch,
    );

    setCurrentPage(1);
  }, []);

  // PAGE LIMIT
  const handleLimitChange = (event) => {
    const newLimit = Number(event.target.value);

    if (!ALLOWED_LIMITS.includes(newLimit)) return;

    setProductsPerPage(newLimit);
    setCurrentPage(1);
  };

  // CLEAR FILTERS
  const handleClearFilters = () => {
    setCurrentPage(1);
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const filteredProducts = products;

  const activeCount = products.filter(
    (product) => Number(product.active) === 1,
  ).length;

  const inactiveCount = products.length - activeCount;

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "all" ||
    categoryFilter !== "all";

  // IMAGE PREVIEW CLEANUP
  const clearImagePreviews = () => {
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    additionalImagePreviews.forEach((item) => {
      URL.revokeObjectURL(item.preview);
    });
  };

  // FORM INPUT
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // MAIN IMAGE
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.warning("Select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.warning("Image size must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));

    setMainImagePreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  // ADDITIONAL IMAGES
  const handleAdditionalImagesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const remainingSlots =
      MAX_ADDITIONAL_IMAGES - existingImages.length - formData.images.length;

    if (remainingSlots <= 0) {
      toast.warning("Maximum 10 additional images are allowed.");
      return;
    }

    const validFiles = [];

    selectedFiles.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.warning(`${file.name}: Invalid image format.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.warning(`${file.name}: Maximum file size is 5 MB.`);
        return;
      }

      validFiles.push(file);
    });

    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      toast.warning(`You can add only ${remainingSlots} more image(s).`);
    }

    if (filesToAdd.length === 0) return;

    const newItems = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((previous) => ({
      ...previous,
      images: [...previous.images, ...filesToAdd],
    }));

    setAdditionalImagePreviews((previous) => [...previous, ...newItems]);
  };

  // REMOVE NEW ADDITIONAL IMAGE
  const handleRemoveAdditionalImage = (index) => {
    const item = additionalImagePreviews[index];

    if (item) {
      URL.revokeObjectURL(item.preview);
    }

    setAdditionalImagePreviews((previous) =>
      previous.filter((_, i) => i !== index),
    );

    setFormData((previous) => ({
      ...previous,
      images: previous.images.filter((_, i) => i !== index),
    }));
  };

  // REMOVE EXISTING ADDITIONAL IMAGE
  const handleRemoveExistingImage = (index) => {
    if (saving) return;

    const imageToRemove = existingImages[index];

    if (!imageToRemove) return;

    setRemovedImages((previous) => [...previous, imageToRemove]);

    setExistingImages((previous) =>
      previous.filter((_, i) => i !== index),
    );
  };

  // RESET FORM
  const resetForm = () => {
    clearImagePreviews();

    setFormData({ ...initialFormData });
    setEditingId(null);

    setExistingMainImage(null);
    setExistingImages([]);
    setRemovedImages([]);

    setMainImagePreview(null);
    setAdditionalImagePreviews([]);
  };

  // OPEN ADD MODAL
  const handleOpenAddModal = () => {
    if (saving) return;

    resetForm();
    setIsModalOpen(true);
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    let parsedImages = [];

    try {
      if (Array.isArray(product.images)) {
        parsedImages = product.images;
      } else if (typeof product.images === "string") {
        const parsed = JSON.parse(product.images);
        parsedImages = Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Parse Product Images Error:", error);
    }

    clearImagePreviews();

    setEditingId(product.id);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: null,
      images: [],
      is_featured:
        Number(product.is_featured) === 1 || product.is_featured === true,
    });

    setExistingMainImage(product.image || null);
    setExistingImages(parsedImages);
    setRemovedImages([]);

    setMainImagePreview(null);
    setAdditionalImagePreviews([]);

    setIsModalOpen(true);
  };

  // CLOSE MODAL
  const handleCloseModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    resetForm();
  };

  // REFRESH CURRENT VIEW
  const refreshProducts = () =>
    fetchProducts(
      currentPage,
      searchTerm,
      statusFilter,
      productsPerPage,
      sortBy,
      categoryFilter,
    );

  // TOGGLE PRODUCT STATUS
  const handleToggleStatus = async (id) => {
    if (statusUpdatingId !== null) return;

    setStatusUpdatingId(id);

    try {
      const response = await toggleProductStatus(id);

      toast.success(response.data?.message || "Product status updated.");

      await refreshProducts();
    } catch (error) {
      console.error("Toggle Product Status Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update product status.",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // ADD / UPDATE PRODUCT
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const name = formData.name.trim();
    const category = formData.category.trim();
    const price = Number(formData.price);
    const stock = formData.stock === "" ? 0 : Number(formData.stock);

    if (!name) {
      toast.warning("Please enter the product name.");
      return;
    }

    if (name.length > 150) {
      toast.warning("Product name cannot exceed 150 characters.");
      return;
    }

    const isValidCategory = categories.some(
      (item) => item.category === category && Number(item.is_active) === 1,
    );

    if (!isValidCategory) {
      toast.warning("Please select a valid active product category.");
      return;
    }

    if (formData.price === "" || !Number.isFinite(price) || price < 0) {
      toast.warning("Please enter a valid product price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.warning("Stock must be a non-negative whole number.");
      return;
    }

    if (!formData.image && !existingMainImage) {
      toast.warning("Please select a main product image.");
      return;
    }

    const totalAdditionalImages =
      existingImages.length + formData.images.length;

    if (totalAdditionalImages < 1) {
      toast.warning("Please add at least one additional image.");
      return;
    }

    if (totalAdditionalImages > MAX_ADDITIONAL_IMAGES) {
      toast.warning("Maximum 10 additional images are allowed.");
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();

      data.append("name", name);
      data.append("category", category);
      data.append("description", formData.description.trim());
      data.append("price", String(price));
      data.append("stock", String(stock));
      data.append("is_featured", formData.is_featured ? "1" : "0");

      if (formData.image) {
        data.append("image", formData.image);
      }

      formData.images.forEach((file) => {
        data.append("images", file);
      });

      const isEditing = editingId !== null;

      if (isEditing) {
        data.append("removedImages", JSON.stringify(removedImages));

        await updateProduct(editingId, data);
        toast.success("Product updated successfully.");
      } else {
        await addProduct(data);
        toast.success("Product added successfully.");
      }

      setIsModalOpen(false);
      resetForm();

      if (!isEditing && currentPage !== 1) {
        setCurrentPage(1);
      } else {
        await refreshProducts();
      }
    } catch (error) {
      console.error("Save Product Error:", error);

      toast.error(error.response?.data?.message || "Product operation failed.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await deleteProduct(id);

      toast.success(response.data?.message || "Product deleted successfully.");

      await refreshProducts();
    } catch (error) {
      console.error("Delete Product Error:", error);

      toast.error(error.response?.data?.message || "Product delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const displayedMainImage = mainImagePreview || existingMainImage;

  const startIndex =
    totalProducts === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;

  const endIndex = Math.min(currentPage * productsPerPage, totalProducts);

  // PRODUCT STATUS BADGE
  const StatusBadge = ({ product }) => (
    <button
      type="button"
      onClick={() => handleToggleStatus(product.id)}
      disabled={statusUpdatingId !== null}
      title="Toggle product status"
      className="disabled:opacity-50"
    >
      <span
        className={
          Number(product.active) === 1
            ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800"
            : "inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-[11px] font-semibold text-stone-600"
        }
      >
        <span
          className={
            Number(product.active) === 1
              ? "h-1.5 w-1.5 rounded-full bg-emerald-600"
              : "h-1.5 w-1.5 rounded-full bg-stone-400"
          }
        />
        {statusUpdatingId === product.id
          ? "Updating..."
          : Number(product.active) === 1
            ? "Active"
            : "Inactive"}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-3 font-sans text-stone-800 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-800" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-800 sm:text-xs sm:tracking-[0.2em]">
                CraftStudio Showroom / Admin
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-4xl">
              Product Collection
            </h1>

            <p className="mt-2 text-xs text-stone-600 sm:text-sm">
              Manage furniture products, pricing, stock, and images.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-amber-900 disabled:opacity-50 sm:w-auto"
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>

        {/* PRODUCT CATALOG */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {/* CATALOG HEADER */}
          <div className="flex flex-col gap-4 border-b border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Catalog Overview
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Search, filter, inspect, and update inventory.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshProducts}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-700 transition hover:border-amber-700 disabled:opacity-50 sm:w-auto"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* SEARCH + FILTERS */}
          <div className="grid grid-cols-1 gap-3 border-b border-stone-200 bg-[#FDFBF7] p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-stone-400"
              />

              <DebouncedSearch
                value={searchTerm}
                onSearch={handleSearch}
                placeholder="Search product..."
                delay={300}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              disabled={categoriesLoading}
              aria-label="Filter products by category"
              className="w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider outline-none focus:border-amber-700"
            >
              <option value="all">All Categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.category}>
                  {item.category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter products by status"
              className="w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider outline-none focus:border-amber-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-left text-xs font-bold uppercase tracking-wider text-amber-800 underline sm:col-span-2 lg:col-span-1"
              >
                Clear Search &amp; Filters
              </button>
            )}
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="px-4 py-16 text-center sm:py-20">
              <Sofa
                size={32}
                className="mx-auto animate-pulse text-amber-800"
              />
              <p className="mt-4 font-serif font-bold text-stone-900">
                Loading furniture collection...
              </p>
            </div>
          ) : totalProducts === 0 ? (
            hasActiveFilters ? (
              <div className="px-5 py-16 text-center">
                <Search size={30} className="mx-auto text-stone-400" />
                <p className="mt-3 font-serif font-semibold text-stone-800">
                  No products found for the selected filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 text-xs font-bold uppercase tracking-wider text-amber-800 underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <EmptyState onAdd={handleOpenAddModal} />
            )
          ) : filteredProducts.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="font-serif font-semibold text-stone-800">
                No products are available on this page.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE PRODUCT CARDS */}
              <div className="space-y-3 p-3 md:hidden">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
                  >
                    {/* PRODUCT IMAGE + NAME */}
                    <div className="flex min-w-0 gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || "Furniture"}
                          className="h-20 w-20 shrink-0 rounded-xl border border-stone-200 bg-stone-50 object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                          <Sofa size={28} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="break-words font-serif text-sm font-bold text-stone-900">
                          {product.name}
                        </p>

                        <p className="mt-1 line-clamp-2 break-words text-xs text-stone-500">
                          {product.description || "No description available"}
                        </p>

                        <p className="mt-1 text-[10px] text-stone-400">
                          ID: #{product.id}
                        </p>
                      </div>
                    </div>

                    {/* CATEGORY */}
                    <div className="mt-3 border-t border-stone-100 pt-3">
                      <span className="inline-flex max-w-full break-words rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-900">
                        {product.category || "Uncategorized"}
                      </span>
                    </div>

                    {/* PRICE + STOCK */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="min-w-0 rounded-lg bg-[#FDFBF7] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          Price
                        </p>
                        <p className="mt-1 break-words text-sm font-bold text-amber-800">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-lg bg-[#FDFBF7] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          Stock
                        </p>
                        <p
                          className={
                            Number(product.stock) === 0
                              ? "mt-1 text-sm font-bold text-rose-700"
                              : "mt-1 text-sm font-bold text-stone-800"
                          }
                        >
                          {product.stock ?? 0} units
                        </p>
                        {Number(product.stock) === 0 && (
                          <p className="mt-0.5 text-[10px] text-rose-600">
                            Out of stock
                          </p>
                        )}
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                        Product Status
                      </span>
                      <StatusBadge product={product} />
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        disabled={saving}
                        className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-2 py-2.5 text-xs font-semibold text-stone-700 hover:border-amber-700 hover:text-amber-800 disabled:opacity-50"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId !== null}
                        className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-2 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* TABLET + DESKTOP TABLE */}
              <div className="hidden w-full overflow-x-auto md:block">
                <table className="w-full min-w-[1050px] table-fixed border-collapse text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-amber-100/30 text-xs font-semibold uppercase tracking-wider text-amber-900">
                      <th className="w-[32%] px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleSort("name")}
                          className="inline-flex items-center gap-2 hover:text-amber-950"
                        >
                          Name
                          {sortBy === "name_asc" ? (
                            <ArrowUp size={15} />
                          ) : sortBy === "name_desc" ? (
                            <ArrowDown size={15} />
                          ) : (
                            <ArrowUpDown size={15} />
                          )}
                        </button>
                      </th>

                      <th className="w-[15%] px-5 py-4">Category</th>

                      <th className="w-[15%] px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleSort("price")}
                          className="inline-flex items-center gap-2 hover:text-amber-950"
                        >
                          Price
                          {sortBy === "price_asc" ? (
                            <ArrowUp size={15} />
                          ) : sortBy === "price_desc" ? (
                            <ArrowDown size={15} />
                          ) : (
                            <ArrowUpDown size={15} />
                          )}
                        </button>
                      </th>

                      <th className="w-[12%] px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleSort("stock")}
                          className="inline-flex items-center gap-2 hover:text-amber-950"
                        >
                          Stock
                          {sortBy === "stock_asc" ? (
                            <ArrowUp size={15} />
                          ) : sortBy === "stock_desc" ? (
                            <ArrowDown size={15} />
                          ) : (
                            <ArrowUpDown size={15} />
                          )}
                        </button>
                      </th>

                      <th className="w-[12%] px-5 py-4">Status</th>
                      <th className="w-[14%] px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100 text-sm">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-amber-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name || "Furniture"}
                                className="h-16 w-16 shrink-0 rounded-xl border border-stone-200 bg-stone-50 object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                                <Sofa size={24} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="break-words font-serif font-bold text-stone-900">
                                {product.name}
                              </p>
                              <p className="mt-1 line-clamp-2 break-words text-xs text-stone-600">
                                {product.description || "No description available"}
                              </p>
                              <p className="mt-1 text-[11px] text-stone-400">
                                ID: #{product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex max-w-full break-words rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                            {product.category || "Uncategorized"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-bold text-amber-800">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={
                              Number(product.stock) === 0
                                ? "text-xs font-semibold text-rose-700"
                                : "text-xs font-semibold text-stone-700"
                            }
                          >
                            {product.stock ?? 0} units
                          </span>

                          {Number(product.stock) === 0 && (
                            <p className="mt-1 text-[11px] text-rose-600">
                              Out of stock
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge product={product} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(product)}
                              disabled={saving}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold hover:border-amber-700 hover:text-amber-800 disabled:opacity-50"
                            >
                              <Edit2 size={13} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                              {deletingId === product.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PAGINATION */}
          {!loading && totalProducts > 0 && (
            <div className="min-w-0 overflow-x-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                productsPerPage={productsPerPage}
                onLimitChange={handleLimitChange}
                limitOptions={ALLOWED_LIMITS}
                showLimitSelector={true}
              />
            </div>
          )}

          {/* FOOTER */}
          {!loading && totalProducts > 0 && (
            <div className="flex flex-col gap-2 border-t border-stone-200 bg-[#FDFBF7] px-4 py-4 text-[11px] text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:text-xs">
              <p>
                Showing {startIndex} - {endIndex} of {totalProducts} products
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span>Active on this page: {activeCount}</span>
                <span className="hidden text-stone-300 sm:inline">|</span>
                <span>Inactive on this page: {inactiveCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="my-auto max-h-[96dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl sm:max-h-[95vh] sm:rounded-3xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-stone-200 bg-[#FBF3E5] px-4 py-4 sm:items-center sm:px-8 sm:py-5">
              <div className="min-w-0">
                <p className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-900 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
                  <Layers size={12} className="mr-1 inline shrink-0" />
                  Catalog Editor
                </p>

                <h2 className="mt-2 font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                  {editingId !== null ? "Edit Product" : "Add New Product"}
                </h2>

                <p className="mt-1 text-[11px] text-stone-600 sm:text-xs">
                  Add product details and showcase images.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                aria-label="Close modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-stone-500 hover:bg-white disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:space-y-6 sm:p-8">
              {/* NAME */}
              <div>
                <label
                  htmlFor="product-name"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                >
                  Product Name *
                </label>
                <input
                  id="product-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Teak Wood Living Armchair"
                  maxLength={150}
                  required
                  className="w-full min-w-0 rounded-xl border border-stone-200 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label
                  htmlFor="product-category"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                >
                  Product Category *
                </label>
                <select
                  id="product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={categoriesLoading || saving}
                  className="w-full min-w-0 rounded-xl border border-stone-200 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-amber-700"
                >
                  <option value="">Select Category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.category}>
                      {item.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRICE + STOCK */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="min-w-0">
                  <label
                    htmlFor="product-price"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Price (₹) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 24999"
                    min="0"
                    step="0.01"
                    required
                    className="w-full min-w-0 rounded-xl border border-stone-200 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-amber-700"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="product-stock"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Stock Quantity
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Available count"
                    min="0"
                    step="1"
                    className="w-full min-w-0 rounded-xl border border-stone-200 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              {/* FEATURED PRODUCT */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 sm:p-4">
                <label
                  htmlFor="product-featured"
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id="product-featured"
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 h-4 w-4 shrink-0 accent-amber-800"
                  />
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-stone-900">
                      Featured Product
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-stone-600">
                      Select this product to display it in the Home Page
                      Featured Products section.
                    </span>
                  </div>
                </label>
              </div>

              {/* MAIN IMAGE */}
              <section className="rounded-2xl border border-stone-200 p-3 sm:p-5">
                <h3 className="text-sm font-bold text-stone-900">
                  Main Product Image *
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  JPG, PNG or WEBP. Maximum size: 5 MB.
                </p>

                <div className="mt-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-[#FDFBF7] sm:w-40">
                    {displayedMainImage ? (
                      <img
                        src={displayedMainImage}
                        alt="Main product preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-stone-400">
                        <ImagePlus size={28} className="mx-auto" />
                        <p className="mt-2 text-xs">Image preview</p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="product-image"
                      className="mb-2 block text-xs font-semibold text-stone-700"
                    >
                      {editingId !== null
                        ? "Choose replacement image"
                        : "Choose main image"}
                    </label>
                    <input
                      id="product-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="w-full min-w-0 rounded-xl border border-stone-200 bg-[#FDFBF7] p-2 text-xs"
                    />

                    {formData.image && (
                      <p className="mt-2 break-all text-xs text-emerald-800">
                        Selected: {formData.image.name}
                      </p>
                    )}

                    {editingId !== null && (
                      <p className="mt-2 text-xs text-stone-500">
                        Leave empty to keep the current main image.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* ADDITIONAL IMAGES */}
              <section className="rounded-2xl border border-stone-200 p-3 sm:p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-bold text-stone-900">
                    Additional Product Images *
                  </h3>
                  <span className="text-xs font-semibold text-amber-800">
                    {existingImages.length + formData.images.length}/10 images
                  </span>
                </div>

                <p className="mt-1 text-xs text-stone-500">
                  Select multiple views of the same furniture product.
                </p>

                <label
                  htmlFor="additional-product-images"
                  className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-amber-300 bg-[#FDFBF7] px-3 py-6 text-center transition hover:bg-amber-50 sm:px-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <ImagePlus size={22} />
                  </div>
                  <span className="mt-3 text-sm font-semibold text-stone-800">
                    Select additional images
                  </span>
                  <span className="mt-1 text-xs text-stone-500">
                    JPG, PNG or WEBP · Up to 5 MB each
                  </span>

                  <input
                    id="additional-product-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    disabled={
                      existingImages.length + formData.images.length >=
                      MAX_ADDITIONAL_IMAGES
                    }
                    className="sr-only"
                  />
                </label>

                {/* EXISTING IMAGES */}
                {existingImages.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Existing Images
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                      {existingImages.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="relative min-w-0 overflow-hidden rounded-xl border border-stone-200 bg-white"
                        >
                          <img
                            src={image}
                            alt={`Existing product view ${index + 1}`}
                            className="h-28 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            disabled={saving}
                            aria-label={`Delete existing image ${index + 1}`}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-stone-950/75 text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>

                          <p className="truncate px-2 py-2 text-center text-[11px] text-stone-500">
                            Saved image {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NEW IMAGE PREVIEWS */}
                {additionalImagePreviews.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Newly Selected Images
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                      {additionalImagePreviews.map((item, index) => (
                        <div
                          key={item.preview}
                          className="relative min-w-0 overflow-hidden rounded-xl border border-amber-200 bg-white"
                        >
                          <img
                            src={item.preview}
                            alt={`New product view ${index + 1}`}
                            className="h-28 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(index)}
                            disabled={saving}
                            aria-label={`Remove ${item.file.name}`}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-stone-950/75 text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            <X size={14} />
                          </button>

                          <p className="truncate px-2 py-2 text-[11px] text-stone-600">
                            {item.file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
                  Deleted existing images will be removed permanently after
                  successfully updating the product.
                </p>
              </section>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="product-description"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                >
                  Description
                </label>
                <textarea
                  id="product-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  placeholder="Describe the wood type, finish, size, and comfort..."
                  className="w-full min-w-0 resize-y rounded-xl border border-stone-200 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-amber-700"
                />
              </div>

              {/* FORM BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="w-full rounded-xl border border-stone-200 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-50 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-amber-800 px-7 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Product"
                      : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// EMPTY STATE
const EmptyState = ({ onAdd }) => (
  <div className="px-5 py-16 text-center sm:py-20">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-800">
      <Package size={28} />
    </div>

    <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">
      Your collection is empty
    </h3>

    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-stone-600">
      Add your first furniture product to start building your online showroom.
    </p>

    <button
      type="button"
      onClick={onAdd}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-amber-900 sm:w-auto"
    >
      <Plus size={15} />
      Add First Product
    </button>
  </div>
);

export default AdminProducts;