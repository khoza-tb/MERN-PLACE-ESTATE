import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaCar,
  FaArrowRight,
  FaHome,
} from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FALLBACK IMAGE
  // =========================
  const fallbackImage =
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";

  // =========================
  // CLEAN IMAGE URL
  // =========================
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
      return fallbackImage;
    }

    // Handles markdown URLs:
    // [image](https://example.com/image.jpg)
    const markdownMatch = image.match(
      /\((https?:\/\/[^)\s]+)/
    );

    if (markdownMatch?.[1]) {
      return markdownMatch[1];
    }

    // Handles normal URLs
    const normalMatch = image.match(
      /https?:\/\/[^\s\])"]+/
    );

    if (normalMatch?.[0]) {
      return normalMatch[0];
    }

    return fallbackImage;
  };

  // =========================
  // FORMAT PRICE
  // =========================
  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "R0";
    }

    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // =========================
  // GET LISTINGS
  // =========================
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      // Homepage only shows newest properties
      params.set("limit", "6");
      params.set("sort", "createdAt");
      params.set("order", "desc");

      const url = `/api/listing/get?${params.toString()}`;

      console.log("HOME REQUEST:", url);

      const res = await fetch(url, {
        credentials: "include",
      });

      console.log("HOME STATUS:", res.status);

      const data = await res.json();

      console.log("HOME DATA:", data);

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to fetch listings"
        );
      }

      // New backend response
      if (
        data &&
        !Array.isArray(data) &&
        Array.isArray(data.listings)
      ) {
        setListings(data.listings);
        return;
      }

      // Old backend response
      if (Array.isArray(data)) {
        setListings(data);
        return;
      }

      throw new Error(
        "Server returned an invalid listings response."
      );
    } catch (err) {
      console.error(
        "HOME FETCH LISTINGS ERROR:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while loading properties."
      );

      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD LISTINGS
  // =========================
  useEffect(() => {
    fetchListings();
  }, []);

  // =========================
  // SEARCH
  // =========================
  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    const cleanSearch = searchTerm.trim();

    if (cleanSearch) {
      params.set("searchTerm", cleanSearch);
    }

    if (type && type !== "all") {
      params.set("type", type);
    }

    const queryString = params.toString();

    if (queryString) {
      navigate(`/search?${queryString}`);
    } else {
      navigate("/search");
    }
  };

  // =========================
  // VIEW ALL
  // =========================
  const handleViewAll = () => {
    navigate("/search");
  };

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative min-h-[620px] sm:min-h-[650px] lg:min-h-[700px] flex items-center overflow-hidden">

        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80')",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">

          <div className="max-w-3xl">

            {/* Brand */}
            <div className="flex items-center gap-2 text-green-400 font-semibold uppercase tracking-[0.18em] text-xs sm:text-sm mb-5">
              <FaHome className="shrink-0" />
              <span>PrimePlaceEstate</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.08]">
              Find a place
              <span className="text-green-400">
                {" "}you'll love{" "}
              </span>
              to call home.
            </h1>

            {/* Description */}
            <p className="text-slate-200 text-base sm:text-lg lg:text-xl mt-6 max-w-2xl leading-relaxed">
              Discover beautiful homes, apartments and
              properties for sale and rent with
              PrimePlaceEstate.
            </p>

            {/* =================================================
                SEARCH FORM
            ================================================= */}
            <form
              onSubmit={handleSearch}
              className="mt-8 sm:mt-10 bg-white rounded-2xl p-3 shadow-2xl w-full max-w-5xl"
            >
              <div className="flex flex-col md:flex-row gap-3">

                {/* Search Input */}
                <div className="flex items-center gap-3 flex-1 min-w-0 border border-slate-200 rounded-xl px-4 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 transition">

                  <FaSearch className="text-slate-400 shrink-0" />

                  <input
                    type="text"
                    placeholder="Search by property name or location..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="w-full min-w-0 py-3.5 sm:py-4 outline-none text-slate-700 text-sm sm:text-base"
                  />

                </div>

                {/* Property Type */}
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value)
                  }
                  className="w-full md:w-auto border border-slate-200 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-slate-700 outline-none cursor-pointer bg-white focus:border-green-600 focus:ring-2 focus:ring-green-100 transition text-sm sm:text-base"
                >
                  <option value="all">
                    All Properties
                  </option>

                  <option value="sale">
                    For Sale
                  </option>

                  <option value="rent">
                    For Rent
                  </option>
                </select>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full md:w-auto bg-green-700 hover:bg-green-800 active:bg-green-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FaSearch />
                  Search
                </button>

              </div>
            </form>

          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10 sm:mb-12">

            <p className="text-green-700 font-semibold uppercase tracking-[0.15em] text-xs sm:text-sm">
              Why PrimePlaceEstate
            </p>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-2 max-w-3xl mx-auto leading-tight">
              Everything you need to find your next home
            </h2>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">

            {/* Easy Search */}
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 text-center hover:shadow-md transition duration-300">

              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-5 text-xl">
                <FaSearch />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
                Easy Search
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Search properties by name, location
                and property type.
              </p>

            </div>

            {/* Great Locations */}
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 text-center hover:shadow-md transition duration-300">

              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-5 text-xl">
                <FaMapMarkerAlt />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
                Great Locations
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Find properties in locations that suit
                your lifestyle and needs.
              </p>

            </div>

            {/* Quality Properties */}
            <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 text-center hover:shadow-md transition duration-300 sm:col-span-2 lg:col-span-1">

              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-5 text-xl">
                <FaHome />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
                Quality Properties
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Explore houses, apartments and other
                properties available for sale and rent.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          LISTINGS
      ===================================================== */}
      <section className="py-12 sm:py-16 lg:py-20">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">

            <div>

              <p className="text-green-700 font-semibold uppercase tracking-[0.15em] text-xs sm:text-sm">
                Properties
              </p>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
                Featured Properties
              </h2>

            </div>

            {/* View All */}
            <button
              type="button"
              onClick={handleViewAll}
              className="self-start sm:self-auto text-green-700 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All
              <FaArrowRight />
            </button>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}
          {error && (
            <div className="mb-8 p-4 sm:p-5 rounded-xl bg-red-50 border border-red-200 text-red-700">

              <p className="font-semibold">
                Unable to load properties
              </p>

              <p className="text-sm mt-1 break-words">
                {error}
              </p>

            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}
          {loading ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">

              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <div
                    key={item}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
                  >

                    <div className="h-56 sm:h-60 lg:h-64 bg-slate-200" />

                    <div className="p-5 space-y-4">

                      <div className="h-5 bg-slate-200 rounded" />

                      <div className="h-4 bg-slate-200 rounded w-2/3" />

                      <div className="h-4 bg-slate-200 rounded w-1/2" />

                      <div className="h-8 bg-slate-200 rounded w-1/3" />

                    </div>

                  </div>
                )
              )}

            </div>

          ) : listings.length === 0 ? (

            /* =================================================
                NO LISTINGS
            ================================================= */
            <div className="text-center py-16 sm:py-20 px-5 bg-white rounded-2xl">

              <FaHome className="mx-auto text-4xl sm:text-5xl text-slate-300 mb-5" />

              <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                No properties found
              </h3>

              <p className="text-slate-500 mt-2 text-sm sm:text-base">
                There are currently no properties available.
              </p>

              <button
                type="button"
                onClick={handleViewAll}
                className="inline-flex items-center justify-center gap-2 mt-6 bg-green-700 hover:bg-green-800 text-white px-5 sm:px-6 py-3 rounded-xl font-semibold transition text-sm sm:text-base"
              >
                View All Properties
                <FaArrowRight />
              </button>

            </div>

          ) : (

            /* =================================================
                LISTING CARDS
            ================================================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">

              {listings.map((listing) => {

                const hasOffer =
                  listing.offer === true &&
                  Number(listing.discountPrice) > 0;

                const displayPrice = hasOffer
                  ? listing.discountPrice
                  : listing.regularPrice;

                return (
                  <Link
                    to={`/listing/${listing._id}`}
                    key={listing._id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 min-w-0"
                  >

                    {/* Image */}
                    <div className="relative h-56 sm:h-60 lg:h-64 overflow-hidden">

                      <img
                        src={getImageUrl(
                          listing.imageUrls?.[0]
                        )}
                        alt={
                          listing.name ||
                          "Property"
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.src =
                            fallbackImage;
                        }}
                      />

                      {/* Type Badge */}
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-green-700 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold capitalize">
                        {listing.type}
                      </div>

                      {/* Offer Badge */}
                      {hasOffer && (
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                          Special Offer
                        </div>
                      )}

                    </div>

                    {/* Details */}
                    <div className="p-4 sm:p-5">

                      {/* Name */}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                        {listing.name}
                      </h3>

                      {/* Address */}
                      <div className="flex items-center gap-2 text-slate-500 mt-2 min-w-0">

                        <FaMapMarkerAlt className="text-green-700 shrink-0" />

                        <span className="truncate text-sm sm:text-base">
                          {listing.address}
                        </span>

                      </div>

                      {/* Price */}
                      <div className="mt-4">

                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

                          <span className="text-xl sm:text-2xl font-bold text-green-700">
                            {formatPrice(displayPrice)}
                          </span>

                          {hasOffer && (
                            <span className="text-xs sm:text-sm text-slate-400 line-through">
                              {formatPrice(
                                listing.regularPrice
                              )}
                            </span>
                          )}

                        </div>

                        {listing.type === "rent" && (
                          <span className="text-sm text-slate-500">
                            / month
                          </span>
                        )}

                      </div>

                      {/* Property Info */}
                      <div className="flex items-center gap-x-4 gap-y-2 mt-5 text-xs sm:text-sm text-slate-600 flex-wrap">

                        {/* Bedrooms */}
                        <div className="flex items-center gap-2">
                          <FaBed className="text-green-700 shrink-0" />
                          {listing.bedrooms ?? 0} Beds
                        </div>

                        {/* Bathrooms */}
                        <div className="flex items-center gap-2">
                          <FaBath className="text-green-700 shrink-0" />
                          {listing.bathrooms ?? 0} Baths
                        </div>

                        {/* Parking */}
                        <div className="flex items-center gap-2">
                          <FaCar className="text-green-700 shrink-0" />
                          {listing.parking
                            ? "Parking"
                            : "No Parking"}
                        </div>

                      </div>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-900">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Ready to find your next property?
          </h2>

          <p className="text-slate-300 mt-5 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Browse available properties and discover a
            place that feels like home.
          </p>

          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 mt-8 bg-green-600 hover:bg-green-700 text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold transition text-sm sm:text-base"
          >
            Explore Properties
            <FaArrowRight />
          </Link>

        </div>

      </section>

    </main>
  );
}