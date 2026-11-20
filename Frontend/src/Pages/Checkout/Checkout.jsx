
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCart } from "../../api/api";

import {
  MapPin,
  Phone,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CART
  // ==========================================
  const fetchCart = async () => {
    try {
      const response = await getCart();

      if (response.data.success) {
        setCart(response.data.items || []);
      } else {
        setCart([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load cart"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ==========================================
  // CALCULATE TOTAL
  // ==========================================
  const totalAmount = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  // ==========================================
  // CONTINUE TO PAYMENT PAGE
  // ==========================================
  const handleContinueToPayment = (e) => {
    e.preventDefault();
    setError("");

    if (!address.trim()) {
      setError("Please enter your shipping address");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10 digit phone number");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setPlacingOrder(true);

    // Send delivery details to Payment page
    navigate("/payment", {
      state: {
        shipping_address: address.trim(),
        phone: phone.trim(),
        totalAmount,
      },
    });
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FDFBF7] font-sans text-stone-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>

        <p className="mt-4 font-serif text-sm font-bold text-stone-900">
          Loading checkout suite...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8 font-sans text-stone-800 antialiased sm:px-6 lg:px-10">

      <div className="mx-auto max-w-6xl space-y-6">

        {/* BACK BUTTON */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 transition hover:text-amber-800"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </button>
        </div>

        {/* HEADING */}
        <div className="border-b border-stone-200/80 pb-6">

          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-800" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
              CraftStudio Showroom / Checkout
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Order Confirmation & Dispatch
          </h1>

          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            Provide your delivery details to continue to payment.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* EMPTY CART */}
        {cart.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-800">
              <ShoppingBag size={28} />
            </div>

            <h2 className="mt-4 font-serif text-2xl font-bold text-stone-900">
              Your Bag is Currently Empty
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Add products to your cart before checkout.
            </p>

            <button
              type="button"
              onClick={() => navigate("/product")}
              className="mt-6 rounded-xl bg-amber-800 px-7 py-3 text-xs font-semibold uppercase text-white hover:bg-amber-900"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">

            {/* SHIPPING FORM */}
            <form
              onSubmit={handleContinueToPayment}
              className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 lg:col-span-7"
            >

              <div className="flex items-center justify-between border-b border-stone-100 pb-4">

                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Shipping Details
                </h2>

                <span className="text-[11px] font-semibold uppercase text-amber-800">
                  Step 1 of 2
                </span>
              </div>

              {/* ADDRESS */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-stone-700">
                  <MapPin size={16} className="text-amber-800" />
                  Delivery Address *
                </label>

                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat / House No., Building Name, Street, Landmark, City, Pincode..."
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-[#FDFBF7] p-4 text-sm outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-800/10"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-stone-700">
                  <Phone size={16} className="text-amber-800" />
                  Contact Phone Number *
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="10 digit mobile number"
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-800/10"
                />
              </div>

              {/* CONTINUE BUTTON */}
              <button
                type="submit"
                disabled={placingOrder}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 py-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue to Payment
                <ArrowRight size={17} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                <ShieldCheck size={16} className="text-amber-800" />
                <span>Your delivery details are required to place your order.</span>
              </div>
            </form>

            {/* ORDER SUMMARY */}
            <aside className="lg:col-span-5 lg:sticky lg:top-8">

              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7">

                <div className="flex items-center justify-between border-b border-stone-100 pb-4">

                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    Order Summary
                  </h2>

                  <span className="text-xs font-semibold uppercase text-stone-400">
                    {cart.length} {cart.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* ITEMS */}
                <div className="divide-y divide-stone-100">

                  {cart.map((item) => (
                    <div
                      key={item.cart_item_id || item.product_id}
                      className="flex items-center justify-between gap-3 py-3.5"
                    >
                      <div className="min-w-0 pr-2">

                        <p className="truncate font-serif text-sm font-bold text-stone-900">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-xs text-stone-400">
                          Qty: {item.quantity} × ₹
                          {Number(item.price).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-stone-900">
                        ₹
                        {(
                          Number(item.price) * Number(item.quantity)
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}

                </div>

                {/* TOTAL */}
                <div className="mt-4 space-y-2.5 border-t border-stone-100 pt-4 text-xs sm:text-sm">

                  <div className="flex justify-between text-stone-600">
                    <span>Showroom Subtotal</span>

                    <span className="font-semibold text-stone-900">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Delivery</span>

                    <span className="font-semibold text-emerald-800">
                      Free
                    </span>
                  </div>

                  <div className="border-t border-stone-200 pt-3">

                    <div className="flex items-baseline justify-between">

                      <div>
                        <span className="text-xs font-semibold uppercase text-stone-500">
                          Total Payable
                        </span>

                        <p className="text-[10px] text-stone-400">
                          Inclusive of all taxes
                        </p>
                      </div>

                      <span className="font-serif text-2xl font-bold text-amber-900">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
