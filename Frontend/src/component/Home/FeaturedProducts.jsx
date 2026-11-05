
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getFeaturedProducts } from "../../api/api";
import Favorite from "../../component/Favorite";
import { Search } from "lucide-react";

const FAVORITES_KEY = "furniture_favorites";

const getSavedFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const formatPrice = (price) =>
  `₹ ${Number(price || 0).toLocaleString("en-IN")}`;

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlist, setWishlist] = useState(getSavedFavorites);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sectionRef = useRef(null);

  // Fetch active products from MySQL database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getFeaturedProducts();

        setProducts(
          Array.isArray(response.data?.products)
            ? response.data.products
            : []
        );
      } catch (err) {
        console.error("Fetch Products Error:", err);

        setError(
          err.response?.data?.message ||
            "Products load failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Sync wishlist count when favorites change
  useEffect(() => {
    const syncFavorites = () => {
      setWishlist(getSavedFavorites());
    };

    window.addEventListener("favoritesUpdated", syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener("favoritesUpdated", syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  // Scroll reveal animation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("featured-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
      }
    );

    const elements = section.querySelectorAll(".featured-reveal");

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [loading, error, products.length, searchTerm]);

  // Search actual database products
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );
  });

  return (
    <section
      ref={sectionRef}
      className="featured-section overflow-hidden bg-stone-50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="featured-reveal mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Crafted for Your Home
            </p>

            <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">
              Featured Products
            </h2>

            <p className="mt-3 max-w-xl text-stone-600">
              Discover furniture available in our showroom.
            </p>
          </div>

          <Link
            to="/product"
            className="featured-view-btn inline-flex items-center justify-center rounded-lg border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 transition-all duration-300 hover:-translate-y-1 hover:border-amber-700 hover:bg-amber-700 hover:text-white hover:shadow-lg"
          >
            View All Products
            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        {/* Search and Counts */}
        <div className="featured-reveal mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="featured-search relative w-full sm:max-w-md">
            <Search
              size={18}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 focus:shadow-md"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-700" />

            <p className="mt-4 text-stone-600">
              Loading products from database...
            </p>
          </div>
        )}

        {/* API Error */}
        {!loading && error && (
          <div className="featured-reveal rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">{error}</p>

            <p className="mt-2 text-sm text-red-600">
              Please check whether your backend server is running.
            </p>
          </div>
        )}

        {/* Empty Database */}
        {!loading && !error && products.length === 0 && (
          <div className="featured-reveal rounded-xl border border-stone-200 bg-white px-6 py-14 text-center">
            <div className="mb-3 text-4xl">🪑</div>

            <h3 className="text-xl font-semibold text-stone-900">
              No Products Available
            </h3>

            <p className="mt-2 text-stone-600">
              Active products added in the showroom will appear here.
            </p>
          </div>
        )}

        {/* No Search Results */}
        {!loading &&
          !error &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <div className="featured-reveal rounded-xl border border-stone-200 bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-semibold text-stone-900">
                No matching products found
              </h3>

              <p className="mt-2 text-stone-600">
                Try searching with another product name.
              </p>
            </div>
          )}

        {/* Actual Database Products */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const outOfStock = Number(product.stock) <= 0;

              return (
                <article
                  key={product.id ?? product._id}
                  style={{ "--card-index": index }}
                  className="featured-reveal featured-card group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-amber-200 hover:shadow-2xl"
                >
                  {/* Product Image */}
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                    {product.image ? (
                      <Link
                        to={`/product/${product.id ?? product._id}`}
                        className="block h-full w-full"
                        aria-label={`View details of ${product.name}`}
                      >
                        <img
                          src={product.image}
                          alt={product.name || "Furniture product"}
                          loading="lazy"
                          className="featured-product-image h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </Link>
                    ) : (
                      <Link
                        to={`/product/${product.id ?? product._id}`}
                        className="flex h-full items-center justify-center text-stone-400 transition-transform duration-500 group-hover:scale-110"
                        aria-label={`View details of ${product.name}`}
                      >
                        <span className="text-5xl">🪑</span>
                      </Link>
                    )}

                    {/* Shared Favorite Component */}
                    <Favorite product={product} />

                    {/* Stock Status */}
                    <span
                      className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${
                        outOfStock
                          ? "bg-red-100 text-red-700"
                          : "bg-white/95 text-stone-700"
                      }`}
                    >
                      {outOfStock ? "Out of Stock" : `Stock: ${product.stock}`}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <h3 className="line-clamp-1 text-lg font-semibold text-stone-900">
                      <Link
                        to={`/product/${product.id ?? product._id}`}
                        className="transition-colors duration-300 hover:text-amber-700"
                      >
                        {product.name}
                      </Link>
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-stone-600">
                      {product.description ||
                        "Quality furniture for your home."}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xl font-bold text-amber-800 transition-colors duration-300 group-hover:text-amber-950">
                        {formatPrice(product.price)}
                      </p>

                      <span className="text-xs font-medium text-stone-500">
                        In showroom
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured Products Animations */}
      <style>{`
        .featured-reveal {
          opacity: 0;
          transform: translateY(35px);
          transition: opacity 0.75s ease, transform 0.75s ease;
        }

        .featured-reveal.featured-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .featured-card {
          transition:
            opacity 0.75s ease,
            transform 0.75s ease,
            box-shadow 0.4s ease,
            border-color 0.4s ease;
          transition-delay: calc(var(--card-index, 0) * 100ms);
        }

        .featured-search {
          transition: transform 0.3s ease;
        }

        .featured-search:focus-within {
          transform: translateY(-3px);
        }

        .featured-view-btn:hover span {
          transform: translateX(4px);
        }

        @media (prefers-reduced-motion: reduce) {
          .featured-reveal,
          .featured-card,
          .featured-product-image,
          .featured-search {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;