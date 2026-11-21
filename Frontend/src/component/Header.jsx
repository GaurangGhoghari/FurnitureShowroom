
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authcontext";
import { ShoppingCart, Heart, UserRound } from "lucide-react";
import { getCart, getFavorites } from "../api/api";

const Header = () => {
  const { currentUser, loading, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Fetch Cart Count - unchanged
  const fetchCartCount = useCallback(async () => {
    if (!currentUser || currentUser.role !== "user") {
      setCartCount(0);
      return;
    }

    try {
      const response = await getCart();
      const totalItems = Number(response.data?.totalItems) || 0;

      setCartCount(totalItems);
    } catch (error) {
      console.error(
        "Failed to fetch cart count:",
        error.response?.data || error.message
      );
    }
  }, [currentUser]);

  // Refresh Cart Count - unchanged
  useEffect(() => {
    if (loading) return;

    fetchCartCount();
  }, [loading, fetchCartCount, location.pathname]);

  useEffect(() => {
    const handleCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [fetchCartCount]);

  // Fetch Favorites Count from Database
  const fetchFavoriteCount = useCallback(async () => {
    if (!currentUser || currentUser.role !== "user") {
      setFavoriteCount(0);
      return;
    }

    try {
      const response = await getFavorites();
      const favorites = response.data?.favorites || [];

      setFavoriteCount(favorites.length);
    } catch (error) {
      console.error(
        "Failed to fetch favorites count:",
        error.response?.data || error.message
      );
    }
  }, [currentUser]);

  // Automatically refresh Favorites Count
  useEffect(() => {
    if (loading) return;

    fetchFavoriteCount();

    const handleFavoriteUpdate = () => {
      fetchFavoriteCount();
    };

    window.addEventListener(
      "favoritesUpdated",
      handleFavoriteUpdate
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoriteUpdate
      );
    };
  }, [loading, fetchFavoriteCount, location.pathname]);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Products", path: "/product" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getLinkClass = (path) =>
    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-amber-100 text-amber-900 font-semibold"
        : "text-stone-600 hover:text-amber-900 hover:bg-stone-100"
    }`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="min-h-20 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-amber-700 to-amber-950 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
              G
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-serif font-bold text-stone-900 tracking-wide">
                Gaurang Studio
              </h1>

              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold">
                Furniture Showroom
              </p>
            </div>
          </Link>

          {/* Desktop Navbar */}
          {!loading && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={getLinkClass(link.path)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Cart and Favorites */}
              {currentUser && currentUser.role === "user" && (
                <>
                  {/* Cart Icon + Count */}
                  <Link
                    to="/cart"
                    className={`${getLinkClass("/cart")} flex items-center gap-2`}
                    aria-label={`Cart, ${cartCount} items`}
                  >
                    <span className="relative inline-flex">
                      <ShoppingCart size={28} />

                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </span>
                  </Link>

                  {/* Favorite Icon + Count */}
                  <Link
                    to="/favorites"
                    className={`${getLinkClass("/favorites")} flex items-center gap-2`}
                    aria-label={`Favorites, ${favoriteCount} products`}
                  >
                    <span className="relative inline-flex">
                      <Heart size={28} />

                      {favoriteCount > 0 && (
                        <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                          {favoriteCount}
                        </span>
                      )}
                    </span>
                  </Link>
                </>
              )}

              {/* Guest Buttons */}
              {!currentUser && (
                <div className="flex items-center gap-2 ml-2">
                  <Link
                    to="/register"
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50 hover:border-amber-700 transition"
                  >
                    Register
                  </Link>

                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-xl bg-amber-800 text-white text-sm font-semibold shadow-sm hover:bg-amber-900 transition"
                  >
                    Login
                  </Link>
                </div>
              )}

              {/* Logged-in User */}
              {currentUser && !isAuthPage && (
                <div className="flex items-center gap-2 ml-2 border-l border-stone-200 pl-3">
                  {currentUser.role === "user" && (
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className={getLinkClass("/profile")}
                      aria-label="My Profile"
                      title="My Profile"
                    >
                      <UserRound size={22} />
                    </Link>
                  )}

                  {currentUser.role === "admin" && (
                    <Link
                      to="/admindashboard"
                      className="px-3 py-2 rounded-xl text-sm font-semibold bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold hover:bg-rose-100 transition"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* Logged-in user on Auth Pages */}
              {currentUser && isAuthPage && (
                <Link
                  to={
                    currentUser.role === "admin"
                      ? "/admindashboard"
                      : "/userdashboard"
                  }
                  className="px-4 py-2.5 rounded-xl bg-amber-800 text-white text-sm font-semibold hover:bg-amber-900 transition"
                >
                  Dashboard
                </Link>
              )}
            </nav>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-stone-200 text-stone-800 hover:bg-amber-50 transition"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {!loading && menuOpen && (
          <div className="md:hidden pb-4">
            <nav className="rounded-2xl border border-stone-200 bg-white shadow-lg p-3 space-y-1">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={getLinkClass(link.path)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Cart and Favorites */}
              {currentUser && currentUser.role === "user" && (
                <>
                  {/* Cart */}
                  <Link
                    to="/cart"
                    onClick={closeMenu}
                    className={`${getLinkClass("/cart")} flex items-center gap-3`}
                  >
                    <span className="relative inline-flex">
                      <ShoppingCart size={24} />

                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </span>

                    <span>Cart</span>
                  </Link>

                  {/* Favorites */}
                  <Link
                    to="/favorites"
                    onClick={closeMenu}
                    className={`${getLinkClass("/favorites")} flex items-center gap-3`}
                  >
                    <span className="relative inline-flex">
                      <Heart size={24} />

                      {favoriteCount > 0 && (
                        <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                          {favoriteCount}
                        </span>
                      )}
                    </span>

                    <span>Favorites</span>
                  </Link>
                </>
              )}

              <div className="border-t border-stone-100 my-2" />

              {/* Guest Actions */}
              {!currentUser && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="text-center px-3 py-3 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition"
                  >
                    Register
                  </Link>

                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="text-center px-3 py-3 rounded-xl bg-amber-800 text-white text-sm font-semibold hover:bg-amber-900 transition"
                  >
                    Login
                  </Link>
                </div>
              )}

              {/* Logged-in User Actions */}
              {currentUser && !isAuthPage && (
                <div className="space-y-2 pt-1">
                  <Link
                    to={
                      currentUser.role === "admin"
                        ? "/admindashboard"
                        : "/profile"
                    }
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded-xl bg-amber-50 text-amber-900 text-sm font-semibold hover:bg-amber-100 transition"
                  >
                    {currentUser.role === "admin"
                      ? "Admin Panel"
                      : "My Profile"}
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 transition"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* Logged-in user on Login/Register */}
              {currentUser && isAuthPage && (
                <Link
                  to={
                    currentUser.role === "admin"
                      ? "/admindashboard"
                      : "/userdashboard"
                  }
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded-xl bg-amber-800 text-white text-sm font-semibold text-center hover:bg-amber-900 transition"
                >
                  Go to Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;