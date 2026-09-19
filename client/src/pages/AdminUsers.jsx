import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Search,
  Shield,
  UserCog,
  Trash2,
  RefreshCw,
  Mail,
  CalendarDays,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserRound,
  ShieldCheck,
  UserPlus,
  Crown,
  Filter,
  Clock,
  ChevronDown,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export default function AdminUsers() {
  // =========================================================
  // CURRENT USER
  // =========================================================

  const { currentUser } = useSelector(
    (state) => state.user
  );

  // =========================================================
  // STATE
  // =========================================================

  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingUserId, setUpdatingUserId] =
    useState(null);

  const [deletingUserId, setDeletingUserId] =
    useState(null);

  const [deleteUser, setDeleteUser] =
    useState(null);

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/admin/users",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load users."
        );
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error(
        "FETCH USERS ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while loading users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================================================
  // CLEAR SUCCESS MESSAGE
  // =========================================================

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  // =========================================================
  // UPDATE ROLE
  // =========================================================

  const handleRoleChange = async (
    userId,
    role
  ) => {
    try {
      setUpdatingUserId(userId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ role }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update user role."
        );
      }

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                role:
                  data.user?.role || role,
              }
            : user
        )
      );

      setSuccess(
        `${
          data.user?.username || "User"
        } is now ${role}.`
      );
    } catch (error) {
      console.error(
        "UPDATE ROLE ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while updating the role."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    if (
      currentUser?._id === deleteUser._id
    ) {
      setError(
        "You cannot delete your own administrator account."
      );

      setDeleteUser(null);

      return;
    }

    try {
      setDeletingUserId(deleteUser._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/users/${deleteUser._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete user."
        );
      }

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) =>
            user._id !== deleteUser._id
        )
      );

      setSuccess(
        `${
          deleteUser.username || "User"
        } has been deleted successfully.`
      );

      setDeleteUser(null);
    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while deleting the user."
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm
        .trim()
        .toLowerCase();

      const username =
        user.username?.toLowerCase() || "";

      const email =
        user.email?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        username.includes(search) ||
        email.includes(search);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return (
        matchesSearch && matchesRole
      );
    });
  }, [
    users,
    searchTerm,
    roleFilter,
  ]);

  // =========================================================
  // ROLE COUNTS
  // =========================================================

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const agentCount = users.filter(
    (user) => user.role === "agent"
  ).length;

  const regularUserCount = users.filter(
    (user) => user.role === "user"
  ).length;

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // RELATIVE DATE
  // =========================================================

  const getRelativeTime = (date) => {
    if (!date) return "Unknown";

    const now = new Date();
    const past = new Date(date);

    const difference =
      now.getTime() -
      past.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }

    if (days < 7) {
      return `${days} ${
        days === 1
          ? "day"
          : "days"
      } ago`;
    }

    return formatDate(date);
  };

  // =========================================================
  // ROLE BADGE
  // =========================================================

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 ring-1 ring-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:ring-purple-900">
          <Shield size={13} />
          Admin
        </span>
      );
    }

    if (role === "agent") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900">
          <UserCog size={13} />
          Agent
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
        <Users size={13} />
        User
      </span>
    );
  };

  // =========================================================
  // DEFAULT AVATAR
  // =========================================================

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-10 w-72 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />

            <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
                />
              )
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 shadow-sm dark:bg-green-950/40">
                <Users
                  size={25}
                  className="text-green-600 dark:text-green-400"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-green-600">
                    Administration
                  </span>

                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Manage Users
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-gray-600 dark:text-gray-400">
              Manage registered users, property
              agents and administrators across
              PrimePlaceEstate.
            </p>
          </div>

          <button
            onClick={() =>
              fetchUsers(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Users"}
          </button>
        </div>

        {/* ===================================================
            ALERTS
        =================================================== */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <CheckCircle
                size={19}
                className="text-green-600 dark:text-green-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-green-800 dark:text-green-300">
                Action completed
              </p>

              <p className="mt-0.5 text-sm text-green-700 dark:text-green-400">
                {success}
              </p>
            </div>

            <button
              onClick={() =>
                setSuccess("")
              }
              className="rounded-lg p-1 text-green-600 transition hover:bg-green-100 dark:hover:bg-green-900/40"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <AlertCircle
                size={19}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-red-800 dark:text-red-300">
                Action failed
              </p>

              <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>

            <button
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 text-red-600 transition hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ===================================================
            USER SUMMARY
        =================================================== */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gray-100 transition group-hover:scale-150 dark:bg-gray-800" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-gray-100 p-2.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  <Users size={20} />
                </div>

                <UserCheck
                  size={17}
                  className="text-gray-300 dark:text-gray-700"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Users
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
          </div>

          {/* REGULAR USERS */}

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-green-50 transition group-hover:scale-150 dark:bg-green-950/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-green-100 p-2.5 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <UserRound size={20} />
                </div>

                <UserPlus
                  size={17}
                  className="text-green-300 dark:text-green-800"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                Regular Users
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {regularUserCount}
              </p>
            </div>
          </div>

          {/* AGENTS */}

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-blue-50 transition group-hover:scale-150 dark:bg-blue-950/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <UserCog size={20} />
                </div>

                <UserCheck
                  size={17}
                  className="text-blue-300 dark:text-blue-800"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                Property Agents
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {agentCount}
              </p>
            </div>
          </div>

          {/* ADMINS */}

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-purple-50 transition group-hover:scale-150 dark:bg-purple-950/20" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-purple-100 p-2.5 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <ShieldCheck size={20} />
                </div>

                <Crown
                  size={17}
                  className="text-purple-300 dark:text-purple-800"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
                Administrators
              </p>

              <p className="mt-1 text-3xl font-bold text-purple-600 dark:text-purple-400">
                {adminCount}
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            USERS PANEL
        =================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* =================================================
              PANEL HEADER
          ================================================= */}

          <div className="border-b border-gray-200 px-5 py-5 dark:border-gray-800 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    All Users
                  </h2>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {filteredUsers.length}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Search and manage registered
                  accounts.
                </p>
              </div>

              {/* FILTER SUMMARY */}

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Filter size={14} />

                <span>
                  Filter:
                </span>

                <span className="font-semibold capitalize text-gray-700 dark:text-gray-200">
                  {roleFilter === "all"
                    ? "All roles"
                    : roleFilter}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="border-b border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-950/30 sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row">

              {/* SEARCH */}

              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-11 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                {searchTerm && (
                  <button
                    onClick={() =>
                      setSearchTerm("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* ROLE FILTER */}

              <div className="relative">
                <Filter
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(
                      e.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm font-medium text-gray-700 shadow-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 md:w-52"
                >
                  <option value="all">
                    All Roles
                  </option>

                  <option value="user">
                    Regular Users
                  </option>

                  <option value="agent">
                    Agents
                  </option>

                  <option value="admin">
                    Administrators
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* RESULTS */}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {users.length}
                </span>{" "}
                users
              </p>

              {(searchTerm ||
                roleFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                  }}
                  className="text-xs font-semibold text-green-600 transition hover:text-green-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-800 dark:bg-gray-950/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => {
                    const isCurrentUser =
                      currentUser?._id ===
                      user._id;

                    const isUpdating =
                      updatingUserId ===
                      user._id;

                    return (
                      <tr
                        key={user._id}
                        className="group border-b border-gray-100 transition last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                      >
                        {/* USER */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={
                                  user.avatar ||
                                  defaultAvatar
                                }
                                alt={
                                  user.username ||
                                  "User"
                                }
                                className="h-11 w-11 rounded-full border border-gray-200 object-cover shadow-sm dark:border-gray-700"
                                onError={(
                                  e
                                ) => {
                                  e.currentTarget.src =
                                    defaultAvatar;
                                }}
                              />

                              {isCurrentUser && (
                                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white dark:border-gray-900">
                                  <CheckCircle
                                    size={11}
                                  />
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="max-w-44 truncate font-semibold text-gray-900 dark:text-white">
                                  {user.username ||
                                    "Unnamed user"}
                                </p>

                                {isCurrentUser && (
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                    You
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-gray-400">
                                ID:{" "}
                                {user._id?.slice(
                                  -8
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}

                        <td className="px-6 py-5">
                          <div className="flex max-w-56 items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Mail
                              size={15}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="truncate">
                              {user.email ||
                                "No email"}
                            </span>
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="px-6 py-5">
                          <div className="flex flex-col items-start gap-2">
                            {getRoleBadge(
                              user.role
                            )}

                            <div className="relative">
                              <select
                                value={
                                  user.role ||
                                  "user"
                                }
                                disabled={
                                  isUpdating
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleRoleChange(
                                    user._id,
                                    e.target
                                      .value
                                  )
                                }
                                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-gray-700 outline-none transition hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                              >
                                <option value="user">
                                  User
                                </option>

                                <option value="agent">
                                  Agent
                                </option>

                                <option value="admin">
                                  Admin
                                </option>
                              </select>

                              <ChevronDown
                                size={13}
                                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                              />
                            </div>

                            {isUpdating && (
                              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />

                                Updating role...
                              </span>
                            )}
                          </div>
                        </td>

                        {/* JOINED */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-gray-100 p-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              <CalendarDays
                                size={15}
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formatDate(
                                  user.createdAt
                                )}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                {getRelativeTime(
                                  user.createdAt
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5 text-right">
                          {isCurrentUser ? (
                            <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400 dark:bg-gray-800">
                              <ShieldCheck
                                size={15}
                              />
                              Current account
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                setDeleteUser(
                                  user
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 opacity-80 transition hover:bg-red-50 hover:opacity-100 dark:border-red-900/50 dark:hover:bg-red-950/30"
                            >
                              <Trash2
                                size={16}
                              />

                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="divide-y divide-gray-200 md:hidden dark:divide-gray-800">
            {filteredUsers.map(
              (user) => {
                const isCurrentUser =
                  currentUser?._id ===
                  user._id;

                const isUpdating =
                  updatingUserId ===
                  user._id;

                return (
                  <div
                    key={user._id}
                    className="p-5 transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={
                            user.avatar ||
                            defaultAvatar
                          }
                          alt={
                            user.username ||
                            "User"
                          }
                          className="h-12 w-12 rounded-full border border-gray-200 object-cover shadow-sm dark:border-gray-700"
                          onError={(
                            e
                          ) => {
                            e.currentTarget.src =
                              defaultAvatar;
                          }}
                        />

                        {isCurrentUser && (
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white dark:border-gray-900">
                            <CheckCircle
                              size={11}
                            />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* USER INFO */}

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                {user.username ||
                                  "Unnamed user"}
                              </h3>

                              {isCurrentUser && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold uppercase text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                              <Mail
                                size={13}
                                className="shrink-0"
                              />

                              <span className="break-all">
                                {user.email ||
                                  "No email"}
                              </span>
                            </p>
                          </div>

                          {getRoleBadge(
                            user.role
                          )}
                        </div>

                        {/* DETAILS */}

                        <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/70">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <CalendarDays
                                size={14}
                              />

                              Joined
                            </span>

                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {formatDate(
                                user.createdAt
                              )}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Clock
                                size={14}
                              />

                              Activity
                            </span>

                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {getRelativeTime(
                                user.createdAt
                              )}
                            </span>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="relative">
                            <select
                              value={
                                user.role ||
                                "user"
                              }
                              disabled={
                                isUpdating
                              }
                              onChange={(
                                e
                              ) =>
                                handleRoleChange(
                                  user._id,
                                  e.target
                                    .value
                                )
                              }
                              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                              <option value="user">
                                User
                              </option>

                              <option value="agent">
                                Agent
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>

                            <ChevronDown
                              size={15}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            {isUpdating && (
                              <Loader2
                                size={14}
                                className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin text-green-500"
                              />
                            )}
                          </div>

                          {isCurrentUser ? (
                            <button
                              disabled
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-400 dark:bg-gray-800"
                            >
                              <ShieldCheck
                                size={15}
                              />

                              Current
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setDeleteUser(
                                  user
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                            >
                              <Trash2
                                size={15}
                              />

                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredUsers.length ===
            0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <Search
                  size={27}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
                No users found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                No users match your current
                search or role filter. Try
                changing your search terms or
                clearing the filters.
              </p>

              {(searchTerm ||
                roleFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===================================================
            FOOTER INFO
        =================================================== */}

        <div className="mt-5 flex flex-col gap-2 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={14}
              className="text-green-500"
            />

            <span>
              Administrator controls are protected.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={14} />

            <span>
              Last refreshed:{" "}
              {new Date().toLocaleTimeString(
                "en-ZA",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={() =>
            deletingUserId === null &&
            setDeleteUser(null)
          }
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/40">
                    <AlertTriangle
                      size={23}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Delete User
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Permanent account removal
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setDeleteUser(null)
                  }
                  disabled={
                    deletingUserId !== null
                  }
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}

            <div className="px-6 py-6">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <img
                  src={
                    deleteUser.avatar ||
                    defaultAvatar
                  }
                  alt={
                    deleteUser.username ||
                    "User"
                  }
                  className="h-12 w-12 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                  onError={(e) => {
                    e.currentTarget.src =
                      defaultAvatar;
                  }}
                />

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900 dark:text-white">
                    {deleteUser.username ||
                      "Unnamed user"}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                    {deleteUser.email ||
                      "No email"}
                  </p>
                </div>

                <div className="ml-auto">
                  {getRoleBadge(
                    deleteUser.role
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                <p className="text-sm leading-6 text-red-700 dark:text-red-300">
                  You are about to permanently
                  delete this user account. This
                  action cannot be undone.
                </p>
              </div>
            </div>

            {/* MODAL ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 dark:border-gray-800 dark:bg-gray-950/30 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  setDeleteUser(null)
                }
                disabled={
                  deletingUserId !== null
                }
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteUser}
                disabled={
                  deletingUserId !== null
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingUserId !==
                null ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />

                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}