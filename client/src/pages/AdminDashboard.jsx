import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Home,
  MessageSquare,
  UserCog,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  UserPlus,
  Building2,
  Clock,
  CheckCircle,
  Eye,
  Mail,
  MapPin,
  CalendarDays,
  UserRound,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboard() {
  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalInquiries: 0,
    newInquiries: 0,
    adminUsers: 0,
    agentUsers: 0,
  });

  // =====================================================
  // RECENT ACTIVITY
  // =====================================================

  const [activity, setActivity] = useState({
    recentInquiries: [],
    recentListings: [],
    recentUsers: [],
  });

  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] =
    useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD STATS
  // =====================================================

  const fetchStats = async () => {
    try {
      const response = await fetch(
        "/api/admin/stats",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load dashboard statistics."
        );
      }

      setStats(
        data.stats || {
          totalUsers: 0,
          totalListings: 0,
          totalInquiries: 0,
          newInquiries: 0,
          adminUsers: 0,
          agentUsers: 0,
        }
      );
    } catch (error) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard statistics."
      );
    }
  };

  // =====================================================
  // FETCH RECENT ACTIVITY
  // =====================================================

  const fetchActivity = async () => {
    try {
      setActivityLoading(true);

      const response = await fetch(
        "/api/admin/activity",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load recent activity."
        );
      }

      setActivity(
        data.activity || {
          recentInquiries: [],
          recentListings: [],
          recentUsers: [],
        }
      );
    } catch (error) {
      console.error(
        "ADMIN ACTIVITY ERROR:",
        error
      );
    } finally {
      setActivityLoading(false);
    }
  };

  // =====================================================
  // REFRESH DASHBOARD
  // =====================================================

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchStats(),
        fetchActivity(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD + AUTO REFRESH
  // =====================================================

  useEffect(() => {
    refreshDashboard();

    const interval = setInterval(() => {
      refreshDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // DATE HELPERS
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleDateString(
      "en-ZA",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleString(
      "en-ZA",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // RELATIVE TIME
  // =====================================================

  const getRelativeTime = (date) => {
    if (!date) return "Unknown time";

    const now = new Date();
    const past = new Date(date);

    const difference =
      now.getTime() - past.getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    const minutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    if (days < 7) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return formatDate(date);
  };

  // =====================================================
  // GET LISTING IMAGE
  // =====================================================

  const getListingImage = (listing) => {
    if (
      listing?.imageUrls &&
      Array.isArray(listing.imageUrls) &&
      listing.imageUrls.length > 0
    ) {
      return listing.imageUrls[0];
    }

    return null;
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const StatusBadge = ({ status }) => {
    const styles = {
      new: "bg-red-50 text-red-600 ring-1 ring-red-100 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900",

      read: "bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-900",

      replied:
        "bg-green-50 text-green-600 ring-1 ring-green-100 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-900",
    };

    const labels = {
      new: "New",
      read: "Read",
      replied: "Replied",
    };

    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          styles[status] || styles.read
        }`}
      >
        {status === "new" && (
          <Clock size={12} />
        )}

        {status === "read" && (
          <Eye size={12} />
        )}

        {status === "replied" && (
          <CheckCircle size={12} />
        )}

        {labels[status] || status}
      </span>
    );
  };

  // =====================================================
  // ROLE BADGE
  // =====================================================

  const RoleBadge = ({ role }) => {
    const roleStyles = {
      admin:
        "bg-purple-50 text-purple-600 ring-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:ring-purple-900",

      agent:
        "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-900",

      user:
        "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700",
    };

    return (
      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ring-1 ${
          roleStyles[role] ||
          roleStyles.user
        }`}
      >
        {role || "user"}
      </span>
    );
  };

  // =====================================================
  // STAT CARDS
  // =====================================================

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      link: "/admin/users",
    },

    {
      title: "Total Listings",
      value: stats.totalListings,
      icon: Home,
      description: "Properties on platform",
      link: "/admin/listings",
    },

    {
      title: "Total Inquiries",
      value: stats.totalInquiries,
      icon: MessageSquare,
      description: "Property inquiries",
      link: "/admin/inquiries",
    },

    {
      title: "New Inquiries",
      value: stats.newInquiries,
      icon: MessageSquare,
      description: "Waiting for attention",
      link: "/admin/inquiries",
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-green-600">
                <ShieldCheck size={22} />

                <span className="text-sm font-semibold">
                  Administrator
                </span>
              </div>

              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                <LayoutDashboard
                  className="text-green-600"
                  size={30}
                />

                Admin Dashboard
              </h1>

              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage PrimePlaceEstate from one
                central dashboard.
              </p>
            </div>

            <button
              onClick={refreshDashboard}
              disabled={
                loading || activityLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <RefreshCw
                size={17}
                className={
                  loading || activityLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.link}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-50 transition duration-300 group-hover:scale-150 dark:bg-green-950/20" />

                <div className="relative flex items-start justify-between">
                  <div className="rounded-xl bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Icon size={24} />
                  </div>

                  <ArrowRight
                    size={20}
                    className="text-gray-400 transition duration-300 group-hover:translate-x-1 group-hover:text-green-600"
                  />
                </div>

                <div className="relative mt-6">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {loading
                      ? "..."
                      : card.value}
                  </p>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* =====================================================
            USER ROLES + QUICK ACTIONS
        ===================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* USER ROLES */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <UserCog size={23} />
              </div>

              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  User Roles
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current platform roles
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Admins
                  </p>

                  <ShieldCheck
                    size={17}
                    className="text-purple-500"
                  />
                </div>

                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {loading
                    ? "..."
                    : stats.adminUsers}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Agents
                  </p>

                  <UserCog
                    size={17}
                    className="text-blue-500"
                  />
                </div>

                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {loading
                    ? "..."
                    : stats.agentUsers}
                </p>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage the most important areas.
                </p>
              </div>

              <LayoutDashboard
                size={21}
                className="text-gray-300 dark:text-gray-700"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              <Link
                to="/admin/users"
                className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 transition duration-200 hover:border-green-400 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <Users size={18} />
                  </div>

                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Users
                  </span>
                </div>

                <ArrowRight
                  size={16}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600"
                />
              </Link>

              <Link
                to="/admin/listings"
                className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 transition duration-200 hover:border-green-400 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Building2 size={18} />
                  </div>

                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Listings
                  </span>
                </div>

                <ArrowRight
                  size={16}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600"
                />
              </Link>

              <Link
                to="/admin/inquiries"
                className="group flex items-center justify-between rounded-xl border border-gray-200 p-4 transition duration-200 hover:border-green-400 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <MessageSquare size={18} />
                  </div>

                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Inquiries
                  </span>
                </div>

                <ArrowRight
                  size={16}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            RECENT ACTIVITY HEADER
        ===================================================== */}

        <div className="mt-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />

                <span className="text-xs font-bold uppercase tracking-widest text-green-600">
                  Live Activity
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Latest activity across PrimePlaceEstate.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <RefreshCw size={12} />

              Auto-refreshes every 30s
            </span>
          </div>

          {/* =====================================================
              ACTIVITY COLUMNS
          ===================================================== */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* =================================================
                RECENT INQUIRIES
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              {/* HEADER */}

              <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative rounded-xl bg-green-100 p-2.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <MessageSquare size={20} />

                      {activity.recentInquiries.length >
                        0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[9px] font-bold text-white">
                          {activity.recentInquiries.length}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Recent Inquiries
                      </h3>

                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        Latest property messages
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/admin/inquiries"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-800"
                    title="View all inquiries"
                  >
                    <ExternalLink size={17} />
                  </Link>
                </div>
              </div>

              {/* CONTENT */}

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activityLoading ? (
                  <>
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="animate-pulse p-5"
                      >
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />

                          <div className="flex-1">
                            <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />

                            <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />

                            <div className="mt-4 h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : activity.recentInquiries
                    .length > 0 ? (
                  activity.recentInquiries.map(
                    (inquiry) => {
                      const senderName =
                        inquiry.name ||
                        inquiry.senderId
                          ?.username ||
                        "Unknown user";

                      const senderEmail =
                        inquiry.email ||
                        inquiry.senderId
                          ?.email ||
                        "No email";

                      return (
                        <Link
                          key={inquiry._id}
                          to="/admin/inquiries"
                          className="group block p-5 transition duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <div className="flex items-start gap-3">
                            {/* AVATAR */}

                            {inquiry.senderId
                              ?.avatar ? (
                              <img
                                src={
                                  inquiry
                                    .senderId
                                    .avatar
                                }
                                alt={senderName}
                                className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <UserRound
                                  size={18}
                                />
                              </div>
                            )}

                            {/* DETAILS */}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-green-600 dark:text-white">
                                    {senderName}
                                  </p>

                                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <Mail
                                      size={12}
                                    />

                                    <span className="truncate">
                                      {senderEmail}
                                    </span>
                                  </div>
                                </div>

                                <StatusBadge
                                  status={
                                    inquiry.status
                                  }
                                />
                              </div>

                              <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800">
                                <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {inquiry
                                    .listingId
                                    ?.name ||
                                    "Property inquiry"}
                                </p>
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <CalendarDays
                                    size={12}
                                  />

                                  {getRelativeTime(
                                    inquiry.createdAt
                                  )}
                                </span>

                                <span className="text-[10px] text-gray-400">
                                  {formatDateTime(
                                    inquiry.createdAt
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    }
                  )
                ) : (
                  <div className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                      <MessageSquare size={24} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No recent inquiries
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      New property inquiries will
                      appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="border-t border-gray-100 p-3 dark:border-gray-800">
                <Link
                  to="/admin/inquiries"
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-50 dark:hover:bg-green-950/20"
                >
                  View all inquiries

                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* =================================================
                RECENT LISTINGS
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              {/* HEADER */}

              <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative rounded-xl bg-blue-100 p-2.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Building2 size={20} />

                      {activity.recentListings.length >
                        0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                          {activity.recentListings.length}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Recent Listings
                      </h3>

                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        Latest properties
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/admin/listings"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-800"
                    title="View all listings"
                  >
                    <ExternalLink size={17} />
                  </Link>
                </div>
              </div>

              {/* CONTENT */}

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activityLoading ? (
                  <>
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex animate-pulse gap-3 p-5"
                      >
                        <div className="h-20 w-24 rounded-xl bg-gray-200 dark:bg-gray-800" />

                        <div className="flex-1">
                          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

                          <div className="mt-3 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />

                          <div className="mt-3 h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-800" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : activity.recentListings
                    .length > 0 ? (
                  activity.recentListings.map(
                    (listing) => {
                      const image =
                        getListingImage(
                          listing
                        );

                      return (
                        <Link
                          key={listing._id}
                          to={`/listing/${listing._id}`}
                          className="group block p-5 transition duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <div className="flex gap-3">
                            {/* IMAGE */}

                            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                              {image ? (
                                <img
                                  src={image}
                                  alt={
                                    listing.name ||
                                    "Property"
                                  }
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                  <Home
                                    size={24}
                                  />
                                </div>
                              )}

                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>

                            {/* DETAILS */}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-green-600 dark:text-white">
                                  {listing.name ||
                                    "Unnamed property"}
                                </p>

                                <ArrowRight
                                  size={15}
                                  className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-green-600"
                                />
                              </div>

                              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <MapPin
                                  size={12}
                                  className="shrink-0"
                                />

                                <span className="truncate">
                                  {listing.address ||
                                    "No address"}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold capitalize text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                  {listing.type ||
                                    "Property"}
                                </span>

                                {listing.offer && (
                                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                                    Special Offer
                                  </span>
                                )}
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <Clock size={12} />

                                  {getRelativeTime(
                                    listing.createdAt
                                  )}
                                </span>

                                <span className="text-[10px] text-gray-400">
                                  {formatDate(
                                    listing.createdAt
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    }
                  )
                ) : (
                  <div className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                      <Building2 size={24} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No recent listings
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      New properties will appear
                      here.
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="border-t border-gray-100 p-3 dark:border-gray-800">
                <Link
                  to="/admin/listings"
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-50 dark:hover:bg-green-950/20"
                >
                  View all listings

                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* =================================================
                RECENT USERS
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              {/* HEADER */}

              <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative rounded-xl bg-purple-100 p-2.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      <UserPlus size={20} />

                      {activity.recentUsers.length >
                        0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[9px] font-bold text-white">
                          {activity.recentUsers.length}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Recent Users
                      </h3>

                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        Latest registrations
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/admin/users"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-800"
                    title="View all users"
                  >
                    <ExternalLink size={17} />
                  </Link>
                </div>
              </div>

              {/* CONTENT */}

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {activityLoading ? (
                  <>
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex animate-pulse gap-3 p-5"
                      >
                        <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-gray-800" />

                        <div className="flex-1">
                          <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />

                          <div className="mt-3 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />

                          <div className="mt-3 h-5 w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : activity.recentUsers
                    .length > 0 ? (
                  activity.recentUsers.map(
                    (user) => (
                      <Link
                        key={user._id}
                        to="/admin/users"
                        className="group block p-5 transition duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <div className="flex items-start gap-3">
                          {/* AVATAR */}

                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={
                                user.username ||
                                "User"
                              }
                              className="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover shadow-sm dark:border-gray-900"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                              <Users size={19} />
                            </div>
                          )}

                          {/* DETAILS */}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-green-600 dark:text-white">
                                {user.username ||
                                  "Unnamed user"}
                              </p>

                              <RoleBadge
                                role={
                                  user.role
                                }
                              />
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Mail
                                size={12}
                                className="shrink-0"
                              />

                              <span className="truncate">
                                {user.email ||
                                  "No email"}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                <CalendarDays
                                  size={12}
                                />

                                Joined{" "}
                                {getRelativeTime(
                                  user.createdAt
                                )}
                              </span>

                              <span className="text-[10px] text-gray-400">
                                {formatDate(
                                  user.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  )
                ) : (
                  <div className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                      <Users size={24} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No recent users
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      New registrations will appear
                      here.
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="border-t border-gray-100 p-3 dark:border-gray-800">
                <Link
                  to="/admin/users"
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-green-600 transition hover:bg-green-50 dark:hover:bg-green-950/20"
                >
                  View all users

                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}