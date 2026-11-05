import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Review from "../component/Review/Review";
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PackageSearch,
  Sofa,
  ShieldCheck,
  Truck,
  ImageOff,
} from "lucide-react";

import { addToCart, getProductById, getProducts } from "../api/api";

import { useAuth } from "../Context/authcontext";

const SERVER_URL = import.meta.env.VITE_API_URL.replace("/api", "");

// Convert different image formats into usable URLs
const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "object") {
    image = image.url || image.path || image.filename || image.image;
  }

  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();

  if (/^https?:\/\//i.test(value)) return value;

  if (value.startsWith("/")) {
    return `${SERVER_URL}${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `${SERVER_URL}/${value}`;
  }

  return `${SERVER_URL}/uploads/${value}`;
};

// Parse additional images from database
const getAdditionalImages = (images) => {
  if (!images) return [];

  let parsedImages = images;

  if (typeof parsedImages === "string") {
    try {
      parsedImages = JSON.parse(parsedImages);
    } catch (error) {
      console.error("Could not parse product images:", error);
      return [];
    }
  }

  if (!Array.isArray(parsedImages)) return [];

  return parsedImages.map(getImageUrl).filter(Boolean);
};

// Format price in INR
const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);

const Productdetails = () => {
  const { id } = useParams();

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState("");
  const [failedImages, setFailedImages] = useState([]);

  const [cartMessage, setCartMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details and same-category products
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setCategoryProducts([]);
        setSelectedImage("");
        setFailedImages([]);
        setCartMessage("");

        if (!id) {
          throw new Error("Product ID is missing.");
        }

        // Fetch selected product
        const response = await getProductById(id);
        const data = response?.data;

        const foundProduct =
          data?.product ?? data?.data?.product ?? data?.data ?? null;

        if (!foundProduct || typeof foundProduct !== "object") {
          throw new Error("Product not found.");
        }

        if (cancelled) return;

        setProduct(foundProduct);

        // Set main product image
        const mainImage = getImageUrl(foundProduct.image);
        const extraImages = getAdditionalImages(foundProduct.images);

        setSelectedImage(mainImage || extraImages[0] || "");

        // Fetch other products from same category
        const categoryName =
          typeof foundProduct.category === "object"
            ? foundProduct.category.name
            : foundProduct.category;

        if (categoryName) {
          const firstResponse = await getProducts({
            category: categoryName,
            page: 1,
            limit: 20,
          });

          const firstData = firstResponse?.data ?? firstResponse;

          let allProducts = firstData?.products || [];

          const totalPages = Number(firstData?.pagination?.totalPages) || 1;

          // Fetch remaining pages
          for (let page = 2; page <= totalPages; page++) {
            const nextResponse = await getProducts({
              category: categoryName,
              page,
              limit: 20,
            });

            const nextData = nextResponse?.data ?? nextResponse;

            allProducts = [...allProducts, ...(nextData?.products || [])];
          }

          if (!cancelled) {
            // Remove currently opened product
            const filteredProducts = allProducts.filter((item) => {
              const itemId = item.id ?? item._id;
              const currentId = foundProduct.id ?? foundProduct._id;

              return String(itemId) !== String(currentId);
            });

            setCategoryProducts(filteredProducts);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load product details.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Add selected product to cart
  const handleAddToCart = async (selectedProduct = product) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!selectedProduct) return;

    if (Number(selectedProduct.stock) <= 0) {
      setCartMessage("This product is out of stock.");
      return;
    }

    const productId = selectedProduct.id ?? selectedProduct._id;

    if (!productId) {
      setCartMessage("Product ID is missing.");
      return;
    }

    try {
      setAddingToCart(true);
      setCartMessage("");

      await addToCart(productId, 1);

      window.dispatchEvent(new Event("cartUpdated"));

      setCartMessage("Product added to cart successfully!");
    } catch (err) {
      setCartMessage(
        err.response?.data?.message || "Failed to add product to cart.",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FDFBF7] px-4 font-sans text-stone-800">
        <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800">
          <Sofa size={28} />
        </div>

        <p className="mt-4 font-serif text-lg font-bold text-stone-900">
          Loading product details...
        </p>

        <p className="mt-1 text-xs text-stone-500">
          Fetching showroom collection
        </p>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FDFBF7] px-6 py-16 text-center font-sans text-stone-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-400 shadow-sm">
          <PackageSearch size={28} />
        </div>

        <h2 className="mt-5 font-serif text-3xl font-bold tracking-wide text-stone-900 md:text-4xl">
          Product Not Found
        </h2>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
          {error || "This product is currently not available."}
        </p>

        <Link
          to="/product"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-amber-900"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </main>
    );
  }

  const stock = Number(product.stock) || 0;
  const mainImage = getImageUrl(product.image);

  // Main image + additional images without duplicates
  const allImages = [
    ...new Set(
      [mainImage, ...getAdditionalImages(product.images)].filter(Boolean),
    ),
  ];

  const imageFailed = (url) => failedImages.includes(url);

  const handleImageError = (url) => {
    setFailedImages((previous) =>
      previous.includes(url) ? previous : [...previous, url],
    );
  };

  const categoryName =
    typeof product.category === "object"
      ? product.category.name
      : product.category;

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-8 font-sans text-stone-800 sm:px-8 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500"
        >
          <Link to="/" className="hover:text-amber-800">
            Home
          </Link>

          <span className="text-stone-300">/</span>

          <Link to="/product" className="hover:text-amber-800">
            Products
          </Link>

          <span className="text-stone-300">/</span>

          <span className="truncate font-semibold text-stone-900">
            {product.name}
          </span>
        </nav>

        {/* Product details */}
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm md:grid-cols-2">
          {/* Image gallery */}
          <section className="border-b border-stone-200/80 bg-amber-50/40 p-4 sm:p-8 md:border-b-0 md:border-r md:p-10">
            <div className="relative flex min-h-300px items-center justify-center overflow-hidden rounded-2xl bg-white p-4 sm:min-h-420px">
              {selectedImage && !imageFailed(selectedImage) ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  onError={() => handleImageError(selectedImage)}
                  className="max-h-420px w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-stone-400">
                  <ImageOff size={42} strokeWidth={1.3} />

                  <span className="text-xs font-medium uppercase tracking-wider">
                    Image Not Available
                  </span>
                </div>
              )}

              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-900 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-800" />
                Furniture
              </span>
            </div>

            {/* Additional image thumbnails */}
            {allImages.length > 1 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  More Product Images ({allImages.length})
                </p>

                <div className="flex flex-wrap gap-3">
                  {allImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      aria-label={`View product image ${index + 1}`}
                      aria-pressed={selectedImage === image}
                      className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-white transition sm:h-24 sm:w-24 ${
                        selectedImage === image
                          ? "border-amber-800 ring-2 ring-amber-200"
                          : "border-stone-200 hover:border-amber-500"
                      }`}
                    >
                      {!imageFailed(image) ? (
                        <img
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          loading="lazy"
                          onError={() => handleImageError(image)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full flex-col items-center justify-center gap-1 text-stone-400">
                          <ImageOff size={18} />
                          <span className="text-[9px]">Unavailable</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {allImages.length === 1 && (
              <p className="mt-4 text-center text-xs text-stone-500">
                Main product image
              </p>
            )}
          </section>

          {/* Product information */}
          <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
            <div>
              <span className="inline-block rounded-full border border-amber-200/60 bg-amber-100/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
                Furniture Collection
              </span>

              <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-wide text-stone-900 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-5">
                <span className="text-3xl font-bold text-amber-800">
                  {formatPrice(product.price)}
                </span>

                <p className="mt-1 text-xs text-stone-500">
                  Inclusive of all taxes
                </p>
              </div>

              <div className="my-6 h-px bg-stone-200/80" />

              <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                Product Description
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-600 sm:text-base">
                {product.description ||
                  "Handcrafted with attention to detail, quality finishes, and everyday comfort for your home."}
              </p>

              {/* Stock availability */}
              <div className="mt-7 flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-[#FDFBF7] p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Stock Availability
                  </p>

                  <p
                    className={`mt-1 inline-flex items-center gap-1.5 text-sm font-semibold ${
                      stock > 0 ? "text-emerald-800" : "text-stone-500"
                    }`}
                  >
                    {stock > 0 ? (
                      <>
                        <CheckCircle2 size={15} />
                        In Stock ({stock} units)
                      </>
                    ) : (
                      <>
                        <AlertCircle size={15} />
                        Out of Stock
                      </>
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    Dispatch
                  </p>

                  <p className="mt-1 text-xs font-medium text-stone-700">
                    Surat Workshop
                  </p>
                </div>
              </div>

              {/* Service highlights */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-stone-200/60 bg-white p-3">
                  <ShieldCheck size={18} className="shrink-0 text-amber-800" />

                  <span className="text-xs font-medium text-stone-700">
                    Quality Guaranteed
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-stone-200/60 bg-white p-3">
                  <Truck size={18} className="shrink-0 text-amber-800" />

                  <span className="text-xs font-medium text-stone-700">
                    Careful Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Add to cart */}
            <div className="mt-8 border-t border-stone-200/80 pt-6">
              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                disabled={addingToCart || stock <= 0}
                className="mt-3 w-full rounded-xl bg-amber-900 px-4 py-3 font-semibold text-white transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={18} className="mr-2 inline" />

                {addingToCart
                  ? "Adding..."
                  : stock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"}
              </button>

              {cartMessage && (
                <p role="status" className="mt-3 text-center text-sm">
                  {cartMessage}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* PRODUCT REVIEWS */}
      <Review productId={product.id ?? product._id} />

      {/* RELATED PRODUCTS */}
      {categoryProducts.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl pb-12">
          <div className="mb-7 border-b border-stone-200 pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">
              Explore More
            </p>

            <h2 className="mt-2 font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
              More from {categoryName || "This"} Collection
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Discover more products from the same category.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryProducts.map((item) => {
              const image = getImageUrl(item.image);
              const productId = item.id ?? item._id;
              const itemStock = Number(item.stock) || 0;

              return (
                <article
                  key={productId}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link to={`/product/${productId}`}>
                    <div className="flex h-56 items-center justify-center bg-amber-50/50 p-4">
                      {image ? (
                        <img
                          src={image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ImageOff size={40} className="text-stone-400" />
                      )}
                    </div>

                    <div className="px-4 pt-4">
                      <h3 className="truncate font-serif text-lg font-bold text-stone-900 hover:text-amber-800">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-lg font-bold text-amber-800">
                        {formatPrice(item.price)}
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          itemStock > 0 ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {itemStock > 0
                          ? `In Stock (${itemStock})`
                          : "Out of Stock"}
                      </p>
                    </div>
                  </Link>

                  <div className="p-4 pt-3">
                    <button
                      type="button"
                      disabled={itemStock <= 0 || addingToCart}
                      onClick={() => handleAddToCart(item)}
                      className="flex w-full items-center justify-center rounded-xl bg-amber-900 px-4 py-3 font-semibold text-white transition hover:bg-amber-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
};

export default Productdetails;
