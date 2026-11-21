
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

    return (
      <ArrowUpDown
        size={13}
        className="text-stone-400 group-hover:text-amber-800"
      />
    );
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

  const getFullName = (user) =>
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";

  const StatusBadge = ({ user }) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide shadow-2xs sm:text-[11px] ${
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
  );

  const StatusAction = ({ user }) => (
    user.role === "admin" ? (
      <span className="inline-flex items-center gap-1 text-xs italic text-stone-400">
        <ShieldCheck size={14} />
        Protected
      </span>
    ) : (
      <button
        type="button"
        onClick={() => handleStatusChange(user)}
        disabled={updatingId === user.id}
        className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold shadow-2xs transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
          user.status === "active"
            ? "border border-rose-200/80 bg-white text-rose-700 hover:bg-rose-50"
            : "border border-emerald-200/80 bg-white text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {updatingId === user.id
          ? "Updating..."
          : user.status === "active"
            ? "Deactivate"
            : "Activate"}
      </button>
    )
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDFBF7] px-3 py-5 font-sans text-stone-800 antialiased sm:p-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-800" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-800 sm:text-[11px] sm:tracking-[0.2em]">
                CraftStudio Showroom / Accounts
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
              User Directory
            </h1>

            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-500 sm:text-sm">
              Inspect client registrations, access permissions, and account
              activation states.
            </p>
          </div>

          <div className="flex w-fit max-w-full items-center gap-2 rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-2xs">
            <Users size={16} className="shrink-0 text-amber-800" />

            <span className="text-xs font-semibold text-stone-700">
              {pagination.totalUsers || 0} Registered Clients
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-xs sm:rounded-3xl sm:p-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}
          <div className="relative w-full lg:max-w-md">
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
              className="w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] py-3 pl-10 pr-4 text-xs font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="min-w-0 w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-2.5 py-3 text-[10px] font-semibold uppercase tracking-wide text-stone-700 outline-none transition focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10 sm:w-auto sm:px-3.5 sm:text-xs"
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
              className="min-w-0 w-full rounded-xl border border-stone-200/90 bg-[#FDFBF7] px-2.5 py-3 text-[10px] font-semibold uppercase tracking-wide text-stone-700 outline-none transition focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10 sm:w-auto sm:px-3.5 sm:text-xs"
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
            className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 shadow-2xs"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-rose-700" />
            <p className="break-words">{errorMessage}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-stone-200/80 bg-white py-16 text-center text-xs text-stone-500 shadow-xs sm:rounded-3xl">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-amber-800/20 border-t-amber-800" />
            Loading user accounts from database...
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-14 text-center shadow-xs sm:rounded-3xl">
            <Users size={34} className="mx-auto mb-3 text-stone-400" />

            <h3 className="font-serif text-lg font-bold text-stone-900">
              No Users Found
            </h3>

            <p className="mt-1 text-xs text-stone-500">
              No user accounts found matching your query.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile User Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="min-w-0 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs"
                >
                  {/* User Header */}
                  <div className="flex min-w-0 items-start gap-3 border-b border-stone-100 pb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-800/10 bg-amber-100/60 font-serif text-sm font-bold text-amber-900">
                      {user.first_name?.[0]?.toUpperCase() || "U"}
                      {user.last_name?.[0]?.toUpperCase() || ""}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-serif text-base font-bold text-stone-900">
                        {getFullName(user)}
                      </h3>

                      <p className="mt-1 break-all text-xs text-stone-500">
                        {user.email}
                      </p>

                      <p className="mt-1 text-[10px] text-stone-400">
                        Client ID: #{user.id}
                      </p>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="grid grid-cols-2 gap-3 py-4">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-stone-400">
                        Role
                      </p>

                      <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full border border-stone-200/80 bg-[#FDFBF7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-700">
                        {user.role === "admin" && (
                          <ShieldCheck size={12} className="shrink-0 text-amber-800" />
                        )}
                        <span className="break-all">{user.role}</span>
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-stone-400">
                        Account Status
                      </p>

                      <div className="mt-1">
                        <StatusBadge user={user} />
                      </div>
                    </div>

                    <div className="col-span-2 min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-stone-400">
                        Registration Date
                      </p>

                      <p className="mt-1 text-xs font-medium text-stone-700">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 border-t border-stone-100 pt-3 sm:flex-row">
                    <div className="flex-1">
                      <StatusAction user={user} />
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200/80 bg-[#FDFBF7] px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-700 transition hover:border-amber-700/40 hover:text-amber-800 active:scale-95"
                    >
                      <Eye size={14} />
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet / Desktop Table */}
            <div className="hidden overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] table-fixed border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200/80 bg-amber-100/30 text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                      <th className="w-[7%] px-5 py-4">ID</th>

                      <th className="w-[16%] px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleSort("name")}
                          className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-amber-900 transition hover:text-amber-950"
                        >
                          Client Name
                          {renderSortIcon("name")}
                        </button>
                      </th>

                      <th className="w-[22%] px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleSort("email")}
                          className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-amber-900 transition hover:text-amber-950"
                        >
                          Email Address
                          {renderSortIcon("email")}
                        </button>
                      </th>

                      <th className="w-[10%] px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleSort("role")}
                          className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-amber-900 transition hover:text-amber-950"
                        >
                          Role
                          {renderSortIcon("role")}
                        </button>
                      </th>

                      <th className="w-[15%] px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleSort("registered")}
                          className="group inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-amber-900 transition hover:text-amber-950"
                        >
                          Registration Date
                          {renderSortIcon("registered")}
                        </button>
                      </th>

                      <th className="w-[11%] px-5 py-4">Status</th>
                      <th className="w-[11%] px-5 py-4">Action</th>
                      <th className="w-[12%] px-5 py-4 text-right">Details</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-amber-50/20"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-stone-400">
                          #{user.id}
                        </td>

                        <td className="break-words px-5 py-4 font-serif font-bold text-stone-900">
                          {getFullName(user)}
                        </td>

                        <td className="break-all px-5 py-4 text-stone-600">
                          {user.email}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-stone-200/80 bg-[#FDFBF7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-700">
                            {user.role === "admin" && (
                              <ShieldCheck size={12} className="shrink-0 text-amber-800" />
                            )}
                            {user.role}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                          {formatDate(user.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge user={user} />
                        </td>

                        <td className="px-5 py-4">
                          <StatusAction user={user} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/users/${user.id}`)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 active:scale-95"
                          >
                            <Eye size={13} />
                            Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-stone-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-[11px] text-stone-500 sm:text-left sm:text-xs">
            Showing catalog accounts · Total:{" "}
            <strong className="font-semibold text-stone-800">
              {pagination.totalUsers || 0}
            </strong>
          </p>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((previous) => previous - 1)}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4 sm:text-xs"
            >
              Previous
            </button>

            <span className="whitespace-nowrap px-1 text-[10px] font-semibold text-stone-700 sm:px-3 sm:text-xs">
              Page {pagination.currentPage || page} of{" "}
              {pagination.totalPages || 1}
            </span>

            <button
              type="button"
              disabled={
                page >= (pagination.totalPages || 1) || loading
              }
              onClick={() => setPage((previous) => previous + 1)}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700 shadow-2xs transition hover:border-amber-700/40 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4 sm:text-xs"
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