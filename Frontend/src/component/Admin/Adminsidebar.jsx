import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/authcontext";

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // State for toggling sidebar hide/show (collapse)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <aside
      className={`relative min-h-screen bg-[#2A1E17] text-amber-100 flex flex-col justify-between border-r border-[#3D2C22] shadow-2xl font-sans transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Hide / Show Toggle Button on Edge */}
      <button
        type="button"
        onClick={toggleSidebar}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        className="absolute -right-3.5 top-7 z-20 bg-amber-700 hover:bg-amber-600 text-white p-1.5 rounded-full shadow-md border border-amber-500/40 transition-transform duration-200 active:scale-95"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div>
        {/* Brand Header */}
        <div className="px-5 py-6 border-b border-[#3D2C22] flex items-center justify-between bg-[#211712] overflow-hidden">
          <div className="flex items-center gap-3 min-w-max">
            <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center text-white font-serif font-bold text-xl shadow-md border border-amber-500/30 shrink-0">
              C
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-200">
                <h2 className="text-base font-serif font-bold text-amber-400 tracking-wider leading-tight">
                  CraftAdmin
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-amber-200/60 font-medium mt-0.5">
                  Furniture Studio
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"
              title="Studio Online"
            ></span>
          )}

          {/* Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new Event("admin-theme-toggle"));
            }}
            title="Toggle Dark / Light Mode"
            aria-label="Toggle Dark / Light Mode"
            className="shrink-0 rounded-lg border border-amber-500/30
             bg-[#3D2C22] p-2 text-lg
             hover:bg-amber-700 transition-colors"
          >
            🌗
          </button>
        </div>

        {/* Section Title */}
        {!isCollapsed && (
          <div className="px-6 pt-6 pb-3 text-[10px] font-bold text-amber-200/50 uppercase tracking-widest">
            Navigation
          </div>
        )}

        {/* Links Navigation */}
        <nav className={`px-3 space-y-2 ${isCollapsed ? "pt-6" : ""}`}>
          {/* Dashboard Link */}
          <NavLink
            to="/admindashboard"
            title={isCollapsed ? "Dashboard" : ""}
            className={({ isActive }) =>
              `relative flex items-center ${
                isCollapsed ? "justify-center px-0" : "px-4"
              } py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-amber-600/30 text-amber-300 font-semibold border border-amber-600/40 shadow-inner"
                  : "text-amber-100/70 hover:text-amber-100 hover:bg-[#3D2C22]/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full"></span>
                )}
                <svg
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? "text-amber-400"
                      : "text-amber-200/60 group-hover:text-amber-200"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                {!isCollapsed && (
                  <span className="ml-3 truncate">Dashboard</span>
                )}
              </>
            )}
          </NavLink>

          {/* Category Link */}
          <NavLink
            to="/admin/categories"
            title={isCollapsed ? "Category" : ""}
            className={({ isActive }) =>
              `relative flex items-center ${
                isCollapsed ? "justify-center px-0" : "px-4"
              } py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-amber-600/30 text-amber-300 font-semibold border border-amber-600/40 shadow-inner"
                  : "text-amber-100/70 hover:text-amber-100 hover:bg-[#3D2C22]/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
                )}

                <svg
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? "text-amber-400"
                      : "text-amber-200/60 group-hover:text-amber-200"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                </svg>

                {!isCollapsed && (
                  <span className="ml-3 truncate">Category</span>
                )}
              </>
            )}
          </NavLink>

          {/* Products Link */}
          <NavLink
            to="/admin/product"
            title={isCollapsed ? "Products" : ""}
            className={({ isActive }) =>
              `relative flex items-center ${
                isCollapsed ? "justify-center px-0" : "px-4"
              } py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-amber-600/30 text-amber-300 font-semibold border border-amber-600/40 shadow-inner"
                  : "text-amber-100/70 hover:text-amber-100 hover:bg-[#3D2C22]/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full"></span>
                )}
                <svg
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? "text-amber-400"
                      : "text-amber-200/60 group-hover:text-amber-200"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                {!isCollapsed && (
                  <span className="ml-3 truncate">Products</span>
                )}
              </>
            )}
          </NavLink>

          {/* Orders Link */}
          <NavLink
            to="/admin/orders"
            title={isCollapsed ? "Orders" : ""}
            className={({ isActive }) =>
              `relative flex items-center ${
                isCollapsed ? "justify-center px-0" : "px-4"
              } py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-amber-600/30 text-amber-300 font-semibold border border-amber-600/40 shadow-inner"
                  : "text-amber-100/70 hover:text-amber-100 hover:bg-[#3D2C22]/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
                )}

                <svg
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? "text-amber-400"
                      : "text-amber-200/60 group-hover:text-amber-200"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M3 7h18l-2 13H5L3 7zm4 0V5a5 5 0 0110 0v2"
                  />
                </svg>

                {!isCollapsed && <span className="ml-3 truncate">Orders</span>}
              </>
            )}
          </NavLink>

          {/* Users Link */}
          <NavLink
            to="/admin/users"
            title={isCollapsed ? "Users" : ""}
            className={({ isActive }) =>
              `relative flex items-center ${
                isCollapsed ? "justify-center px-0" : "px-4"
              } py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-amber-600/30 text-amber-300 font-semibold border border-amber-600/40 shadow-inner"
                  : "text-amber-100/70 hover:text-amber-100 hover:bg-[#3D2C22]/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !isCollapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
                )}

                {/* Users Icon */}
                <svg
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? "text-amber-400"
                      : "text-amber-200/60 group-hover:text-amber-200"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m16 0v-2a4 4 0 00-3-3.87M14 3.13a4 4 0 010 7.75M14 7a4 4 0 01-8 0 4 4 0 018 0z"
                  />
                </svg>

                {!isCollapsed && <span className="ml-3 truncate">Users</span>}
              </>
            )}
          </NavLink>
        </nav>
      </div>

      {/* Logout Footer Section */}
      <div className="p-3 border-t border-[#3D2C22] bg-[#211712]">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : ""}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-0" : "px-4"
          } py-3 rounded-xl font-medium text-sm text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 transition-all duration-200`}
        >
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {!isCollapsed && <span className="ml-3 truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
