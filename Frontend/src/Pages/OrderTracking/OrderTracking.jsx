import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Loader2,
  XCircle,
  Sparkles,
} from "lucide-react";

import { getOrderTracking } from "../../api/api";

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statusSteps = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  useEffect(() => {
    fetchTracking();
  }, [id]);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrderTracking(id);

      if (response.success) {
        setOrder(response.order);
        setTracking(response.tracking || []);
      } else {
        setError(response.message || "Tracking information not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order tracking");
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock size={18} />;

      case "Confirmed":
        return <CheckCircle2 size={18} />;

      case "Processing":
        return <Package size={18} />;

      case "Shipped":
        return <Truck size={18} />;

      case "Out for Delivery":
        return <MapPin size={18} />;

      case "Delivered":
        return <CheckCircle2 size={18} />;

      case "Cancelled":
        return <XCircle size={18} />;

      default:
        return <Clock size={18} />;
    }
  };

  const getStatusIndex = () => {
    if (!order) return -1;
    return statusSteps.indexOf(order.status);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FDFBF7] font-sans text-stone-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800 shadow-2xs">
          <Loader2 className="animate-spin text-amber-800" size={28} />
        </div>
        <p className="mt-4 font-serif text-sm font-bold text-stone-900">
          Loading shipment status...
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
          Tracking Not Found
        </h2>

        <p className="mt-1 text-xs text-stone-500">
          {error || "Unable to find this order."}
        </p>

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

  const currentStatusIndex = getStatusIndex();
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8 font-sans text-stone-800 antialiased sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate(`/order-details/${id}`)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 transition hover:text-amber-800"
          >
            <ArrowLeft size={16} />
            Back to Order Details
          </button>
        </div>

        {/* Page Heading */}
        <div className="border-b border-stone-200/80 pb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-800" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
              CraftStudio Showroom / Dispatch
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Track Your Order
          </h1>

          <p className="mt-1 text-xs text-stone-500">
            Order Reference: #{order.id}
          </p>
        </div>

        {/* Current Status Card */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-2xs ${
                isCancelled
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-amber-200/70 bg-amber-100/80 text-amber-900"
              }`}
            >
              {isCancelled ? <XCircle size={26} /> : <Truck size={26} />}
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Current Order Status
              </p>

              <h2
                className={`font-serif text-xl font-bold tracking-tight sm:text-2xl ${
                  isCancelled ? "text-rose-700" : "text-stone-900"
                }`}
              >
                {order.status}
              </h2>

              <p className="text-xs text-stone-500">
                Last Activity: {formatDate(order.updated_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-8 flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900">
              Order Status Timeline
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
              Live Progress
            </span>
          </div>

          {isCancelled ? (
            <div className="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-rose-800">
              <XCircle size={22} className="shrink-0 text-rose-700" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Order Cancelled
                </h3>
                <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">
                  This order has been cancelled and is no longer being processed
                  by the showroom.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex min-w-650px items-start">
                {statusSteps.map((status, index) => {
                  const historyItem = tracking.find(
                    (item) => item.status === status,
                  );

                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div
                      key={status}
                      className="relative flex flex-1 flex-col items-center"
                    >
                      {/* Timeline Line */}
                      {index !== statusSteps.length - 1 && (
                        <div
                          className={`absolute left-1/2 top-5 h-3px w-full ${
                            index < currentStatusIndex
                              ? "bg-amber-800"
                              : "bg-stone-200"
                          }`}
                        />
                      )}

                      {/* Status Icon */}
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          isCompleted
                            ? "border-amber-800 bg-amber-800 text-white"
                            : "border-stone-300 bg-white text-stone-400"
                        }`}
                      >
                        {getStatusIcon(status)}
                      </div>

                      {/* Status Name */}
                      <h3
                        className={`mt-3 text-center text-xs font-bold sm:text-sm ${
                          isCompleted ? "text-stone-900" : "text-stone-400"
                        }`}
                      >
                        {status}
                      </h3>

                      {/* Current Status */}
                      {isCurrent && (
                        <span className="mt-2 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold uppercase text-amber-900">
                          Current
                        </span>
                      )}

                      {/* Date and Note */}
                      <div className="mt-2 max-w-100px text-center">
                        {historyItem ? (
                          <>
                            <p className="text-[10px] leading-relaxed text-stone-500">
                              {historyItem.note || "Status updated"}
                            </p>
                            <p className="mt-1 text-[10px] font-medium text-stone-400">
                              {formatDate(historyItem.changed_at)}
                            </p>
                          </>
                        ) : (
                          <p className="text-[10px] text-stone-400">
                            {isCompleted ? "Completed" : "Waiting"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Information Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center gap-2 text-amber-800">
              <Package size={18} />
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Order Reference
              </h3>
            </div>

            <p className="text-xs text-stone-600">
              Order ID:{" "}
              <strong className="font-semibold text-stone-900">
                #{order.id}
              </strong>
            </p>

            <p className="mt-1 text-xs text-stone-600">
              Booking Date: {formatDate(order.created_at)}
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center gap-2 text-amber-800">
              <MapPin size={18} />
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Fulfillment Note
              </h3>
            </div>

            <p className="text-xs leading-relaxed text-stone-600">
              {isCancelled
                ? "Your order has been cancelled."
                : order.status === "Delivered"
                  ? "Delivered directly from Katargam workshop."
                  : "White-glove courier handling in progress."}
            </p>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="pt-2 text-center">
          <button
            onClick={() => navigate("/my-orders")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98]"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
