
import { Heart, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFavorites,
  removeFavorite,
  addToCart,
} from "../api/api";
import { useAuth } from "../Context/authcontext";

const Favorites = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [addingCartId, setAddingCartId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageProductId, setCartMessageProductId] = useState("");

  // Fetch favorites from database
  const fetchFavorites = useCallback(async () => {
    if (!currentUser) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getFavorites();
      setFavorites(response.data?.favorites || []);
    } catch (error) {
      console.error("Fetch favorites error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load favorites."
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Sync favorite changes from other pages
  useEffect(() => {
    const handleFavoriteUpdate = (event) => {
      const detail = event.detail;

      if (!detail) {
        fetchFavorites();
        return;
      }

      if (!detail.isFavorite) {
        setFavorites((previous) =>
          previous.filter(
            (item) =>
              String(item.id ?? item._id) !==
              String(detail.productId)
          )
        );
      } else {
        fetchFavorites();
      }
    };

    window.addEventListener("favoritesUpdated", handleFavoriteUpdate);

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoriteUpdate
      );
    };
  }, [fetchFavorites]);

  // Remove favorite using Heart icon
  const handleRemoveFavorite = async (productId) => {
    try {
      setRemovingId(productId);

      await removeFavorite(productId);

      setFavorites((previous) =>
        previous.filter(
          (product) =>
            String(product.id ?? product._id) !==
            String(productId)
        )
      );

      window.dispatchEvent(
        new CustomEvent("favoritesUpdated", {
          detail: {
            productId,
            isFavorite: false,
          },
        })
      );
    } catch (error) {
      console.error("Remove favorite error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to remove favorite."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // Add product to cart
  const handleAddToCart = async (product) => {
    const productId = product.id ?? product._id;

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (Number(product.stock) <= 0) {
      setCartMessage("This product is out of stock.");
      setCartMessageProductId(String(productId));
      return;
    }

    try {
      setAddingCartId(productId);
      setCartMessage("");
      setCartMessageProductId("");

      await addToCart(productId, 1);

      setCartMessage(
        `${product.name} added to cart successfully.`
      );
      setCartMessageProductId(String(productId));

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Add to cart error:", error);

      setCartMessage(
        error.response?.data?.message ||
          "Could not add product to cart."
      );
      setCartMessageProductId(String(productId));
    } finally {
      setAddingCartId(null);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-lg text-stone-600">
          Loading your favorites...
        </p>
      </div>
    );
  }

  // Login required
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-4">
        <Heart size={55} className="text-stone-400 mb-4" />

        <h2 className="text-2xl font-bold text-stone-800">
          Please Login
        </h2>

        <p className="text-stone-500 mt-2">
          Login to view your favorite products.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-5 rounded-lg bg-amber-800 px-6 py-3 text-white"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-8 flex items-center gap-3">
          <Heart
            size={32}
            className="fill-red-500 text-red-500"
          />

          <div>
            <h1 className="text-3xl font-bold text-stone-800">
              My Favorites
            </h1>

            <p className="mt-1 text-sm text-stone-500">
              {favorites.length} saved products
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {errorMessage}
          </div>
        )}

        {/* Empty Favorites */}
        {favorites.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white px-5 py-16 text-center">
            <Heart
              size={60}
              className="mx-auto mb-4 text-stone-300"
            />

            <h2 className="text-2xl font-semibold text-stone-800">
              No Favorite Products Yet
            </h2>

            <p className="mt-2 text-stone-500">
              Products you add to favorites will appear here.
            </p>

            <button
              onClick={() => navigate("/product")}
              className="mt-6 inline-block rounded-lg bg-amber-800 px-7 py-3 text-white hover:bg-amber-900"
            >
              Explore Products
            </button>
          </div>
        ) : (

          /* Favorite Products */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {favorites.map((product) => {
              const productId = product.id ?? product._id;

              return (
                <div
                  key={productId}
                  className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-lg"
                >

                  {/* Product Image */}
                  <div className="relative h-64 bg-stone-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    {/* Favorite Heart Icon */}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFavorite(productId)
                      }
                      disabled={removingId === productId}
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Heart
                        size={21}
                        className="fill-red-500 text-red-500"
                      />
                    </button>
                  </div>

                  {/* Product Information */}
                  <div className="p-4">

                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-800">
                      {product.category}
                    </p>

                    <h2 className="text-lg font-semibold text-stone-800">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-xl font-bold text-stone-900">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>

                    <p className="mt-2 text-sm text-stone-500">
                      {Number(product.stock) > 0
                        ? `In Stock: ${product.stock}`
                        : "Out of Stock"}
                    </p>

                    {/* Add to Cart Button */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={
                          addingCartId === productId ||
                          Number(product.stock) <= 0
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-800 px-4 py-3 text-sm font-medium text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShoppingCart size={18} />

                        {addingCartId === productId
                          ? "Adding..."
                          : Number(product.stock) <= 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                      </button>

                      {cartMessageProductId === String(productId) &&
                        cartMessage && (
                          <p className="mt-2 text-center text-sm text-amber-800">
                            {cartMessage}
                          </p>
                        )}
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;