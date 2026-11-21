
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] px-4 text-center font-sans text-stone-800">
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] px-4 py-8 text-center font-sans text-stone-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50 text-rose-700">
          <AlertCircle size={28} />
        </div>

        <h2 className="mt-4 max-w-full break-words font-serif text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
          {error || "Order not found"}
        </h2>

        <Link
          to="/admin/orders"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 sm:px-6"
        >
          <ArrowLeft size={15} />
          Back to Orders
        </Link>
      </div>
    );
  }

  const items = order.items || [];

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  const getProductImage = (image) => {
    if (!image || typeof image !== "string") return "";

    if (/^https?:\/\//i.test(image)) return image;

    return `${SERVER_URL}/${image.replace(/^\/+/, "")}`;
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDFBF7] px-3 py-5 font-sans text-stone-800 antialiased sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">

        {/* Back Link */}
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600 transition hover:text-amber-800 sm:text-xs"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
        </div>

        {/* Page Title & Status */}
        <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-800" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-800 sm:text-[11px] sm:tracking-[0.2em]">
                Showroom Order Console
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
              Order Details
            </h1>

            <p className="mt-1 break-all text-xs text-stone-500">
              Reference ID: #{order.id}
            </p>
          </div>

          <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-100/80 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 shadow-2xs sm:text-xs">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-800" />
            <span className="break-words">{order.status}</span>
          </span>
        </div>

        {/* Order & Payment Information */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">

          {/* Order Information */}
          <div className="min-w-0 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6 lg:p-7">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-base font-bold tracking-tight text-stone-900 sm:mb-5 sm:text-lg">
              <Package className="shrink-0 text-amber-800" size={19} />
              Order Information
            </h2>

            <div className="divide-y divide-stone-100 text-xs sm:text-sm">
              <div className="flex items-start justify-between gap-3 py-3">
                <span className="text-stone-500">Order ID</span>
                <strong className="break-all text-right font-semibold text-stone-900">
                  #{order.id}
                </strong>
              </div>

              <div className="flex items-start justify-between gap-3 py-3">
                <span className="text-stone-500">Customer ID</span>
                <strong className="break-all text-right font-semibold text-stone-900">
                  #{order.user_id}
                </strong>
              </div>

              <div className="flex items-start justify-between gap-3 py-3">
                <span className="text-stone-500">Order Date</span>
                <strong className="max-w-[65%] break-words text-right font-semibold text-stone-900">
                  {new Date(order.created_at).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-stone-500">Total Products</span>
                <strong className="text-right font-semibold text-stone-900">
                  {items.length} Units
                </strong>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="min-w-0 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6 lg:p-7">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-base font-bold tracking-tight text-stone-900 sm:mb-5 sm:text-lg">
              <CreditCard className="shrink-0 text-amber-800" size={19} />
              Payment Information
            </h2>

            <div className="divide-y divide-stone-100 text-xs sm:text-sm">
              <div className="flex items-start justify-between gap-3 py-3">
                <span className="text-stone-500">Payment Method</span>
                <strong className="max-w-[60%] break-words text-right font-semibold uppercase tracking-wider text-stone-900">
                  {order.payment_method}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-stone-500">Payment Status</span>
                <strong className="max-w-[60%] rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-right text-[10px] font-semibold text-stone-800 sm:text-xs">
                  {order.payment_status}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-stone-500">Order Status</span>
                <strong className="max-w-[60%] break-words text-right font-semibold text-stone-900">
                  {order.status}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-stone-500">Total Amount</span>
                <strong className="font-serif text-base font-bold text-amber-900 sm:text-lg">
                  ₹{formatPrice(order.total_amount)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6 lg:p-7">
          <h2 className="mb-4 font-serif text-base font-bold tracking-tight text-stone-900 sm:text-lg">
            Shipping & Dispatch Coordinates
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-stone-200/70 bg-[#FDFBF7] p-3 sm:rounded-2xl sm:p-4">
              <MapPin className="mt-0.5 shrink-0 text-amber-800" size={18} />

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-stone-400 sm:text-[10px]">
                  Delivery Address
                </p>

                <p className="mt-1 break-words text-xs font-medium leading-relaxed text-stone-800 sm:text-sm">
                  {order.shipping_address || "No shipping address provided"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-stone-200/70 bg-[#FDFBF7] p-3 sm:rounded-2xl sm:p-4">
              <Phone className="mt-0.5 shrink-0 text-amber-800" size={18} />

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-stone-400 sm:text-[10px]">
                  Contact Number
                </p>

                <p className="mt-1 break-all text-xs font-medium text-stone-800 sm:text-sm">
                  {order.phone || "No phone number registered"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Products */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs sm:rounded-3xl">
          <div className="border-b border-stone-100 p-4 sm:p-6">
            <h2 className="font-serif text-base font-bold tracking-tight text-stone-900 sm:text-lg">
              Ordered Furniture Pieces ({items.length})
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 sm:p-10">
              No products found in this order.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-amber-50/20 sm:flex-row sm:items-center sm:gap-4 sm:p-5 lg:p-6"
                >
                  <div className="flex min-w-0 items-start gap-3 sm:contents">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200/80 bg-amber-50/50 sm:h-20 sm:w-20 sm:rounded-2xl">
                      {item.product_image ? (
                        <img
                          src={getProductImage(item.product_image)}
                          alt={item.product_name || "Product"}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-stone-400">
                          <Package size={24} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-amber-800 sm:text-[10px]">
                        CraftStudio Item
                      </span>

                      <h3 className="break-words font-serif text-sm font-bold text-stone-900 sm:text-base">
                        {item.product_name}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500 sm:text-xs">
                        <span>
                          Quantity:{" "}
                          <strong className="text-stone-800">
                            {item.quantity}
                          </strong>
                        </span>

                        <span>
                          Unit Price:{" "}
                          <strong className="text-stone-800">
                            ₹{formatPrice(item.price)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-100 pt-3 sm:min-w-[120px] sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      Subtotal
                    </p>

                    <p className="font-serif text-base font-bold text-amber-900 sm:text-lg">
                      ₹{formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grand Total */}
          <div className="flex flex-col gap-2 border-t border-stone-200/80 bg-[#FDFBF7] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-6">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:text-xs">
                Grand Total Amount
              </span>

              <p className="text-[10px] text-stone-400 sm:text-[11px]">
                (Inclusive of showroom processing & taxes)
              </p>
            </div>

            <span className="break-words font-serif text-2xl font-bold text-amber-900 sm:text-3xl">
              ₹{formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;