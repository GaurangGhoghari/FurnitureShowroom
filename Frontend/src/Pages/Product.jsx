
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authcontext";
import Map from "../component/Map";
import { addToCart, getProducts, getCategories } from "../api/api";

import {
  ShoppingCart,
  Search,
  SlidersHorizontal,
  RefreshCw,
  PackageSearch,
  CheckCircle2,
  AlertCircle,
  X,
  ImageOff,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

import Favorite from "../component/Favorite";
import Pagination from "../component/Pagination";

const SERVER_URL = import.meta.env.VITE_API_URL.replace("/api", "");
const PRODUCTS_PER_PAGE = 4;

// FORMAT PRICE
const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

// IMAGE URL
const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "object") {
    image = image.url || image.path || image.filename || image.image;
  }

  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${SERVER_URL}${value}`;
  if (value.startsWith("uploads/")) return `${SERVER_URL}/${value}`;

  return `${SERVER_URL}/uploads/${value}`;
};

// GET PRODUCT LIST FROM API RESPONSE
const getProductList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;

  return [];
};

// GET CATEGORY LIST FROM API RESPONSE
const getCategoryList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data?.categories)) {
    return data.data.categories;
  }

  return [];
};

// PRODUCT CARD
export const ProductCard = ({
  product,
  onViewDetails,
  onAddToCart,
  addingToCart,
  cartMessage,
  cartMessageProductId,
  onRemoveFavorite,
}) => {
  const [imgError, setImgError] = useState(false);

  const imageUrl = getImageUrl(product.image);
  const isAvailable = Number(product.stock) > 0;
  const productId = String(product.id ?? product._id);

  return (
    <article
      onClick={() => onViewDetails(product)}
      onKeyDown={(event) => {
        if (
          (event.key === "Enter" || event.key === " ") &&
          event.target === event.currentTarget
        ) {
          event.preventDefault();
          onViewDetails(product);
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${product.name || "furniture piece"}`}
      className="product-card-animate group flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-amber-700/40 hover:shadow-xl"
    >
      <div>
        {/* PRODUCT IMAGE */}
        <div className="relative aspect-5/3 w-full overflow-hidden bg-amber-50/40">
          <div
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            className="absolute right-2 top-2 z-10"
          >
            <Favorite product={product} />
          </div>

          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name || "Furniture product"}
              loading="lazy"
              onError={() => setImgError(true)}
              className="product-card-image h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-stone-100/70 text-stone-400">
              <ImageOff size={24} strokeWidth={1.3} />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-500">
                Image Not Available
              </span>
            </div>
          )}

          {/* BRAND BADGE */}
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-white/95 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-amber-900 shadow-sm backdrop-blur-sm">
            <span className="h-1 w-1 rounded-full bg-amber-800" />
            CraftStudio
          </div>

          {!isAvailable && (
            <div className="absolute bottom-2 left-2 rounded-full bg-stone-900/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-stone-100 shadow-sm">
              Sold Out
            </div>
          )}
        </div>

        {/* PRODUCT DETAILS */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-1">
            <h3 className="line-clamp-1 font-serif text-sm font-bold text-stone-900 transition-colors group-hover:text-amber-800">
              {product.name || "Untitled Product"}
            </h3>

            <ArrowUpRight
              size={14}
              className="mt-0.5 shrink-0 text-stone-400 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-amber-800"
            />
          </div>

          <p className="mt-1.5 line-clamp-2 min-h-8 text-[11px] leading-4 text-stone-600">
            {product.description ||
              "Handcrafted solid wood build designed for comfort and modern living."}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2.5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">
                Showroom Price
              </p>

              <p className="text-base font-bold text-stone-900 transition-colors group-hover:text-amber-800">
                {formatPrice(product.price)}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-medium ${
                isAvailable
                  ? "border border-emerald-200/80 bg-emerald-50 text-emerald-800"
                  : "border border-stone-200/80 bg-stone-100 text-stone-600"
              }`}
            >
              {isAvailable ? (
                <>
                  <CheckCircle2 size={11} />
                  In Stock
                </>
              ) : (
                <>
                  <AlertCircle size={11} />
                  Out of Stock
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ADD TO CART */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart(product);
          }}
          disabled={addingToCart || !isAvailable}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-800 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-900 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={13} />

          {addingToCart
            ? "Adding to Bag..."
            : !isAvailable
              ? "Out of Stock"
              : "Add to Cart"}
        </button>

        {cartMessageProductId === productId && cartMessage && (
          <p
            className={`mt-2 text-center text-[11px] font-medium ${
              /success|added/i.test(cartMessage)
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
            role="status"
          >
            {cartMessage}
          </p>
        )}
      </div>

      {/* OPTIONAL REMOVE FAVORITE BUTTON */}
      {onRemoveFavorite && (
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemoveFavorite(product.id ?? product._id);
            }}
            className="w-full rounded-lg border border-rose-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-rose-600 transition hover:bg-rose-50"
          >
            ♥ Remove from Favorites
          </button>
        </div>
      )}
    </article>
  );
};

