import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authcontext";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../api/api";

const Favorite = ({ product }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const productId = product?.id ?? product?._id;

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch favorite status
  useEffect(() => {
    let active = true;

    const loadFavorite = async () => {
      if (!currentUser || productId == null) {
        if (active) setIsFavorite(false);
        return;
      }

      try {
        const response = await getFavorites();
        const favorites = response.data?.favorites || [];

        const exists = favorites.some(
          (item) =>
            String(item.id ?? item._id) === String(productId)
        );

        if (active) setIsFavorite(exists);
      } catch (error) {
        console.error("Favorite fetch error:", error);
      }
    };

    loadFavorite();

    const handleFavoriteUpdate = (event) => {
      const detail = event.detail;

      if (
        detail &&
        String(detail.productId) === String(productId)
      ) {
        setIsFavorite(Boolean(detail.isFavorite));
      } else {
        loadFavorite();
      }
    };

    window.addEventListener("favoritesUpdated", handleFavoriteUpdate);

    return () => {
      active = false;
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoriteUpdate
      );
    };
  }, [currentUser, productId]);

  // Add or remove favorite
  const toggleFavorite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (productId == null || loading) return;

    const newStatus = !isFavorite;

    try {
      setLoading(true);

      if (newStatus) {
        await addFavorite(productId);
      } else {
        await removeFavorite(productId);
      }

      setIsFavorite(newStatus);

      window.dispatchEvent(
        new CustomEvent("favoritesUpdated", {
          detail: {
            productId,
            isFavorite: newStatus,
          },
        })
      );
    } catch (error) {
      console.error("Favorite update error:", error);
      alert(
        error.response?.data?.message ||
        "Could not update favorite."
      );
    } finally {
      setLoading(false);
    }
  };

  if (productId == null) return null;

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
      aria-pressed={isFavorite}
      className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 disabled:opacity-60"
    >
      <Heart
        size={20}
        className={
          isFavorite
            ? "fill-red-500 text-red-500"
            : "fill-none text-stone-600"
        }
      />
    </button>
  );
};

export default Favorite;