
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  getCart,
  placeOrder,
  createDemoPaymentOrder,
  completeDemoPayment,
} from "../api/api";

import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lock,
  Wallet,
  PackageCheck,
} from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const shippingDetails = location.state || {};

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState(null);

  // ==========================================
  // CHECK SHIPPING DETAILS
  // ==========================================
  useEffect(() => {
    if (
      !shippingDetails.shipping_address ||
      !shippingDetails.phone
    ) {
      navigate("/checkout", { replace: true });
    }
  }, [shippingDetails, navigate]);

  // ==========================================
  // FETCH CART
  // ==========================================
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart();

        if (response.data?.success) {
          setCart(response.data.items || []);
        } else {
          setCart([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load cart"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // ==========================================
  // TOTAL AMOUNT
  // ==========================================
  const totalAmount = cart.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  // ==========================================
  // CARD VALIDATION
  // ==========================================
  const validateCard = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, "");

    if (!/^[0-9]{16}$/.test(cleanCardNumber)) {
      setError("Please enter a valid 16 digit demo card number");
      return false;
    }

    if (!cardName.trim()) {
      setError("Please enter card holder name");
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
      setError("Please enter expiry in MM/YY format");
      return false;
    }

    const [month, year] = expiry.split("/").map(Number);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    if (
      year < currentYear ||
      (year === currentYear && month < currentMonth)
    ) {
      setError("Please enter a valid future expiry date");
      return false;
    }

    if (!/^[0-9]{3,4}$/.test(cvv)) {
      setError("Please enter a valid demo CVV");
      return false;
    }

    return true;
  };

  // ==========================================
  // COMPLETE PAYMENT
  // ==========================================
  const handlePayment = async () => {
    if (processing || success) return;

    setError("");

    if (!cart.length) {
      setError("Your cart is empty");
      return;
    }

    if (
      !shippingDetails.shipping_address ||
      !shippingDetails.phone
    ) {
      navigate("/checkout", { replace: true });
      return;
    }

    if (paymentMethod === "Card" && !validateCard()) {
      return;
    }

    try {
      setProcessing(true);

      const orderData = {
        shipping_address: shippingDetails.shipping_address,
        phone: shippingDetails.phone,
      };

      // ======================================
      // COD ORDER
      // ======================================
      if (paymentMethod === "COD") {
        const response = await placeOrder(orderData);

        if (response.success) {
          setSuccessOrderId(
            response.orderId || response.order_id
          );
          setSuccess(true);
          return;
        }

        setError(
          response.message || "Unable to place COD order"
        );
        return;
      }

      // ======================================
      // CREATE CARD / ONLINE DEMO ORDER
      // ======================================
      const createResponse = await createDemoPaymentOrder({
        ...orderData,
        payment_method: paymentMethod,
      });

      if (!createResponse.success) {
        setError(
          createResponse.message || "Unable to create demo order"
        );
        return;
      }

      const orderId =
        createResponse.orderId || createResponse.order_id;

      if (!orderId) {
        setError("Order ID was not received from server");
        return;
      }

      // ======================================
      // COMPLETE DEMO PAYMENT
      // ======================================
      const paymentResponse = await completeDemoPayment(
        orderId,
        "success"
      );

      const paymentStatus =
        paymentResponse.paymentStatus ||
        paymentResponse.payment_status;

      if (
        paymentResponse.success &&
        paymentStatus === "Paid"
      ) {
        setSuccessOrderId(
          paymentResponse.orderId ||
          paymentResponse.order_id ||
          orderId
        );

        setSuccess(true);
        return;
      }

      setError(
        paymentResponse.message ||
          "Demo payment could not be completed"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F7F8FA]">
        <Loader2 className="h-9 w-9 animate-spin text-blue-700" />
      </div>
    );
  }

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>

          <h1 className="mt-6 font-serif text-3xl font-bold text-stone-900">
            {paymentMethod === "COD"
              ? "Order Placed!"
              : "Payment Successful!"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-500">
            {paymentMethod === "COD"
              ? "Your Cash on Delivery order has been placed successfully."
              : `Your ${paymentMethod} demo payment was successful. Your order is confirmed.`}
          </p>

          {successOrderId && (
            <div className="mt-6 rounded-2xl bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-wider text-stone-500">
                Order ID
              </p>

              <p className="mt-1 text-xl font-bold text-stone-900">
                #{successOrderId}
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700">
            <PackageCheck size={19} />
            Thank you for shopping with CraftStudio!
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/my-orders", { replace: true })
            }
            className="mt-8 w-full rounded-xl bg-blue-700 py-4 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAYMENT PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F7F8FA] px-4 py-8 font-sans text-stone-800 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Back to Checkout
          </button>

          <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
            <Lock size={16} />
            Secure Checkout
          </div>
        </div>

        {/* PAGE TITLE */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            CraftStudio / Payment
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900 sm:text-4xl">
            Complete Your Payment
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Choose your preferred payment method to complete your order.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <div className="grid gap-7 lg:grid-cols-12 lg:items-start">

          {/* PAYMENT METHODS */}
          <div className="space-y-5 lg:col-span-7">
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">

              <div className="mb-6 border-b border-stone-100 pb-4">
                <h2 className="text-lg font-bold text-stone-900">
                  Select Payment Method
                </h2>

                <p className="mt-1 text-xs text-stone-500">
                  All card and online payments on this page are simulated demos.
                </p>
              </div>

              <div className="space-y-3">

                {/* COD */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("COD");
                    setError("");
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "COD"
                      ? "border-blue-700 bg-blue-50/60 ring-1 ring-blue-700"
                      : "border-stone-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                    <Truck size={24} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-stone-900">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      Pay when your order is delivered.
                    </p>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      paymentMethod === "COD"
                        ? "border-blue-700 bg-blue-700"
                        : "border-stone-300"
                    }`}
                  >
                    {paymentMethod === "COD" && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                </button>

                {/* CARD */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("Card");
                    setError("");
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "Card"
                      ? "border-blue-700 bg-blue-50/60 ring-1 ring-blue-700"
                      : "border-stone-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <CreditCard size={24} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-stone-900">
                      Debit / Credit Card
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      Visa, Mastercard and other cards (Demo).
                    </p>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      paymentMethod === "Card"
                        ? "border-blue-700 bg-blue-700"
                        : "border-stone-300"
                    }`}
                  >
                    {paymentMethod === "Card" && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                </button>

                {/* ONLINE */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("Online");
                    setError("");
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    paymentMethod === "Online"
                      ? "border-blue-700 bg-blue-50/60 ring-1 ring-blue-700"
                      : "border-stone-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Smartphone size={24} />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-stone-900">
                      Online Payment
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      UPI, Net Banking and Wallet (Demo).
                    </p>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      paymentMethod === "Online"
                        ? "border-blue-700 bg-blue-700"
                        : "border-stone-300"
                    }`}
                  >
                    {paymentMethod === "Online" && (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                </button>
              </div>

              {/* CARD DETAILS */}
              {paymentMethod === "Card" && (
                <div className="mt-6 rounded-2xl border border-stone-200 bg-[#F8FAFC] p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-stone-900">
                      Demo Card Details
                    </h3>

                    <CreditCard className="text-blue-700" size={22} />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-stone-600">
                        Card Number
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 16)
                              .replace(/(.{4})/g, "$1 ")
                              .trim()
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-stone-600">
                        Card Holder Name
                      </label>

                      <input
                        type="text"
                        autoComplete="off"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-stone-600">
                          Expiry Date
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={expiry}
                          onChange={(e) => {
                            let value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);

                            if (value.length > 2) {
                              value =
                                value.slice(0, 2) +
                                "/" +
                                value.slice(2);
                            }

                            setExpiry(value);
                          }}
                          placeholder="MM/YY"
                          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-stone-600">
                          CVV
                        </label>

                        <input
                          type="password"
                          inputMode="numeric"
                          autoComplete="off"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4)
                            )
                          }
                          placeholder="123"
                          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-blue-700">
                      Demo only: use any 16 digits, future MM/YY and 3 or 4 digit CVV. Do not enter real card details.
                    </p>
                  </div>
                </div>
              )}

              {/* ONLINE DETAILS */}
              {paymentMethod === "Online" && (
                <div className="mt-6 rounded-2xl border border-stone-200 bg-[#F8FAFC] p-5">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-emerald-700" size={24} />

                    <div>
                      <h3 className="font-bold text-stone-900">
                        Online Demo Gateway
                      </h3>

                      <p className="mt-1 text-xs text-stone-500">
                        UPI / Net Banking / Wallet simulation
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-800">
                      Demo Payment
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Clicking the payment button will simulate a successful online payment. No bank, UPI app or real payment gateway is connected.
                    </p>
                  </div>
                </div>
              )}

              {/* COD DETAILS */}
              {paymentMethod === "COD" && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Truck size={20} />

                    <p className="text-sm font-bold">
                      Pay after delivery
                    </p>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    Your order will be placed now. You can pay when your furniture is delivered.
                  </p>
                </div>
              )}

              {/* DEMO NOTICE */}
              {paymentMethod !== "COD" && (
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />

                  This is a local demo payment. It is not a real Razorpay transaction.
                </div>
              )}

              {/* PAY BUTTON */}
              <button
                type="button"
                disabled={processing || cart.length === 0}
                onClick={handlePayment}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-4 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "COD" ? (
                  <>
                    <Truck size={19} />
                    Place COD Order
                  </>
                ) : (
                  <>
                    <Lock size={17} />
                    Pay ₹{totalAmount.toLocaleString("en-IN")}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-400">
                <ShieldCheck size={16} />
                Secure Demo Order Processing
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="border-b border-stone-100 pb-4 font-serif text-xl font-bold text-stone-900">
                Order Summary
              </h2>

              <div className="mt-3 divide-y divide-stone-100">
                {cart.map((item) => (
                  <div
                    key={item.cart_item_id || item.product_id}
                    className="flex items-center justify-between gap-3 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Qty: {item.quantity}
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

              <div className="mt-4 space-y-3 border-t border-stone-100 pt-4 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>

                  <span className="font-semibold text-stone-900">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span>

                  <span className="font-semibold text-emerald-700">
                    FREE
                  </span>
                </div>

                <div className="flex justify-between border-t border-stone-200 pt-4">
                  <span className="font-bold text-stone-900">
                    Total Amount
                  </span>

                  <span className="font-serif text-2xl font-bold text-blue-800">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* SHIPPING DETAILS */}
              <div className="mt-6 rounded-2xl bg-stone-50 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-600">
                  Delivery Details
                </h3>

                <p className="text-sm font-semibold text-stone-900">
                  {shippingDetails.phone}
                </p>

                <p className="mt-2 text-xs leading-5 text-stone-600">
                  {shippingDetails.shipping_address}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Payment;
