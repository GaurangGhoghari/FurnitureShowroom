import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Eye,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getAdminUsers,
  updateAdminUserStatus,
} from "../../api/api";

const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("registered_desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 3,
    totalUsers: 0,
    totalPages: 1,
  });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAdminUsers({
        page,
        limit,
        search,
        status,
        sortBy,
      });

      const result = response.data;

      if (result.success) {
        setUsers(result.data || []);
        setPagination(
          result.pagination || {
            currentPage: page,
            limit,
            totalUsers: 0,
            totalPages: 1,
          }
        );
      } else {
        setErrorMessage(result.message || "Unable to load users.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSort = (field) => {
    const nextSort =
      sortBy === `${field}_asc`
        ? `${field}_desc`
        : `${field}_asc`;

    setSortBy(nextSort);
    setPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortBy === `${field}_asc`) {
      return <ArrowUp size={13} className="text-amber-800" />;
    }

    if (sortBy === `${field}_desc`) {
      return <ArrowDown size={13} className="text-amber-800" />;
    }

    return <ArrowUpDown size={13} className="text-stone-400 group-hover:text-amber-800" />;
  };

  const handleStatusChange = async (user) => {
    const nextStatus =
      user.status === "active" ? "inactive" : "active";

    try {
      setUpdatingId(user.id);

      await updateAdminUserStatus(user.id, nextStatus);

      await fetchUsers();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-5 font-sans text-stone-800 antialiased sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-800" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                CraftStudio Showroom / Accounts
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              User Directory
            </h1>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Inspect client registrations, access permissions, and account activation states.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-stone-200/80 bg-white px-4 py-2.5 shadow-2xs">
            <Users size={16} className="text-amber-800" />
            <span className="text-xs font-semibold text-stone-700">
              {pagination.totalUsers || 0} Registered Clients
            </span>
          </div>
        </div>

        {/* Search And Filter Bar */}
        <div className="flex flex-col gap-3.5 rounded-3xl border border-stone-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by client name or email..."
              className="w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-700 outline-none transition focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-700 outline-none transition focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10"
            >
              <option value={3}>3 Per Page</option>
              <option value={5}>5 Per Page</option>
              <option value={10}>10 Per Page</option>
              <option value={20}>20 Per Page</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 shadow-2xs"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-1100px table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200/80 bg-amber-100/30 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                  <th className="px-5 py-4">ID</th>

                  <th className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleSort("name")}
                      className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-amber-900 transition hover:text-amber-950"
                    >
                      Client Name {renderSortIcon("name")}
                    </button>
                  </th>

                  <th className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleSort("email")}
                      className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-amber-900 transition hover:text-amber-950"
                    >
                      Email Address {renderSortIcon("email")}
                    </button>
                  </th>

                  <th className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleSort("role")}
                      className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-amber-900 transition hover:text-amber-950"
                    >
                      Role {renderSortIcon("role")}
                    </button>
                  </th>

                  <th className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleSort("registered")}
                      className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-amber-900 transition hover:text-amber-950"
                    >
                      Registration Date {renderSortIcon("registered")}
                    </button>
                  </th>

                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4 text-right">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-14 text-center text-xs text-stone-500"
                    >
                      Loading user accounts from database...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-14 text-center text-xs text-stone-500"
                    >
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-amber-50/20"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-stone-400">
                        #{user.id}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-serif font-bold text-stone-900">
                        {user.first_name} {user.last_name}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-stone-600">
                        {user.email}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-[#FDFBF7] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                          {user.role === "admin" && (
                            <ShieldCheck size={12} className="text-amber-800" />
                          )}
                          {user.role}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide shadow-2xs ${
                            user.status === "active"
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {user.status === "active" ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-rose-500" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {user.role === "admin" ? (
                          <span className="text-xs italic text-stone-400">
                            Protected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(user)}
                            disabled={updatingId === user.id}
                            className={
                              user.status === "active"
                                ? "rounded-xl border border-rose-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs transition hover:bg-rose-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                : "rounded-xl border border-emerald-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs transition hover:bg-emerald-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            }
                          >
                            {updatingId === user.id
                              ? "Updating..."
                              : user.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        )}
                      </td>

                      {/* View Profile Action */}
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/users/${user.id}`)
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 active:scale-95"
                        >
                          <Eye size={13} />
                          Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
          <p className="text-xs text-stone-500">
            Showing catalog accounts · Total: <strong className="font-semibold text-stone-800">{pagination.totalUsers || 0}</strong>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((previous) => previous - 1)}
              className="inline-flex items-center justify-center rounded-xl border border-stone-200/80 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-3 text-xs font-semibold text-stone-700">
              Page {pagination.currentPage || page} of {pagination.totalPages || 1}
            </span>

            <button
              type="button"
              disabled={
                page >= (pagination.totalPages || 1) || loading
              }
              onClick={() => setPage((previous) => previous + 1)}
              className="inline-flex items-center justify-center rounded-xl border border-stone-200/80 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;