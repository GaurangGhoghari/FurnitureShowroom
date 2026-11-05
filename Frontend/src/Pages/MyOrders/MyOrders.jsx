import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../../api/api";
import {
  Package,
  CalendarDays,
  IndianRupee,
  Eye,
  Truck,
  Loader2,
  ShoppingBag,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders();

      if (response.success) {
        setOrders(response.orders || []);
      } else {
        setOrders([]);
        setError(response.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "border border-amber-200/80 bg-amber-50 text-amber-800";

      case "Confirmed":
        return "border border-amber-200/80 bg-amber-100/70 text-amber-900";

      case "Processing":
        return "border border-stone-200 bg-stone-100 text-stone-700";

      case "Shipped":
      case "Out for Delivery":
        return "border border-sky-200 bg-sky-50 text-sky-800";

      case "Delivered":
        return "border border-emerald-200 bg-emerald-50 text-emerald-800";

      case "Cancelled":
        return "border border-rose-200 bg-rose-50 text-rose-700";

      default:
        return "border border-stone-200 bg-stone-100 text-stone-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FDFBF7] font-sans text-stone-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800 shadow-2xs">
          <Loader2 className="h-7 w-7 animate-spin text-amber-800" />
        </div>
        <p className="mt-4 font-serif text-sm font-bold text-stone-900">
          Loading your showroom orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8 font-sans text-stone-800 antialiased sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-800" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                CraftStudio Client Portal
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              View and track all your handcrafted furniture orders in one place.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200/80 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 active:scale-[0.98]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 shadow-2xs"
          >
            <span>{error}</span>

            <button
              onClick={fetchOrders}
              className="ml-3 font-bold underline hover:text-rose-950"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Orders */}
        {!error && orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 py-16 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800">
              <ShoppingBag size={28} strokeWidth={1.4} />
            </div>

            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
              No Orders Yet
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-stone-500">
              You haven't placed any furniture orders yet. Discover our collection and furnish your space!
            </p>

            <button
              onClick={() => navigate("/product")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-7 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98]"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs transition hover:border-amber-700/40 hover:shadow-md"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 bg-amber-50/20 p-5 sm:px-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      Order Reference
                    </p>

                    <h3 className="mt-0.5 font-serif text-lg font-bold text-stone-900">
                      #{order.id}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-2xs ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Information */}
                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 text-amber-800" size={18} />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Order Date
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-stone-800 sm:text-sm">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IndianRupee className="mt-0.5 text-amber-800" size={18} />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Total Amount
                      </p>

                      <p className="mt-0.5 font-serif text-sm font-bold text-amber-900 sm:text-base">
                        {formatAmount(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package className="mt-0.5 text-amber-800" size={18} />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Total Items
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-stone-800 sm:text-sm">
                        {order.total_products || 0} {Number(order.total_products) === 1 ? "Product" : "Products"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 text-amber-800" size={18} />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Payment Method
                      </p>

                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-stone-800 sm:text-sm">
                        {order.payment_method || "COD"}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap justify-end gap-3 border-t border-stone-100 bg-[#FDFBF7]/50 p-4 sm:px-6">

                  <button
                    onClick={() =>
                      navigate(`/order-details/${order.id}`)
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 active:scale-[0.98]"
                  >
                    <Eye size={15} />
                    View Details
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/order-tracking/${order.id}`)
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98]"
                  >
                    <Truck size={15} />
                    Track Order
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;