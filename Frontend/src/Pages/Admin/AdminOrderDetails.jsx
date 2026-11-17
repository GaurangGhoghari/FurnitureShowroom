import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminOrderDetails } from "../../api/api";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";

const SERVER_URL = (
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "")
).replace(/\/+$/, "");

const AdminOrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminOrderDetails(id);

        if (response.success) {
          setOrder(response.order);
        } else {
          setError(response.message || "Order not found");
        }
      } catch (err) {
        console.error("Admin Order Details Error:", err);
        setError(err.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] font-sans text-stone-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800">
          <Loader2 className="animate-spin text-amber-800" size={28} />
        </div>
        <p className="mt-4 font-serif text-sm font-bold text-stone-900">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] p-8 text-center font-sans text-stone-800">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50 text-rose-700">
          <AlertCircle size={28} />
        </div>

        <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-stone-900">
          {error || "Order not found"}
        </h2>

        <Link
          to="/admin/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900"
        >
          <ArrowLeft size={15} />
          Back to Orders
        </Link>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8 font-sans text-stone-800 antialiased sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 transition hover:text-amber-800"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
        </div>

        {/* Page Title & Status Banner */}
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-800" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                Showroom Order Console
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Order Details
            </h1>

            <p className="mt-1 text-xs text-stone-500">
              Reference ID: #{order.id}
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-100/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-800" />
            {order.status}
          </span>
        </div>

        {/* Order Information & Payment Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Details Card */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-7">
            <h2 className="mb-5 flex items-center gap-2.5 font-serif text-lg font-bold tracking-tight text-stone-900">
              <Package className="text-amber-800" size={19} />
              Order Information
            </h2>

            <div className="divide-y divide-stone-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500">Order ID</span>
                <strong className="font-semibold text-stone-900">
                  #{order.id}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500">Customer ID</span>
                <strong className="font-semibold text-stone-900">
                  #{order.user_id}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500">Order Date</span>
                <strong className="font-semibold text-stone-900">
                  {new Date(order.created_at).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500">Total Products</span>
                <strong className="font-semibold text-stone-900">
                  {items.length} Units
                </strong>
              </div>
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-7">
            <h2 className="mb-5 flex items-center gap-2.5 font-serif text-lg font-bold tracking-tight text-stone-900">
              <CreditCard className="text-amber-800" size={19} />
              Payment Information
            </h2>

            <div className="divide-y divide-stone-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500">Payment Method</span>
                <strong className="font-semibold uppercase tracking-wider text-stone-900">
                  {order.payment_method}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500">Payment Status</span>
                <strong className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-semibold text-stone-800">
                  {order.payment_status}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500">Order Status</span>
                <strong className="font-semibold text-stone-900">
                  {order.status}
                </strong>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-stone-500">Total Amount</span>
                <strong className="font-serif text-lg font-bold text-amber-900">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:p-7">
          <h2 className="mb-4 font-serif text-lg font-bold tracking-tight text-stone-900">
            Shipping & Dispatch Coordinates
          </h2>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-start gap-3 rounded-2xl border border-stone-200/70 bg-[#FDFBF7] p-4">
              <MapPin className="mt-0.5 shrink-0 text-amber-800" size={18} />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Delivery Address
                </p>

                <p className="mt-1 font-medium leading-relaxed text-stone-800">
                  {order.shipping_address || "No shipping address provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-[#FDFBF7] p-4">
              <Phone className="shrink-0 text-amber-800" size={18} />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Contact Number
                </p>

                <p className="mt-0.5 font-medium text-stone-800">
                  {order.phone || "No phone number registered"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Products Table / List */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs">
          <div className="border-b border-stone-100 p-6">
            <h2 className="font-serif text-lg font-bold tracking-tight text-stone-900">
              Ordered Furniture Pieces ({items.length})
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="p-10 text-center text-xs text-stone-500">
              No products found in this order.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-amber-50/20 sm:flex-row sm:items-center"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-amber-50/50">
                    {item.product_image ? (
                      <img
                        src={
                          item.product_image.startsWith("http")
                            ? item.product_image
                            : `${SERVER_URL}/${(item.product_image || "").replace(/^\/+/, "")}`
                        }
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-400">
                        <Package size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-800">
                      CraftStudio Item
                    </span>

                    <h3 className="font-serif text-base font-bold text-stone-900">
                      {item.product_name}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-xs text-stone-500">
                      <span>
                        Quantity:{" "}
                        <strong className="text-stone-800">
                          {item.quantity}
                        </strong>
                      </span>

                      <span>
                        Unit Price:{" "}
                        <strong className="text-stone-800">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      Subtotal
                    </p>

                    <p className="font-serif text-base font-bold text-amber-900 sm:text-lg">
                      ₹{Number(item.subtotal).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grand Total Footer */}
          <div className="flex items-center justify-between border-t border-stone-200/80 bg-[#FDFBF7] p-6 sm:px-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Grand Total Amount
              </span>

              <p className="text-[11px] text-stone-400">
                (Inclusive of showroom processing & taxes)
              </p>
            </div>

            <span className="font-serif text-2xl font-bold text-amber-900 sm:text-3xl">
              ₹{Number(order.total_amount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;