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

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8 font-sans text-stone-800 antialiased sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-800" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                CraftStudio Showroom / Console
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Order Management
            </h1>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Review, track, and update client furniture order dispatches.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition hover:bg-amber-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Total Showroom Orders
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-stone-900">
              {orders.length}
            </h2>
          </div>

          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Pending Orders
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-amber-900">
              {orders.filter((order) => order.status === "Pending").length}
            </h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-xs">
          <Search size={18} className="text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, User ID or Status..."
            className="w-full bg-transparent text-sm text-stone-800 placeholder-stone-400 outline-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 shadow-2xs">
            <AlertCircle size={18} className="shrink-0 text-rose-700" />
            {error}
          </div>
        )}

        {/* Content States */}
        {loading ? (
          <div className="rounded-3xl border border-stone-200/80 bg-white py-16 text-center text-xs text-stone-500 shadow-xs">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-amber-800" />
            Loading orders from database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 py-16 text-center shadow-xs">
            <Package size={36} className="mx-auto mb-3 text-stone-400" strokeWidth={1.3} />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              No Orders Found
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              No orders matched your current search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-950px border-collapse text-left text-sm">
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
                        {order.total_products} {Number(order.total_products) === 1 ? "piece" : "pieces"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-amber-900">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-medium text-stone-800">{order.payment_method}</div>
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
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider outline-none shadow-2xs transition disabled:opacity-50 ${getStatusColor(
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
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 active:scale-95"
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
        )}
      </div>
    </div>
  );
};

export default AdminOrders;