
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/authcontext";
import {
  getProducts,
  getCategories,
  getAdminUsers,
} from "../api/api";

import {
  Package,
  Layers,
  Users,
  ArrowUpRight,
  Sofa,
  RefreshCw,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Boxes,
} from "lucide-react";

const AdminDashboard = () => {
  const { currentUser } = useAuth();

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        getProducts({ page: 1, limit: 1 }),
        getCategories({ page: 1, limit: 1 }),
        getAdminUsers({ page: 1, limit: 1 }),
      ]);

      setStats({
        products:
          results[0].status === "fulfilled"
            ? Number(results[0].value.data?.pagination?.totalProducts ?? 0)
            : 0,

        categories:
          results[1].status === "fulfilled"
            ? Number(results[1].value.data?.pagination?.totalCategories ?? 0)
            : 0,

        users:
          results[2].status === "fulfilled"
            ? Number(results[2].value.data?.pagination?.totalUsers ?? 0)
            : 0,
      });
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const cards = [
    {
      title: "Total Products",
      value: stats.products,
      description: "Products available in your store",
      icon: Package,
      link: "/admin/product",
      iconBg: "bg-blue-50 dark:bg-blue-950/50",
      iconColor: "text-blue-700 dark:text-blue-400",
      accent: "border-l-blue-500",
    },
    {
      title: "Total Categories",
      value: stats.categories,
      description: "Organized furniture categories",
      icon: Layers,
      link: "/admin/categories",
      iconBg: "bg-purple-50 dark:bg-purple-950/50",
      iconColor: "text-purple-700 dark:text-purple-400",
      accent: "border-l-purple-500",
    },
    {
      title: "Registered Users",
      value: stats.users,
      description: "Customers registered in your store",
      icon: Users,
      link: "/admin/users",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
      iconColor: "text-emerald-700 dark:text-emerald-400",
      accent: "border-l-emerald-500",
    },
  ];

  const managementLinks = [
    {
      title: "Manage Products",
      description: "Add, edit and manage your furniture products.",
      icon: Package,
      link: "/admin/product",
    },
    {
      title: "Manage Categories",
      description: "Organize and update product categories.",
      icon: Boxes,
      link: "/admin/categories",
    },
    {
      title: "Manage Users",
      description: "View customer profiles and manage accounts.",
      icon: Users,
      link: "/admin/users",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes dashboardFade {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardSlide {
          from {
            opacity: 0;
            transform: translateX(-35px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes dashboardPop {
          from {
            opacity: 0;
            transform: translateY(35px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes floatingSofa {
          0%, 100% {
            transform: translateY(0) rotate(-3deg);
          }
          50% {
            transform: translateY(-14px) rotate(2deg);
          }
        }

        @keyframes circleFloat {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(-12px, 12px);
          }
        }

        .dashboard-page {
          animation: dashboardFade 0.7s ease-out both;
        }

        .dashboard-heading {
          animation: dashboardSlide 0.7s ease-out both;
        }

        .dashboard-banner {
          animation: dashboardFade 0.9s ease-out 0.15s both;
        }

        .dashboard-stat {
          opacity: 0;
          animation: dashboardPop 0.65s cubic-bezier(.2,.8,.2,1) both;
        }

        .dashboard-management {
          opacity: 0;
          animation: dashboardFade 0.7s ease-out both;
        }

        .dashboard-sofa {
          animation: floatingSofa 5s ease-in-out infinite;
        }

        .dashboard-circle {
          animation: circleFloat 8s ease-in-out infinite;
        }

        .dashboard-card {
          transition:
            transform 0.35s cubic-bezier(.2,.8,.2,1),
            box-shadow 0.35s ease,
            border-color 0.35s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 35px rgba(0,0,0,0.10);
        }

        .dashboard-card-icon {
          transition: transform 0.4s ease;
        }

        .dashboard-card:hover .dashboard-card-icon {
          transform: rotate(-8deg) scale(1.12);
        }

        .dashboard-arrow {
          transition: transform 0.3s ease;
        }

        .dashboard-card:hover .dashboard-arrow {
          transform: translate(3px, -3px);
        }

        .dashboard-management-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .dashboard-management-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.08);
        }

        .dashboard-management-icon {
          transition: transform 0.35s ease;
        }

        .dashboard-management-card:hover .dashboard-management-icon {
          transform: rotate(8deg) scale(1.1);
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-page,
          .dashboard-heading,
          .dashboard-banner,
          .dashboard-stat,
          .dashboard-management,
          .dashboard-sofa,
          .dashboard-circle {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .dashboard-card,
          .dashboard-management-card,
          .dashboard-card-icon,
          .dashboard-management-icon {
            transition: none !important;
          }
        }
      `}</style>

      <div className="dashboard-page min-h-screen bg-[#F7F7F5] px-4 py-6 text-stone-800 dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">

          {/* Page Heading */}
          <div className="dashboard-heading flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-stone-500 dark:text-gray-400">
                <LayoutDashboard size={16} />
                <span>Admin Panel</span>
                <ChevronRight size={14} />
                <span className="font-medium text-amber-800 dark:text-amber-400">
                  Dashboard
                </span>
              </div>

              <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Dashboard Overview
              </h1>

              <p className="mt-2 text-sm text-stone-500 dark:text-gray-400">
                Welcome back,{" "}
                <span className="font-semibold text-stone-800 dark:text-gray-200">
                  {currentUser?.first_name || "Admin"}
                </span>
                ! Here's what's happening in your showroom.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-amber-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-700 dark:hover:bg-amber-600 sm:self-auto"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Dashboard
            </button>
          </div>

          {/* Welcome Banner */}
          <section className="dashboard-banner relative overflow-hidden rounded-3xl bg-linear-to-r from-stone-900 via-stone-800 to-amber-950 p-6 text-white shadow-lg sm:p-9">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-amber-200">
                <ShieldCheck size={14} />
                Administration Workspace
              </div>

              <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                Manage Your Showroom
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-300">
                Keep your furniture store organized. Manage products,
                categories and customer accounts from one place.
              </p>

              <Link
                to="/admin/product"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-amber-600 hover:shadow-lg"
              >
                Explore Products
                <ArrowUpRight size={17} />
              </Link>
            </div>

            <Sofa
              size={190}
              strokeWidth={0.7}
              className="dashboard-sofa absolute -bottom-10 -right-5 hidden text-white/10 sm:block"
            />

            <div className="dashboard-circle absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="dashboard-circle absolute -right-10 -top-14 h-44 w-44 rounded-full border border-white/10" />
          </section>

          {/* Statistics */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Store Overview</h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-gray-400">
                  Your showroom statistics at a glance.
                </p>
              </div>

              <span className="hidden rounded-full bg-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:bg-gray-800 dark:text-gray-300 sm:inline-flex">
                Overview
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <Link
                    key={card.title}
                    to={card.link}
                    style={{ animationDelay: `${0.15 + index * 0.16}s` }}
                    className={`dashboard-stat dashboard-card group rounded-2xl border border-stone-200 border-l-4 ${card.accent} bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`dashboard-card-icon flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}
                      >
                        <Icon size={23} />
                      </div>

                      <div className="dashboard-arrow flex h-9 w-9 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition group-hover:bg-amber-100 group-hover:text-amber-800 dark:bg-gray-800 dark:group-hover:bg-amber-950 dark:group-hover:text-amber-400">
                        <ArrowUpRight size={19} />
                      </div>
                    </div>

                    <p className="mt-6 text-sm font-medium text-stone-500 dark:text-gray-400">
                      {card.title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold tracking-tight">
                      {loading
                        ? "..."
                        : card.value.toLocaleString("en-IN")}
                    </h3>

                    <p className="mt-2 text-xs text-stone-500 dark:text-gray-400">
                      {card.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Management Section */}
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-bold">Quick Management</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-gray-400">
                Quickly access your store management sections.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {managementLinks.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.link}
                    style={{ animationDelay: `${0.55 + index * 0.14}s` }}
                    className="dashboard-management dashboard-management-card group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:border-amber-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-amber-700"
                  >
                    <div className="dashboard-management-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 transition group-hover:bg-amber-800 group-hover:text-white dark:bg-amber-950 dark:text-amber-400">
                      <Icon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={19}
                      className="shrink-0 text-stone-400 transition duration-300 group-hover:translate-x-1 group-hover:text-amber-700"
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col items-center justify-between gap-2 border-t border-stone-200 py-5 text-xs text-stone-500 dark:border-gray-800 dark:text-gray-400 sm:flex-row">
            <p>
              © {new Date().getFullYear()} CraftStudio. Admin Dashboard.
            </p>

            <p className="flex items-center gap-2">
              <ShieldCheck size={14} />
              Secure Administration Panel
            </p>
          </footer>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
