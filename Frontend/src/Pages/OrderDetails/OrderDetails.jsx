import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderDetails } from "../../api/api";

import {
  ArrowLeft,
  Package,
  CalendarDays,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Loader2,
  ShoppingBag,
} from "lucide-react";

const SERVER_URL = (
  import.meta.env.VITE_SERVER_URL  ||
  (import.meta.env.VITE_API_URL).replace(/\/api\/?$/, "")
).replace(/\/+$/, "");

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

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrderDetails(id);

      if (response.success) {
        setOrder(response.order);
      } else {
        setError(response.message || "Order not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "border border-amber-200/80 bg-amber-50 text-amber-800",
      Confirmed: "border border-amber-200/80 bg-amber-100/70 text-amber-900",
      Processing: "border border-stone-200 bg-stone-100 text-stone-700",
      Shipped: "border border-sky-200 bg-sky-50 text-sky-800",
      "Out for Delivery": "border border-sky-200 bg-sky-50 text-sky-800",
      Delivered: "border border-emerald-200 bg-emerald-50 text-emerald-800",
      Cancelled: "border border-rose-200 bg-rose-50 text-rose-700",
    };

    return (
      styles[status] || "border border-stone-200 bg-stone-100 text-stone-700"
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FDFBF7] font-sans text-stone-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800 shadow-2xs">
          <Loader2 className="h-7 w-7 animate-spin text-amber-800" />
        </div>
        <p className="mt-4 font-serif text-sm font-bold text-stone-900">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FDFBF7] px-4 font-sans text-stone-800">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-stone-200/80 bg-white shadow-2xs">
          <Package size={32} className="text-stone-400" />
        </div>

        <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-stone-900">
          {error || "Order not found"}
        </h2>

        <button
          onClick={() => navigate("/my-orders")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98]"
        >
          <ArrowLeft size={16} />
          Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8 font-sans text-stone-800 antialiased sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate("/my-orders")}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 transition hover:text-amber-800"
          >
            <ArrowLeft size={16} />
            Back to My Orders
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-800" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                CraftStudio / Order Summary
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Order Details
            </h1>

            <p className="mt-1 text-xs text-stone-500">
              Reference ID: #{order.id}
            </p>
          </div>

          <span
            className={`inline-flex w-fit items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs ${getStatusStyle(
              order.status,
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* Order Information Quick Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-800">
              <CalendarDays size={18} />
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Order Placed
            </p>

            <p className="mt-0.5 text-sm font-semibold text-stone-800">
              {formatDate(order.created_at)}
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-800">
              <CreditCard size={18} />
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Payment Method
            </p>

            <p className="mt-0.5 text-sm font-semibold text-stone-800">
              {order.payment_method}
            </p>

            <p className="mt-0.5 text-[11px] font-medium text-stone-500">
              Status: {order.payment_status}
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-800">
              <Truck size={18} />
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Dispatch State
            </p>

            <p className="mt-0.5 text-sm font-semibold text-stone-800">
              {order.status}
            </p>

            <p className="mt-0.5 text-[11px] font-medium text-stone-500">
              Katargam Showroom Fulfillment
            </p>
          </div>
        </div>

        {/* Content Columns: Products List + Shipping & Summary */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Ordered Products Section */}
          <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs lg:col-span-7">
            <div className="border-b border-stone-100 p-6">
              <h2 className="flex items-center gap-2.5 font-serif text-lg font-bold tracking-tight text-stone-900">
                <ShoppingBag className="text-amber-800" size={20} />
                Ordered Pieces ({order.items?.length || 0})
              </h2>
            </div>

            <div className="divide-y divide-stone-100 p-6 space-y-5">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 pt-5 first:pt-0"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-amber-50/50">
                    {item.product_image ? (
                      <img
                        src={getImageUrl(item.product_image)}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-400">
                        <Package size={22} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-800">
                      CraftStudio Original
                    </span>

                    <h3 className="font-serif text-base font-bold text-stone-900">
                      {item.product_name}
                    </h3>

                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-stone-500">
                      <span>
                        Price:{" "}
                        <strong className="text-stone-800">
                          {formatPrice(item.price)}
                        </strong>
                      </span>
                      <span>
                        Qty:{" "}
                        <strong className="text-stone-800">
                          {item.quantity}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      Item Total
                    </p>
                    <p className="font-serif text-base font-bold text-amber-900">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary Sidebar */}
          <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-8">
            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-7">
              <h2 className="mb-5 font-serif text-lg font-bold tracking-tight text-stone-900">
                Delivery Coordinates
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-stone-200/70 bg-[#FDFBF7] p-4">
                  <MapPin
                    className="mt-0.5 shrink-0 text-amber-800"
                    size={18}
                  />

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                      Destination Address
                    </p>

                    <p className="mt-1 whitespace-pre-line text-xs font-medium leading-relaxed text-stone-800">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-[#FDFBF7] p-4">
                  <Phone className="shrink-0 text-amber-800" size={18} />

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                      Contact Number
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-stone-800">
                      {order.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="mt-6 border-t border-stone-100 pt-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Total Amount
                    </span>
                    <p className="text-[10px] text-stone-400">
                      (Includes all taxes & delivery)
                    </p>
                  </div>

                  <span className="font-serif text-2xl font-bold text-amber-900">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/order-tracking/${order.id}`)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98]"
              >
                <Truck size={16} />
                Track Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
