
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../../api/api";
import {
  Package,
  RefreshCw,
  Eye,
  Search,
  AlertCircle,
} from "lucide-react";

const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllOrders();

      if (response.success) {
        setOrders(response.orders || []);
      } else {
        setError(response.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);

      const response = await updateOrderStatus(orderId, status);

      if (response.success) {
        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        );
      } else {
        alert(response.message || "Status update failed");
      }
    } catch (err) {
      console.error("Update Status Error:", err);
      alert(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) =>
    String(order.id).includes(search.trim()) ||
    String(order.user_id).includes(search.trim()) ||
    String(order.status).toLowerCase().includes(search.trim().toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "border border-emerald-200 bg-emerald-50 text-emerald-800";
      case "Cancelled":
        return "border border-rose-200 bg-rose-50 text-rose-700";
      case "Shipped":
      case "Out for Delivery":
        return "border border-sky-200 bg-sky-50 text-sky-800";
      case "Processing":
        return "border border-stone-200 bg-stone-100 text-stone-700";
      case "Confirmed":
        return "border border-amber-200/80 bg-amber-100/70 text-amber-900";
      default:
        return "border border-amber-200 bg-amber-50 text-amber-800";
    }
  };

  const formatPrice = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDFBF7] px-3 py-5 font-sans text-stone-800 antialiased sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-800" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-800 sm:text-[11px] sm:tracking-[0.2em]">
                Gaurang Studio Showroom / Console
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
              Order Management
            </h1>

            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Review, track, and update client furniture order dispatches.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:text-xs">
              Total Showroom Orders
            </p>

            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {orders.length}
            </h2>
          </div>

          <div className="min-w-0 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:text-xs">
              Pending Orders
            </p>

            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-amber-900 sm:text-3xl">
              {orders.filter((order) => order.status === "Pending").length}
            </h2>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-xs">
          <Search size={18} className="shrink-0 text-stone-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, User ID or Status..."
            className="min-w-0 w-full bg-transparent text-xs text-stone-800 outline-none placeholder:text-stone-400 sm:text-sm"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0 text-xs font-semibold text-amber-800 hover:text-amber-950"
            >
              Clear
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 shadow-2xs">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-700" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-stone-200/80 bg-white py-16 text-center text-xs text-stone-500 shadow-xs sm:rounded-3xl">
            <RefreshCw
              size={24}
              className="mx-auto mb-2 animate-spin text-amber-800"
            />
            Loading orders from database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-14 text-center shadow-xs sm:rounded-3xl sm:py-16">
            <Package
              size={36}
              className="mx-auto mb-3 text-stone-400"
              strokeWidth={1.3}
            />

            <h3 className="font-serif text-lg font-bold text-stone-900">
              No Orders Found
            </h3>

            <p className="mt-1 text-xs text-stone-500">
              No orders matched your current search criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Order Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="min-w-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Order ID
                      </p>

                      <h3 className="mt-1 font-serif text-lg font-bold text-stone-900">
                        #{order.id}
                      </h3>

                      <p className="mt-1 text-[11px] text-stone-500">
                        Client #{order.user_id}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-semibold text-stone-700">
                      {order.status}
                    </span>
                  </div>

                  {/* Card Information */}
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Items
                      </p>

                      <p className="mt-1 text-sm font-semibold text-stone-800">
                        {order.total_products}{" "}
                        {Number(order.total_products) === 1 ? "piece" : "pieces"}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Total Amount
                      </p>

                      <p className="mt-1 break-words font-serif text-base font-bold text-amber-900">
                        ₹{formatPrice(order.total_amount)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Payment Method
                      </p>

                      <p className="mt-1 break-words text-xs font-medium text-stone-800">
                        {order.payment_method}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Payment Status
                      </p>

                      <p className="mt-1 break-words text-xs font-medium text-stone-800">
                        {order.payment_status}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Order Date
                      </p>

                      <p className="mt-1 text-xs text-stone-600">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="border-t border-stone-100 pt-3">
                    <label
                      htmlFor={`mobile-status-${order.id}`}
                      className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-stone-400"
                    >
                      Update Order Status
                    </label>

                    <select
                      id={`mobile-status-${order.id}`}
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`w-full rounded-xl px-3 py-3 text-xs font-semibold outline-none transition disabled:opacity-50 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Button */}
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-[#FDFBF7] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-700 transition hover:border-amber-700/40 hover:text-amber-800 active:scale-[0.98]"
                  >
                    <Eye size={14} />
                    View Order Details
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Table */}
            <div className="hidden overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200/80 bg-amber-100/30 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                      <th className="px-5 py-4">Order ID</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Items</th>
                      <th className="px-5 py-4">Total Amount</th>
                      <th className="px-5 py-4">Payment</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-amber-50/20"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-stone-900">
                          #{order.id}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-stone-600">
                          Client #{order.user_id}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-stone-600">
                          {order.total_products}{" "}
                          {Number(order.total_products) === 1 ? "piece" : "pieces"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-bold text-amber-900">
                          ₹{formatPrice(order.total_amount)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="font-medium text-stone-800">
                            {order.payment_method}
                          </div>

                          <span className="text-[11px] uppercase tracking-wider text-stone-400">
                            {order.payment_status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className={`max-w-[180px] rounded-xl px-3 py-2 text-xs font-semibold tracking-wide outline-none shadow-2xs transition disabled:opacity-50 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                          {formatDate(order.created_at)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 active:scale-95"
                          >
                            <Eye size={13} />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;