// PRODUCT LOADING SKELETON
const ProductSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm">
    <div className="aspect-5/3 bg-stone-200/70" />

    <div className="space-y-3 p-3">
      <div className="h-4 w-3/4 rounded bg-stone-200/80" />
      <div className="h-3 w-1/2 rounded bg-stone-200/80" />
      <div className="h-8 rounded-lg bg-stone-200/80" />
    </div>
  </div>
);

// MAIN PRODUCT PAGE
const Product = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // CART STATES
  const [addingCartId, setAddingCartId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageProductId, setCartMessageProductId] = useState("");

  // PRODUCT STATES
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // PAGE STATES
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CATEGORY STATE
  const [categories, setCategories] = useState([]);

  // FETCH ACTIVE CATEGORIES
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const response = await getCategories({
          status: "active",
          page: 1,
          limit: 100,
        });

        const categoryList = getCategoryList(response?.data ?? response);

        const activeCategories = categoryList.filter((item) => {
          if (item.is_active === undefined || item.is_active === null) {
            return true;
          }

          return item.is_active === true || Number(item.is_active) === 1;
        });

        if (!cancelled) {
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error("Categories fetch error:", error);

        if (!cancelled) {
          setCategories([]);
        }
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // FETCH PRODUCTS WITH FILTERS
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        search: search.trim(),
        category,
        availability,
        sortBy,
      };

      if (minPrice !== "") params.minPrice = minPrice;
      if (maxPrice !== "") params.maxPrice = maxPrice;

      const response = await getProducts(params);
      const responseData = response?.data ?? response;
      const productList = getProductList(responseData);

      const activeProducts = productList.filter((product) => {
        if (product.active === undefined || product.active === null) {
          return true;
        }

        return product.active === true || Number(product.active) === 1;
      });

      setProducts(activeProducts);
      setTotalPages(Number(responseData?.pagination?.totalPages) || 0);
      setTotalProducts(Number(responseData?.pagination?.totalProducts) || 0);
    } catch (err) {
      console.error("Products fetch error:", err);

      setError(
        err?.response?.data?.message ||
          "We could not load products. Please check that the backend is running."
      );

      setProducts([]);
      setTotalPages(0);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    search,
    category,
    minPrice,
    maxPrice,
    availability,
    sortBy,
  ]);

  // RESET PAGE WHEN FILTERS CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, minPrice, maxPrice, availability, sortBy]);

  // LOAD PRODUCTS
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ADD PRODUCT TO CART
  const handleAddToCart = async (product) => {
    const productId = product.id ?? product._id;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      setCartMessageProductId("");
      setCartMessage("Product ID not found.");
      return;
    }

    if (Number(product.stock) <= 0) {
      setCartMessageProductId(String(productId));
      setCartMessage("This item is currently out of stock.");
      return;
    }

    try {
      setAddingCartId(String(productId));
      setCartMessageProductId(String(productId));
      setCartMessage("");

      await addToCart(productId, 1);

      window.dispatchEvent(new Event("cartUpdated"));

      setCartMessage("Added to cart successfully!");
    } catch (err) {
      console.error("Add to cart error:", err);

      setCartMessage(
        err?.response?.data?.message ||
          "Failed to add product to cart."
      );
    } finally {
      setAddingCartId(null);
    }
  };

  // OPEN PRODUCT DETAILS
  const handleViewDetails = (product) => {
    const productId = product.id ?? product._id;

    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      setError("Product ID not found. Please inspect the API response.");
      return;
    }

    navigate(`/product/${productId}`);
  };

  // CLEAR ALL FILTERS
  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("all");
    setSortBy("featured");
    setCurrentPage(1);
  };

  // CHECK ACTIVE FILTERS
  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    availability !== "all" ||
    sortBy !== "featured";

  // COMMON INPUT STYLE
  const filterInputClass =
    "w-full min-w-0 rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-3.5 py-2.5 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-2 focus:ring-amber-800/10";

  return (
    <div className="product-page min-h-screen bg-[#FDFBF7] font-sans text-stone-800 antialiased selection:bg-amber-200 selection:text-amber-900">

      {/* HERO SECTION */}
      <section className="product-hero border-b border-stone-200/80 bg-amber-100/30 px-6 py-16 text-center md:py-20">
        <div className="product-hero-content mx-auto max-w-4xl space-y-4">
          <p className="product-hero-label text-xs font-semibold uppercase tracking-[0.25em] text-amber-800">
            Explore Our Collection
          </p>

          <h1 className="product-hero-title font-serif text-4xl font-bold leading-tight tracking-wide text-stone-900 md:text-6xl">
            Timeless Pieces for <br />
            <span className="text-amber-800">
              Every Modern Room
            </span>
          </h1>

          <p className="product-hero-description mx-auto max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Explore handcrafted teak sofas, ergonomic lounge seating, and
            tailored dining suites made for lifetime durability.
          </p>
        </div>
      </section>

      {/* MAIN PRODUCTS SECTION */}
      <section
        id="all-products"
        className="mx-auto max-w-[1600px] px-4 py-8 sm:px-5 md:px-8 md:py-12"
      >
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">

          {/* LEFT SIDEBAR - FILTER & SEARCH */}
          <aside className="product-filter min-w-0 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">

              <div className="flex items-center justify-between border-b border-stone-100 bg-amber-100/30 px-5 py-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={18}
                    className="text-amber-800"
                  />

                  <h2 className="font-serif text-lg font-bold text-stone-900">
                    Filter & Search
                  </h2>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    title="Reset all filters"
                    aria-label="Reset all filters"
                    className="rounded-lg p-2 text-amber-800 transition hover:rotate-45deg hover:bg-amber-100"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>

              <div className="space-y-5 p-5">

                {/* SEARCH */}
                <div>
                  <label
                    htmlFor="product-search"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Search Products
                  </label>

                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                    />

                    <input
                      id="product-search"
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Sofa, chair, table..."
                      className={`${filterInputClass} pl-9`}
                    />
                  </div>
                </div>

                {/* CATEGORY */}
                <div>
                  <label
                    htmlFor="category-filter"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Furniture Category
                  </label>

                  <select
                    id="category-filter"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className={filterInputClass}
                  >
                    <option value="all">All Categories</option>

                    {categories.map((item) => (
                      <option
                        key={item.id ?? item._id}
                        value={item.category ?? item.name}
                      >
                        {item.category ?? item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AVAILABILITY */}
                <div>
                  <label
                    htmlFor="availability-filter"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Stock Availability
                  </label>

                  <select
                    id="availability-filter"
                    value={availability}
                    onChange={(event) => setAvailability(event.target.value)}
                    className={filterInputClass}
                  >
                    <option value="all">All Inventory</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                {/* MIN PRICE */}
                <div>
                  <label
                    htmlFor="min-price"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Minimum Price (₹)
                  </label>

                  <input
                    id="min-price"
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="₹ 5,000"
                    className={filterInputClass}
                  />
                </div>

                {/* MAX PRICE */}
                <div>
                  <label
                    htmlFor="max-price"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Maximum Price (₹)
                  </label>

                  <input
                    id="max-price"
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="₹ 1,00,000"
                    className={filterInputClass}
                  />
                </div>

                {/* SORTING */}
                <div>
                  <label
                    htmlFor="sortBy"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-700"
                  >
                    Sort Products
                  </label>

                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className={filterInputClass}
                  >
                    <option value="featured">Featured Collection</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A - Z</option>
                  </select>
                </div>

                {/* RESET FILTERS */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-800/30 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-amber-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-sm"
                  >
                    <RotateCcw size={14} />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE - PRODUCTS */}
          <main className="product-main min-w-0">

            {/* PRODUCTS HEADER */}
            <div className="product-list-heading flex flex-col justify-between gap-3 border-b border-stone-200/80 pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                  Browse Collection
                </p>

                <h2 className="font-serif text-2xl font-bold tracking-wide text-stone-900 sm:text-3xl">
                  Curated Furniture Suite
                </h2>
              </div>

              <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                {loading
                  ? "Checking inventory..."
                  : `${totalProducts} products listed`}
              </p>
            </div>

            {/* ACTIVE FILTER CHIPS */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Active:
                </span>

                {search.trim() && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white px-3 py-1 text-xs text-stone-700">
                    Keyword: <strong>{search}</strong>

                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Remove search filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {category !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white px-3 py-1 text-xs text-stone-700">
                    {category}

                    <button
                      type="button"
                      onClick={() => setCategory("all")}
                      aria-label="Remove category filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {minPrice !== "" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white px-3 py-1 text-xs text-stone-700">
                    Min: {formatPrice(minPrice)}

                    <button
                      type="button"
                      onClick={() => setMinPrice("")}
                      aria-label="Remove minimum price filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {maxPrice !== "" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white px-3 py-1 text-xs text-stone-700">
                    Max: {formatPrice(maxPrice)}

                    <button
                      type="button"
                      onClick={() => setMaxPrice("")}
                      aria-label="Remove maximum price filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {availability !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-white px-3 py-1 text-xs text-stone-700">
                    {availability === "in-stock"
                      ? "In Stock Only"
                      : "Out of Stock"}

                    <button
                      type="button"
                      onClick={() => setAvailability("all")}
                      aria-label="Remove availability filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* LOADING SKELETON */}
            {loading && (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4].map((item) => (
                  <ProductSkeleton key={item} />
                ))}
              </div>
            )}

            {/* ERROR STATE */}
            {!loading && error && (
              <div
                role="alert"
                className="product-state mt-8 rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm sm:p-10"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">
                  <AlertCircle size={28} />
                </div>

                <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">
                  Unable to Retrieve Catalog
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchProducts}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-1 hover:bg-amber-900 hover:shadow-lg"
                >
                  <RefreshCw size={14} />
                  Retry Connection
                </button>
              </div>
            )}

            {/* PRODUCT GRID */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="product-map-wrapper mt-6">
                  <Map
                    products={products}
                    renderItem={(product) => (
                      <ProductCard
                        key={product.id ?? product._id}
                        product={product}
                        onViewDetails={handleViewDetails}
                        onAddToCart={handleAddToCart}
                        addingToCart={
                          addingCartId ===
                          String(product.id ?? product._id)
                        }
                        cartMessage={cartMessage}
                        cartMessageProductId={cartMessageProductId}
                      />
                    )}
                  />
                </div>

                {/* PAGINATION */}
                <div className="product-pagination mt-10 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    productsPerPage={PRODUCTS_PER_PAGE}
                    showLimitSelector={false}
                  />
                </div>
              </>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && products.length === 0 && (
              <div className="product-state mt-8 rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center sm:py-20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800">
                  <PackageSearch size={32} strokeWidth={1.3} />
                </div>

                <h3 className="mt-6 font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                  No Matching Furniture Found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-stone-600 sm:text-sm">
                  Adjust your price brackets, clear your keyword query, or
                  explore a broader furniture category.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-7 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-1 hover:bg-amber-900 hover:shadow-lg"
                  >
                    <RotateCcw size={14} />
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* PRODUCT PAGE ANIMATIONS */}
      <style>{`
        .product-page {
          animation: productPageEnter 0.65s ease-out both;
        }

        .product-hero-content > * {
          opacity: 0;
          animation: productFadeUp 0.8s ease-out forwards;
        }

        .product-hero-label {
          animation-delay: 0.1s;
        }

        .product-hero-title {
          animation-delay: 0.25s;
        }

        .product-hero-description {
          animation-delay: 0.4s;
        }

        .product-filter {
          animation: productSlideRight 0.8s ease-out 0.2s both;
        }

        .product-list-heading {
          animation: productFadeUp 0.8s ease-out 0.25s both;
        }

        .product-main {
          animation: productFadeUp 0.8s ease-out 0.35s both;
        }

        .product-card-animate {
          animation: productCardEnter 0.65s ease-out both;
        }

        .product-card-animate:nth-child(1) {
          animation-delay: 0.08s;
        }

        .product-card-animate:nth-child(2) {
          animation-delay: 0.16s;
        }

        .product-card-animate:nth-child(3) {
          animation-delay: 0.24s;
        }

        .product-card-animate:nth-child(4) {
          animation-delay: 0.32s;
        }

        .product-card-image {
          will-change: transform;
        }

        .product-state {
          animation: productFadeUp 0.6s ease-out both;
        }

        .product-pagination {
          animation: productFadeUp 0.7s ease-out both;
        }

        @keyframes productPageEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes productFadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes productSlideRight {
          from {
            opacity: 0;
            transform: translateX(-25px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes productCardEnter {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-page,
          .product-hero-content > *,
          .product-filter,
          .product-list-heading,
          .product-main,
          .product-card-animate,
          .product-state,
          .product-pagination {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .product-card-image {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Product;
