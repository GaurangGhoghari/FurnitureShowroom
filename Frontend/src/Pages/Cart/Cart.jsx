import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  AlertCircle,
  Sofa,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { getCart, updateCartItem, removeCartItem } from "../../api/api";

const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "";

  if (/^blob:/i.test(image)) return image;

  if (/^https?:\/\//i.test(image)) {
    try {
      const parsedUrl = new URL(image);

      if (
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname === "127.0.0.1"
      ) {
        return `${SERVER_URL}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }

      return image;
    } catch {
      return image;
    }
  }

  return `${SERVER_URL}/${image.replace(/^\/+/, "")}`;
};

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setError("");
      const response = await getCart();
      setItems(response.data.items || []);
    } catch (err) {
      console.error("Fetch Cart Error:", err);
      setError(
        err.response?.data?.message || "Failed to load your cart items.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate total quantity
  const totalItems = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  // Calculate total price
  const totalAmount = items.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  // Update quantity
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    if (newQuantity > Number(item.stock)) {
      alert(`Only ${item.stock} items are available in showroom inventory.`);
      return;
    }

    try {
      setUpdatingId(item.cart_item_id);
      setError("");

      await updateCartItem(item.cart_item_id, newQuantity);
      window.dispatchEvent(new Event("cartUpdated"));
      setItems((prevItems) =>
        prevItems.map((cartItem) =>
          cartItem.cart_item_id === item.cart_item_id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem,
        ),
      );
    } catch (err) {
      console.error("Update Quantity Error:", err);
      setError(
        err.response?.data?.message || "Failed to update item quantity.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (id) => {
    try {
      setUpdatingId(id);
      setError("");

      await removeCartItem(id);

      setItems((prevItems) =>
        prevItems.filter((item) => item.cart_item_id !== id),
      );
    } catch (err) {
      console.error("Remove Cart Item Error:", err);
      setError(
        err.response?.data?.message || "Failed to remove item from cart.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <main className="flex min-h-[75vh] flex-col items-center justify-center bg-[#FDFBF7] px-6 text-center font-sans text-stone-800">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800 shadow-sm">
          <ShoppingBag size={28} className="animate-pulse" />
        </div>
        <h2 className="mt-5 font-serif text-xl font-bold tracking-wide text-stone-900">
          Loading your showroom bag...
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Retrieving your handcrafted furniture selections
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        {error && (
          <div
            role="alert"
            className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-200/90 bg-rose-50/80 p-4 text-xs font-medium text-rose-800 shadow-xs"
          >
            <AlertCircle size={18} className="shrink-0 text-rose-700" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {items.length === 0 ? (
          /* Empty State */
          <div className="mx-auto max-w-xl rounded-3xl border border-stone-200/80 bg-white p-10 text-center shadow-xs md:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50 text-amber-800">
              <Sofa size={30} strokeWidth={1.5} />
            </div>

            <h2 className="mt-6 font-serif text-2xl font-bold tracking-wide text-stone-900 md:text-3xl">
              Your bag is currently empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-stone-500 sm:text-sm">
              Discover our signature wooden lounge chairs, crafted dining
              suites, and tailored modular sofas to start furnishing your space.
            </p>

            <Link
              to="/product"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-amber-900 active:scale-[0.99]"
            >
              Explore Collection
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          /* Two Column Layout */
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            {/* Left: Product List */}
            <div className="space-y-6 lg:col-span-8">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-serif text-xl font-bold tracking-wide text-stone-900 sm:text-2xl">
                    Selected Pieces
                  </h2>
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    ({totalItems} {totalItems === 1 ? "unit" : "units"})
                  </span>
                </div>

                <Link
                  to="/product"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 transition-colors hover:text-amber-900 hover:underline"
                >
                  <ArrowLeft size={14} />
                  Continue Browsing
                </Link>
              </div>

              {/* Items Card List */}
              <div className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
                {items.map((item) => {
                  const imageSrc = getImageUrl(item.image);
                  const isUpdating = updatingId === item.cart_item_id;

                  return (
                    <article
                      key={item.cart_item_id}
                      className="group flex flex-col gap-5 p-5 transition-colors hover:bg-amber-50/20 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      {/* Product Visual & Info */}
                      <div className="flex items-start gap-4 sm:items-center">
                        <div className="relative aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-stone-200/80 bg-amber-50/50 sm:h-28 sm:w-28">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-stone-100 text-stone-400">
                              <Sofa size={24} strokeWidth={1.3} />
                              <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-amber-800">
                            CraftStudio Signature
                          </span>

                          <h3 className="line-clamp-1 font-serif text-base font-bold text-stone-900 sm:text-lg">
                            {item.name}
                          </h3>

                          <p className="text-sm font-bold text-amber-900">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>

                          <div className="pt-1">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                                Number(item.stock) > 0
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  Number(item.stock) > 0
                                    ? "bg-emerald-600"
                                    : "bg-rose-600"
                                }`}
                              />
                              {Number(item.stock) > 0
                                ? `${item.stock} in showroom`
                                : "Awaiting restock"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Pricing Controls */}
                      <div className="flex items-center justify-between gap-6 border-t border-stone-100 pt-4 sm:border-0 sm:pt-0">
                        {/* Stepper */}
                        <div className="flex items-center rounded-xl border border-stone-200/80 bg-[#FDFBF7] p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                Number(item.quantity) - 1,
                              )
                            }
                            disabled={Number(item.quantity) <= 1 || isUpdating}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 transition hover:bg-white hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="min-w-9 text-center text-xs font-bold text-stone-900">
                            {isUpdating ? "..." : item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                Number(item.quantity) + 1,
                              )
                            }
                            disabled={
                              Number(item.quantity) >= Number(item.stock) ||
                              isUpdating
                            }
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-600 transition hover:bg-white hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            Item Total
                          </p>
                          <p className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                            ₹
                            {(
                              Number(item.price) * Number(item.quantity)
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          disabled={isUpdating}
                          aria-label="Remove item"
                          className="rounded-xl border border-stone-200/70 p-2.5 text-stone-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-95 disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Guarantees & Studio Notes */}
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-800">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Artisan Wood
                    </h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">
                      Seasoned timber inspected prior to packaging.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-800">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Dedicated Transport
                    </h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">
                      Careful doorstep handling across Surat.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-800">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Studio Warranty
                    </h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">
                      Complete architectural & joinery support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Card (Sticky) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-8">
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-8">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                      Order Summary
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold tracking-wide text-stone-900">
                      Checkout Total
                    </h3>
                  </div>
                  <CreditCard size={22} className="text-stone-400" />
                </div>

                <div className="mt-5 space-y-3.5 text-xs text-stone-600 sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span>Total Selected Units</span>
                    <span className="font-semibold text-stone-900">
                      {totalItems} items
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Showroom Subtotal</span>
                    <span className="font-semibold text-stone-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Delivery Handling</span>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Calculated at inquiry
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-stone-200/80 pt-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                        Final Total
                      </p>
                      <p className="text-[11px] text-stone-400">
                        (Inclusive of applicable taxes)
                      </p>
                    </div>
                    <span className="font-serif text-2xl font-bold text-amber-900 sm:text-3xl">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-amber-900 active:scale-[0.99]"
                >
                  Proceed to Checkout
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-stone-400">
                  Direct dispatch from Katargam workshop. Items are placed on
                  immediate hold upon checkout confirmation.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
