
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Search,
  Trash2,
  RefreshCw,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Sofa,
  CalendarDays,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Tag,
  Building2,
  KeyRound,
  BadgePercent,
  SlidersHorizontal,
  Image as ImageIcon,
  Clock3,
} from "lucide-react";

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [offerFilter, setOfferFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deletingListingId, setDeletingListingId] =
    useState(null);

  const [deleteListing, setDeleteListing] =
    useState(null);

  // =========================================================
  // IMAGE HELPER
  // =========================================================

  const getImageUrl = (image) => {
    const fallback =
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";

    if (!image || typeof image !== "string") {
      return fallback;
    }

    const markdownMatch = image.match(
      /\((https?:\/\/[^)\s]+)/
    );

    if (markdownMatch?.[1]) {
      return markdownMatch[1];
    }

    const normalMatch = image.match(
      /https?:\/\/[^\s\])"]+/
    );

    if (normalMatch?.[0]) {
      return normalMatch[0];
    }

    return fallback;
  };

  // =========================================================
  // FETCH LISTINGS
  // =========================================================

  const fetchListings = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/admin/listings",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load listings."
        );
      }

      setListings(
        Array.isArray(data.listings)
          ? data.listings
          : []
      );
    } catch (error) {
      console.error(
        "FETCH ADMIN LISTINGS ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while loading listings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // =========================================================
  // CLEAR SUCCESS
  // =========================================================

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  // =========================================================
  // DELETE LISTING
  // =========================================================

  const handleDeleteListing = async () => {
    if (!deleteListing) return;

    try {
      setDeletingListingId(deleteListing._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/listings/${deleteListing._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete listing."
        );
      }

      setListings((previousListings) =>
        previousListings.filter(
          (listing) =>
            listing._id !== deleteListing._id
        )
      );

      setSuccess(
        `${deleteListing.name} has been deleted successfully.`
      );

      setDeleteListing(null);
    } catch (error) {
      console.error(
        "DELETE LISTING ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while deleting the listing."
      );
    } finally {
      setDeletingListingId(null);
    }
  };

  // =========================================================
  // FILTER LISTINGS
  // =========================================================

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const search =
        searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        listing.name
          ?.toLowerCase()
          .includes(search) ||
        listing.address
          ?.toLowerCase()
          .includes(search) ||
        listing.description
          ?.toLowerCase()
          .includes(search);

      const matchesType =
        typeFilter === "all" ||
        listing.type === typeFilter;

      const matchesOffer =
        offerFilter === "all" ||
        (offerFilter === "offer" &&
          listing.offer === true) ||
        (offerFilter === "regular" &&
          listing.offer !== true);

      return (
        matchesSearch &&
        matchesType &&
        matchesOffer
      );
    });
  }, [
    listings,
    searchTerm,
    typeFilter,
    offerFilter,
  ]);

  // =========================================================
  // COUNTS
  // =========================================================

  const saleCount = listings.filter(
    (listing) => listing.type === "sale"
  ).length;

  const rentCount = listings.filter(
    (listing) => listing.type === "rent"
  ).length;

  const offerCount = listings.filter(
    (listing) => listing.offer === true
  ).length;

  // =========================================================
  // PRICE
  // =========================================================

  const formatPrice = (listing) => {
    const regularPrice =
      Number(listing.regularPrice) || 0;

    const discountPrice =
      Number(listing.discountPrice) || 0;

    const hasDiscount =
      listing.offer &&
      discountPrice > 0 &&
      discountPrice < regularPrice;

    const price = hasDiscount
      ? discountPrice
      : regularPrice;

    return {
      price: price.toLocaleString("en-ZA"),
      regularPrice:
        regularPrice.toLocaleString("en-ZA"),
      hasDiscount,
    };
  };

  // =========================================================
  // DATE
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

  const getRelativeDate = (date) => {
    if (!date) return "";

    const created = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() - created.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min${
        minutes !== 1 ? "s" : ""
      } ago`;
    }

    if (hours < 24) {
      return `${hours} hour${
        hours !== 1 ? "s" : ""
      } ago`;
    }

    if (days < 30) {
      return `${days} day${
        days !== 1 ? "s" : ""
      } ago`;
    }

    return formatDate(date);
  };

  // =========================================================
  // DISCOUNT PERCENTAGE
  // =========================================================

  const getDiscountPercentage = (listing) => {
    const regularPrice =
      Number(listing.regularPrice) || 0;

    const discountPrice =
      Number(listing.discountPrice) || 0;

    if (
      !listing.offer ||
      !regularPrice ||
      !discountPrice ||
      discountPrice >= regularPrice
    ) {
      return null;
    }

    return Math.round(
      ((regularPrice - discountPrice) /
        regularPrice) *
        100
    );
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const hasActiveFilters =
    searchTerm ||
    typeFilter !== "all" ||
    offerFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setOfferFilter("all");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />

              <div>
                <div className="h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                <div className="mt-3 h-9 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>

          <div className="mb-6 h-28 animate-pulse rounded-2xl bg-white dark:bg-gray-900" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="h-56 animate-pulse bg-gray-200 dark:bg-gray-800" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

                    <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              )
            )}
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

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 shadow-sm dark:bg-green-950/40">
                <Home
                  size={25}
                  className="text-green-600 dark:text-green-400"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Manage Listings
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Property management
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              View, inspect and manage all
              PrimePlaceEstate properties from one
              place.
            </p>
          </div>

          <button
            onClick={() => fetchListings(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <RefreshCw
              size={18}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Listings"}
          </button>
        </div>

        {/* ALERTS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/60">
              <CheckCircle
                size={19}
                className="text-green-600 dark:text-green-400"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                Action completed
              </p>

              <p className="mt-0.5 text-sm text-green-700 dark:text-green-400">
                {success}
              </p>
            </div>

            <button
              onClick={() => setSuccess("")}
              className="rounded-lg p-1 text-green-600 transition hover:bg-green-100 dark:hover:bg-green-900/40"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
              <AlertCircle
                size={19}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Something went wrong
              </p>

              <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-600 transition hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gray-100 transition group-hover:scale-125 dark:bg-gray-800" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <Building2
                    size={20}
                    className="text-gray-600 dark:text-gray-300"
                  />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  All
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Listings
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {listings.length}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-green-950/60 dark:bg-gray-900">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-green-50 transition group-hover:scale-125 dark:bg-green-950/30" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/50">
                  <Home
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-600 dark:bg-green-950/40 dark:text-green-400">
                  Sale
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                For Sale
              </p>

              <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
                {saleCount}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-blue-950/60 dark:bg-gray-900">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 transition group-hover:scale-125 dark:bg-blue-950/30" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                  <KeyRound
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  Rent
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                For Rent
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {rentCount}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-orange-950/60 dark:bg-gray-900">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-50 transition group-hover:scale-125 dark:bg-orange-950/30" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/50">
                  <BadgePercent
                    size={20}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>

                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                  Deals
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Special Offers
              </p>

              <p className="mt-1 text-3xl font-bold text-orange-500">
                {offerCount}
              </p>
            </div>
          </div>
        </div>

        {/* FILTER PANEL */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={18}
                className="text-gray-500"
              />

              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Filter Listings
              </h2>

              {hasActiveFilters && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  Active
                </span>
              )}
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-3 lg:flex-row">

              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search by property name, address or description..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="all">
                  All Types
                </option>

                <option value="sale">
                  For Sale
                </option>

                <option value="rent">
                  For Rent
                </option>
              </select>

              <select
                value={offerFilter}
                onChange={(e) =>
                  setOfferFilter(e.target.value)
                }
                className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="all">
                  All Listings
                </option>

                <option value="offer">
                  Special Offers
                </option>

                <option value="regular">
                  Regular Listings
                </option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Home size={15} />

                Showing{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {filteredListings.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {listings.length}
                </span>{" "}
                listings
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      Search: {searchTerm}
                    </span>
                  )}

                  {typeFilter !== "all" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                      {typeFilter === "sale"
                        ? "For Sale"
                        : "For Rent"}
                    </span>
                  )}

                  {offerFilter !== "all" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                      {offerFilter === "offer"
                        ? "Special Offers"
                        : "Regular"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LISTINGS */}

        {filteredListings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => {
              const pricing = formatPrice(listing);
              const discount =
                getDiscountPercentage(listing);

              // Support both field naming styles
              const bedrooms =
                listing.bedrooms ??
                listing.bedRooms ??
                0;

              const bathrooms =
                listing.bathrooms ??
                listing.bathRooms ??
                0;

              return (
                <article
                  key={listing._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* IMAGE */}

                  <div className="relative h-60 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={getImageUrl(
                        listing.imageUrls?.[0]
                      )}
                      alt={
                        listing.name || "Property"
                      }
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-md">
                        {listing.type === "rent" ? (
                          <KeyRound size={13} />
                        ) : (
                          <Home size={13} />
                        )}

                        {listing.type === "rent"
                          ? "For Rent"
                          : "For Sale"}
                      </span>
                    </div>

                    {listing.offer && (
                      <div className="absolute right-4 top-4">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
                          <Tag size={13} />

                          Offer

                          {discount && (
                            <span>
                              -{discount}%
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div className="flex items-center gap-2 text-white">
                        {listing.imageUrls?.length > 1 && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium backdrop-blur-md">
                            <ImageIcon size={13} />

                            {
                              listing.imageUrls
                                .length
                            }{" "}
                            photos
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs text-white backdrop-blur-md">
                        <Clock3 size={13} />

                        {getRelativeDate(
                          listing.createdAt
                        )}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-5">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-gray-900 dark:text-white">
                        {listing.name ||
                          "Unnamed Property"}
                      </h2>

                      <div className="mt-2 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                        />

                        <span className="line-clamp-2">
                          {listing.address ||
                            "Address unavailable"}
                        </span>
                      </div>
                    </div>

                    {/* PRICE */}

                    <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/70">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                            {listing.type === "rent"
                              ? "Monthly Price"
                              : "Listing Price"}
                          </p>

                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              R {pricing.price}
                            </span>

                            {pricing.hasDiscount && (
                              <span className="text-sm text-gray-400 line-through">
                                R{" "}
                                {
                                  pricing.regularPrice
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        {discount && (
                          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-100 px-2.5 py-1.5 text-xs font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                            <BadgePercent size={14} />

                            {discount}%
                          </div>
                        )}
                      </div>

                      {listing.type === "rent" && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          per month
                        </p>
                      )}
                    </div>

                    {/* DETAILS */}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <BedDouble
                          size={16}
                          className="text-gray-400"
                        />

                        <span>
                          <strong className="text-gray-900 dark:text-white">
                            {bedrooms}
                          </strong>{" "}
                          Beds
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <Bath
                          size={16}
                          className="text-gray-400"
                        />

                        <span>
                          <strong className="text-gray-900 dark:text-white">
                            {bathrooms}
                          </strong>{" "}
                          Baths
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <Car
                          size={16}
                          className="text-gray-400"
                        />

                        <span>
                          {listing.parking
                            ? "Parking"
                            : "No Parking"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <Sofa
                          size={16}
                          className="text-gray-400"
                        />

                        <span>
                          {listing.furnished
                            ? "Furnished"
                            : "Unfurnished"}
                        </span>
                      </div>
                    </div>

                    {/* DATE */}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <CalendarDays size={14} />

                        <span>
                          Listed{" "}
                          {formatDate(
                            listing.createdAt
                          )}
                        </span>
                      </div>

                      {listing.userRef && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          Verified Listing
                        </span>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex gap-2">
                      <Link
                        to={`/listing/${listing._id}`}
                        className="group/view inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                      >
                        <Eye
                          size={16}
                          className="transition group-hover/view:scale-110"
                        />

                        View Property
                      </Link>

                      <button
                        onClick={() =>
                          setDeleteListing(listing)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm dark:border-red-900/50 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={16} />

                        <span className="hidden sm:inline">
                          Delete
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* EMPTY STATE */

          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              {hasActiveFilters ? (
                <Search
                  size={32}
                  className="text-gray-400"
                />
              ) : (
                <Home
                  size={32}
                  className="text-gray-400"
                />
              )}
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
              {hasActiveFilters
                ? "No matching listings"
                : "No listings yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? "We couldn't find any properties matching your current search and filters. Try adjusting them."
                : "There are currently no properties available in the PrimePlaceEstate system."}
            </p>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}

      {deleteListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() =>
            deletingListingId === null &&
            setDeleteListing(null)
          }
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                  <Trash2
                    size={22}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Delete Listing
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Permanent action
                  </p>
                </div>

                <button
                  onClick={() =>
                    setDeleteListing(null)
                  }
                  disabled={
                    deletingListingId !== null
                  }
                  className="ml-auto rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}

            <div className="p-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <img
                    src={getImageUrl(
                      deleteListing.imageUrls?.[0]
                    )}
                    alt={deleteListing.name}
                    className="h-16 w-16 rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80";
                    }}
                  />

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {deleteListing.name}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin size={12} />

                      <span className="truncate">
                        {deleteListing.address}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to permanently
                delete this property? This listing
                and its associated information will
                no longer be available.
              </p>

              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
                <div className="flex gap-2">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                  />

                  <p className="text-xs leading-5 text-red-700 dark:text-red-400">
                    This action cannot be undone.
                    Make sure you want to remove
                    this listing before continuing.
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() =>
                    setDeleteListing(null)
                  }
                  disabled={
                    deletingListingId !== null
                  }
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteListing}
                  disabled={
                    deletingListingId !== null
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingListingId !== null ? (
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

                      Delete Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
