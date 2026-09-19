import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Home,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

import { signOutUserSuccess } from "../redux/user/userSlice";

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "/api/auth/signout",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Logout failed"
        );
      }

      // Clear Redux user state
      dispatch(signOutUserSuccess());

      // Close mobile sidebar
      setMobileOpen(false);

      // Go to ADMIN sign in
      navigate("/admin/signin", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "ADMIN LOGOUT ERROR:",
        error
      );
    }
  };

  // =====================================================
  // ADMIN NAVIGATION
  // =====================================================

  const navigation = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Listings",
      path: "/admin/listings",
      icon: Building2,
    },
    {
      name: "Inquiries",
      path: "/admin/inquiries",
      icon: MessageSquare,
    },
  ];

  // =====================================================
  // SIDEBAR CONTENT
  // =====================================================

  const SidebarContent = () => (
    <div className="flex h-full flex-col">

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="flex h-20 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-700">

        <button
          onClick={() => {
            navigate("/admin/dashboard");
            setMobileOpen(false);
          }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-lg">
            <ShieldCheck size={22} />
          </div>

          <div className="text-left">
            <h1 className="font-bold text-gray-900 dark:text-white">
              PrimePlace
            </h1>

            <p className="text-xs text-green-600">
              Admin Panel
            </p>
          </div>
        </button>

        {/* MOBILE CLOSE */}

        <button
          onClick={() =>
            setMobileOpen(false)
          }
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <X size={22} />
        </button>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Management
        </p>

        <nav className="space-y-2">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path ===
                  "/admin/dashboard"
                }
                onClick={() =>
                  setMobileOpen(false)
                }
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={20} />

                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* =================================================
            WEBSITE
        ================================================= */}

        <div className="mt-8">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Website
          </p>

          <button
            onClick={() => {
              navigate("/");
              setMobileOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Home size={20} />

            <span>
              View Website
            </span>

            <ExternalLink
              size={15}
              className="ml-auto opacity-50"
            />
          </button>

        </div>
      </div>

      {/* =================================================
          LOGOUT
      ================================================= */}

      <div className="border-t border-gray-200 p-4 dark:border-gray-700">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut size={20} />

          <span>
            Logout
          </span>
        </button>

      </div>
    </div>
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          MOBILE MENU BUTTON
      ================================================= */}

      <button
        onClick={() =>
          setMobileOpen(true)
        }
        className="fixed left-4 top-4 z-40 rounded-xl bg-white p-3 shadow-lg dark:bg-gray-900 lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 lg:block">
        <SidebarContent />
      </aside>

      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      {mobileOpen && (
        <>
          {/* OVERLAY */}

          <div
            onClick={() =>
              setMobileOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />

          {/* SIDEBAR */}

          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl dark:bg-gray-900 lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}