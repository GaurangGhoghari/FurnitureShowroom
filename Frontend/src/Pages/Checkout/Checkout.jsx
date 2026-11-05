
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder, getCart } from "../../api/api";
import {
  MapPin,
  Phone,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Truck,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // Fetch Cart
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

  // Calculate Total
  const totalAmount = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  // Place COD Order
  const handlePlaceOrder = async (e) => {
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

    // Razorpay is not integrated yet
    if (paymentMethod === "Online") {
      setError(
        "Online Payment with Razorpay is coming soon. Please select Cash on Delivery."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await placeOrder({
        shipping_address: address.trim(),
        phone: phone.trim(),
      });

      if (response.success) {
        alert("Your order has been placed successfully!");
        navigate("/my-orders");
      } else {
        setError(response.message || "Failed to place order");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // Loading
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

        {/* Back Button */}
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

        {/* Heading */}
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
            Provide your delivery details to complete your order.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-rose-600" />
            <span>{error}</span>
          </div>
        )}

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

            {/* Checkout Form */}
            <form
              onSubmit={handlePlaceOrder}
              className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 lg:col-span-7"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Shipping Details
                </h2>

                <span className="text-[11px] font-semibold uppercase text-amber-800">
                  Step 1 of 1
                </span>
              </div>

              {/* Address */}
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

              {/* Phone */}
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

              {/* Payment Method */}
              <div className="rounded-2xl border border-stone-200 bg-[#FDFBF7] p-5">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-700">
                  Select Payment Method
                </h3>

                <div className="space-y-3">

                  {/* COD */}
                  <label
                    className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 transition ${
                      paymentMethod === "COD"
                        ? "border-amber-800 bg-white shadow-sm"
                        : "border-stone-200 bg-white/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => {
                        setPaymentMethod("COD");
                        setError("");
                      }}
                      className="h-4 w-4 accent-amber-800"
                    />

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                      <Truck size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-serif text-sm font-bold text-stone-900">
                          Cash on Delivery
                        </p>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-800">
                          Available
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-stone-500">
                        Pay cash or UPI when your furniture is delivered.
                      </p>
                    </div>
                  </label>

                  {/* Razorpay */}
                  <label
                    className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 transition ${
                      paymentMethod === "Online"
                        ? "border-amber-800 bg-white shadow-sm"
                        : "border-stone-200 bg-white/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online"
                      checked={paymentMethod === "Online"}
                      onChange={() => {
                        setPaymentMethod("Online");
                        setError("");
                      }}
                      className="h-4 w-4 accent-amber-800"
                    />

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <CreditCard size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-serif text-sm font-bold text-stone-900">
                          Online Payment (Razorpay)
                        </p>

                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800">
                          Coming Soon
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-stone-500">
                        Debit Card, Credit Card, UPI and Net Banking.
                      </p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Place Order */}
              <button
                type="submit"
                disabled={placingOrder}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 py-4 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : paymentMethod === "Online" ? (
                  "Online Payment Coming Soon"
                ) : (
                  `Place Order — ₹${totalAmount.toLocaleString("en-IN")}`
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                <ShieldCheck size={16} className="text-amber-800" />
                <span>Secure order processing from Surat Workshop.</span>
              </div>
            </form>

            {/* Order Summary */}
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

                {/* Items */}
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

                {/* Total */}
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
