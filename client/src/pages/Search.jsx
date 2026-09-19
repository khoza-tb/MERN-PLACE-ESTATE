import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  Search as SearchIcon,
  SlidersHorizontal,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Sofa,
  Tag,
  X,
  ArrowUpDown,
  Map,
  List,
  Loader2,
  Home,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// =====================================================
// FIX LEAFLET DEFAULT MARKER ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// =====================================================
// CONSTANTS
// =====================================================

const PAGE_SIZE = 12;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";

const DEFAULT_MAP_CENTER = [-25.7479, 28.2293];

// =====================================================
// MAP CONTROLLER
// =====================================================

function MapController({ listings }) {
  const map = useMap();

  useEffect(() => {
    const validListings = listings.filter(
      (listing) =>
        Number.isFinite(Number(listing.latitude)) &&
        Number.isFinite(Number(listing.longitude)) &&
        Number(listing.latitude) !== 0 &&
        Number(listing.longitude) !== 0
    );

    if (validListings.length === 0) {
      map.setView(DEFAULT_MAP_CENTER, 11);
      return;
    }

    if (validListings.length === 1) {
      map.setView(
        [
          Number(validListings[0].latitude),
          Number(validListings[0].longitude),
        ],
        14
      );

      return;
    }

    const bounds = L.latLngBounds(
      validListings.map((listing) => [
        Number(listing.latitude),
        Number(listing.longitude),
      ])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 14,
    });
  }, [listings, map]);

  return null;
}

// =====================================================
// SEARCH PAGE
// =====================================================

export default function Search() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  // ===================================================
  // FILTER STATE
  // ===================================================

  const [searchTerm, setSearchTerm] =
    useState(searchParams.get("searchTerm") || "");

  const [type, setType] =
    useState(searchParams.get("type") || "all");

  const [minPrice, setMinPrice] =
    useState(searchParams.get("minPrice") || "");

  const [maxPrice, setMaxPrice] =
    useState(searchParams.get("maxPrice") || "");

  const [bedrooms, setBedrooms] =
    useState(searchParams.get("bedrooms") || "");

  const [bathrooms, setBathrooms] =
    useState(searchParams.get("bathrooms") || "");

  const [parking, setParking] =
    useState(searchParams.get("parking") === "true");

  const [furnished, setFurnished] =
    useState(searchParams.get("furnished") === "true");

  const [offer, setOffer] =
    useState(searchParams.get("offer") === "true");

  const [sort, setSort] =
    useState(searchParams.get("sort") || "createdAt");

  const [order, setOrder] =
    useState(searchParams.get("order") || "desc");

  // ===================================================
  // DATA STATE
  // ===================================================

  const [listings, setListings] = useState([]);

  const [totalListings, setTotalListings] =
    useState(0);

  const [hasMore, setHasMore] =
    useState(false);

  const [startIndex, setStartIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [error, setError] =
    useState("");

  // ===================================================
  // UI STATE
  // ===================================================

  const [showFilters, setShowFilters] =
    useState(false);

  const [showMap, setShowMap] =
    useState(false);

  const [selectedListing, setSelectedListing] =
    useState(null);

  // ===================================================
  // IMAGE URL
  // ===================================================

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
      return FALLBACK_IMAGE;
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

    return FALLBACK_IMAGE;
  };

  // ===================================================
  // PRICE FORMAT
  // ===================================================

  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null ||
      Number.isNaN(Number(price))
    ) {
      return "R0";
    }

    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  // ===================================================
  // BUILD QUERY PARAMETERS
  // ===================================================

  const buildQueryParams = useCallback(
    (pageStartIndex = 0) => {
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.set(
          "searchTerm",
          searchTerm.trim()
        );
      }

      if (type && type !== "all") {
        params.set("type", type);
      }

      if (minPrice) {
        params.set("minPrice", minPrice);
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      }

      if (bedrooms) {
        params.set("bedrooms", bedrooms);
      }

      if (bathrooms) {
        params.set("bathrooms", bathrooms);
      }

      if (parking) {
        params.set("parking", "true");
      }

      if (furnished) {
        params.set("furnished", "true");
      }

      if (offer) {
        params.set("offer", "true");
      }

      params.set("sort", sort);
      params.set("order", order);

      params.set("limit", PAGE_SIZE);
      params.set("startIndex", pageStartIndex);

      return params;
    },
    [
      searchTerm,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      parking,
      furnished,
      offer,
      sort,
      order,
    ]
  );

  // ===================================================
  // FETCH LISTINGS
  // ===================================================

  const fetchListings = useCallback(
    async (append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError("");
        }

        const params = buildQueryParams(
          append ? startIndex : 0
        );

        const url =
          `/api/listing/get?${params.toString()}`;

        console.log(
          "SEARCH REQUEST:",
          url
        );

        const res = await fetch(url, {
          credentials: "include",
        });

        const data = await res.json();

        console.log(
          "SEARCH RESPONSE:",
          data
        );

        if (!res.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch listings."
          );
        }

        let newListings = [];
        let total = 0;
        let more = false;

        // New backend response
        if (
          data &&
          !Array.isArray(data) &&
          Array.isArray(data.listings)
        ) {
          newListings = data.listings;

          total = Number(
            data.totalListings || 0
          );

          more =
            Boolean(data.hasMore) ||
            newListings.length === PAGE_SIZE;
        }

        // Old backend response
        else if (Array.isArray(data)) {
          newListings = data;

          total = data.length;

          more =
            newListings.length === PAGE_SIZE;
        } else {
          throw new Error(
            "Server returned an invalid listings response."
          );
        }

        if (append) {
          setListings((previous) => [
            ...previous,
            ...newListings,
          ]);

          setStartIndex(
            (previous) =>
              previous + newListings.length
          );
        } else {
          setListings(newListings);

          setStartIndex(
            newListings.length
          );
        }

        setTotalListings(total);
        setHasMore(more);
      } catch (err) {
        console.error(
          "SEARCH FETCH ERROR:",
          err
        );

        setError(
          err?.message ||
            "Something went wrong while loading properties."
        );

        if (!append) {
          setListings([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      buildQueryParams,
      startIndex,
    ]
  );

  // ===================================================
  // UPDATE URL
  // ===================================================

  const updateUrl = () => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set(
        "searchTerm",
        searchTerm.trim()
      );
    }

    if (type !== "all") {
      params.set("type", type);
    }

    if (minPrice) {
      params.set("minPrice", minPrice);
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    }

    if (bedrooms) {
      params.set("bedrooms", bedrooms);
    }

    if (bathrooms) {
      params.set("bathrooms", bathrooms);
    }

    if (parking) {
      params.set("parking", "true");
    }

    if (furnished) {
      params.set("furnished", "true");
    }

    if (offer) {
      params.set("offer", "true");
    }

    params.set("sort", sort);
    params.set("order", order);

    setSearchParams(params);
  };

  // ===================================================
  // INITIAL / URL SEARCH
  // ===================================================

  useEffect(() => {
    setSearchTerm(
      searchParams.get("searchTerm") || ""
    );

    setType(
      searchParams.get("type") || "all"
    );

    setMinPrice(
      searchParams.get("minPrice") || ""
    );

    setMaxPrice(
      searchParams.get("maxPrice") || ""
    );

    setBedrooms(
      searchParams.get("bedrooms") || ""
    );

    setBathrooms(
      searchParams.get("bathrooms") || ""
    );

    setParking(
      searchParams.get("parking") === "true"
    );

    setFurnished(
      searchParams.get("furnished") === "true"
    );

    setOffer(
      searchParams.get("offer") === "true"
    );

    setSort(
      searchParams.get("sort") || "createdAt"
    );

    setOrder(
      searchParams.get("order") || "desc"
    );
  }, [searchParams]);

  // ===================================================
  // FETCH WHEN URL CHANGES
  // ===================================================

  useEffect(() => {
    fetchListings(false);
  }, [fetchListings]);

  // ===================================================
  // SEARCH SUBMIT
  // ===================================================

  const handleSearch = (e) => {
    e.preventDefault();

    updateUrl();
  };

  // ===================================================
  // RESET FILTERS
  // ===================================================

  const handleReset = () => {
    setSearchTerm("");
    setType("all");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setParking(false);
    setFurnished(false);
    setOffer(false);
    setSort("createdAt");
    setOrder("desc");

    setSearchParams({});
  };

  // ===================================================
  // LOAD MORE
  // ===================================================

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchListings(true);
    }
  };

  // ===================================================
  // ACTIVE FILTER COUNT
  // ===================================================

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (type !== "all") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (bedrooms) count++;
    if (bathrooms) count++;
    if (parking) count++;
    if (furnished) count++;
    if (offer) count++;

    return count;
  }, [
    type,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    offer,
  ]);

  // ===================================================
  // VALID MAP LISTINGS
  // ===================================================

  const mapListings = useMemo(() => {
    return listings.filter(
      (listing) =>
        Number.isFinite(
          Number(listing.latitude)
        ) &&
        Number.isFinite(
          Number(listing.longitude)
        ) &&
        Number(listing.latitude) !== 0 &&
        Number(listing.longitude) !== 0
    );
  }, [listings]);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

            <div className="min-w-0">

              <p className="text-green-700 font-semibold uppercase tracking-widest text-xs sm:text-sm">
                PrimePlaceEstate
              </p>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mt-2 leading-tight">
                Find your next property
              </h1>

              <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-2xl">
                Search houses, apartments and properties
                available for sale or rent.
              </p>

            </div>

            {/* MAP / LIST TOGGLE */}

            <div className="flex items-center bg-slate-100 rounded-xl p-1 w-full sm:w-fit">

              <button
                type="button"
                onClick={() =>
                  setShowMap(false)
                }
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  !showMap
                    ? "bg-white shadow-sm text-green-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List size={18} />
                List
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowMap(true)
                }
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  showMap
                    ? "bg-white shadow-sm text-green-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Map size={18} />
                Map
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          SEARCH / FILTER BAR
      ================================================= */}

      <section className="bg-white border-b border-slate-200 sticky top-0 z-30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">

          <form
            onSubmit={handleSearch}
            className="flex flex-col lg:flex-row gap-3"
          >

            {/* SEARCH */}

            <div className="flex items-center gap-3 flex-1 min-w-0 border border-slate-200 rounded-xl px-4 bg-white">

              <SearchIcon
                size={20}
                className="text-slate-400 shrink-0"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search by property name or location..."
                className="w-full min-w-0 py-3 outline-none text-slate-700 text-sm sm:text-base bg-transparent"
              />

            </div>

            {/* TYPE */}

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="w-full lg:w-auto border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-700 cursor-pointer bg-white text-sm sm:text-base"
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

            {/* ACTION BUTTONS */}

            <div className="grid grid-cols-2 lg:flex gap-3">

              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white rounded-xl px-5 lg:px-7 py-3 font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
              >
                <SearchIcon size={18} />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className="relative border border-slate-200 hover:bg-slate-50 rounded-xl px-4 lg:px-5 py-3 font-semibold text-slate-700 flex items-center justify-center gap-2 transition text-sm sm:text-base"
              >
                <SlidersHorizontal size={18} />

                <span>Filters</span>

                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

            </div>

          </form>

          {/* =================================================
              FILTER PANEL
          ================================================= */}

          {showFilters && (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Property Filters
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Narrow down your search.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="self-start sm:self-auto text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Reset all
                </button>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* MIN PRICE */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Minimum Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500000"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                {/* MAX PRICE */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Maximum Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2000000"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                {/* BEDROOMS */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bedrooms
                  </label>

                  <select
                    value={bedrooms}
                    onChange={(e) =>
                      setBedrooms(e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none bg-white"
                  >
                    <option value="">
                      Any
                    </option>

                    <option value="1">
                      1+
                    </option>

                    <option value="2">
                      2+
                    </option>

                    <option value="3">
                      3+
                    </option>

                    <option value="4">
                      4+
                    </option>

                    <option value="5">
                      5+
                    </option>
                  </select>
                </div>

                {/* BATHROOMS */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bathrooms
                  </label>

                  <select
                    value={bathrooms}
                    onChange={(e) =>
                      setBathrooms(e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none bg-white"
                  >
                    <option value="">
                      Any
                    </option>

                    <option value="1">
                      1+
                    </option>

                    <option value="2">
                      2+
                    </option>

                    <option value="3">
                      3+
                    </option>

                    <option value="4">
                      4+
                    </option>
                  </select>
                </div>

              </div>

              {/* CHECKBOX FILTERS */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">

                <button
                  type="button"
                  onClick={() =>
                    setParking(!parking)
                  }
                  className={`w-full px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition ${
                    parking
                      ? "bg-green-700 border-green-700 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Car size={17} />
                  Parking
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFurnished(!furnished)
                  }
                  className={`w-full px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition ${
                    furnished
                      ? "bg-green-700 border-green-700 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Sofa size={17} />
                  Furnished
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setOffer(!offer)
                  }
                  className={`w-full px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition ${
                    offer
                      ? "bg-green-700 border-green-700 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Tag size={17} />
                  Special Offers
                </button>

              </div>

              {/* APPLY FILTERS */}

              <div className="flex justify-stretch sm:justify-end mt-5">

                <button
                  type="button"
                  onClick={() => {
                    updateUrl();
                    setShowFilters(false);
                  }}
                  className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Apply Filters
                </button>

              </div>

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* RESULTS HEADER */}

        <div className="flex flex-col gap-4 mb-6">

          <div className="min-w-0">

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
              {searchTerm
                ? `Results for "${searchTerm}"`
                : "Available Properties"}
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              {totalListings}{" "}
              {totalListings === 1
                ? "property"
                : "properties"}{" "}
              found
            </p>

          </div>

          {/* SORT */}

          <div className="flex items-center gap-2 w-full sm:w-fit">

            <ArrowUpDown
              size={18}
              className="text-slate-400 shrink-0"
            />

            <select
              value={`${sort}-${order}`}
              onChange={(e) => {
                const [
                  newSort,
                  newOrder,
                ] = e.target.value.split("-");

                setSort(newSort);
                setOrder(newOrder);

                setTimeout(() => {
                  const params =
                    new URLSearchParams(
                      searchParams
                    );

                  params.set(
                    "sort",
                    newSort
                  );

                  params.set(
                    "order",
                    newOrder
                  );

                  setSearchParams(params);
                }, 0);
              }}
              className="w-full sm:w-auto border border-slate-200 bg-white rounded-xl px-4 py-3 outline-none text-sm font-medium text-slate-700"
            >
              <option value="createdAt-desc">
                Newest
              </option>

              <option value="createdAt-asc">
                Oldest
              </option>

              <option value="regularPrice-asc">
                Price: Low to High
              </option>

              <option value="regularPrice-desc">
                Price: High to Low
              </option>

              <option value="name-asc">
                Name: A-Z
              </option>

              <option value="name-desc">
                Name: Z-A
              </option>

            </select>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700">

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

              <div className="min-w-0">

                <p className="font-bold">
                  Unable to load properties
                </p>

                <p className="text-sm mt-1 break-words">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  fetchListings(false)
                }
                className="text-sm font-semibold underline self-start"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            MAP VIEW
        ================================================= */}

        {showMap ? (

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">

            <div className="h-[450px] sm:h-[550px] lg:h-[650px] relative">

              <MapContainer
                center={DEFAULT_MAP_CENTER}
                zoom={11}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
              >

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                  listings={mapListings}
                />

                {mapListings.map(
                  (listing) => {

                    const hasOffer =
                      listing.offer === true &&
                      Number(
                        listing.discountPrice
                      ) > 0;

                    const displayPrice =
                      hasOffer
                        ? listing.discountPrice
                        : listing.regularPrice;

                    return (
                      <Marker
                        key={listing._id}
                        position={[
                          Number(
                            listing.latitude
                          ),
                          Number(
                            listing.longitude
                          ),
                        ]}
                        eventHandlers={{
                          click: () =>
                            setSelectedListing(
                              listing
                            ),
                        }}
                      >

                        <Popup>

                          <div className="w-56 sm:w-64">

                            <img
                              src={getImageUrl(
                                listing
                                  .imageUrls?.[0]
                              )}
                              alt={
                                listing.name ||
                                "Property"
                              }
                              className="w-full h-28 sm:h-32 object-cover rounded-lg mb-3"
                            />

                            <div>

                              <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold capitalize mb-2">
                                {listing.type}
                              </span>

                              <h3 className="font-bold text-slate-900 text-base">
                                {listing.name}
                              </h3>

                              <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                                {listing.address}
                              </p>

                              <p className="text-green-700 font-bold mt-2">
                                {formatPrice(
                                  displayPrice
                                )}

                                {listing.type ===
                                  "rent" && (
                                  <span className="text-slate-500 font-normal text-xs">
                                    {" "}
                                    / month
                                  </span>
                                )}
                              </p>

                              <Link
                                to={`/listing/${listing._id}`}
                                className="block text-center bg-green-700 hover:bg-green-800 text-white rounded-lg py-2 mt-3 text-sm font-semibold"
                              >
                                View Property
                              </Link>

                            </div>

                          </div>

                        </Popup>

                      </Marker>
                    );
                  }
                )}

              </MapContainer>

              {/* NO COORDINATES */}

              {mapListings.length === 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">

                  <div className="bg-white shadow-xl rounded-2xl px-5 sm:px-6 py-5 text-center max-w-sm w-full">

                    <MapPin
                      className="mx-auto text-slate-400 mb-3"
                      size={32}
                    />

                    <h3 className="font-bold text-slate-900">
                      No map locations available
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      These properties don't have
                      valid latitude and longitude
                      coordinates yet.
                    </p>

                  </div>

                </div>
              )}

            </div>

          </div>

        ) : (

          /* =================================================
              LIST VIEW
          ================================================= */

          <>
            {loading ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
                  >

                    <div className="h-56 sm:h-64 bg-slate-200" />

                    <div className="p-4 sm:p-5 space-y-4">

                      <div className="h-5 bg-slate-200 rounded" />

                      <div className="h-4 bg-slate-200 rounded w-2/3" />

                      <div className="h-4 bg-slate-200 rounded w-1/2" />

                      <div className="h-7 bg-slate-200 rounded w-1/3" />

                    </div>

                  </div>
                ))}

              </div>

            ) : listings.length === 0 ? (

              /* =================================================
                  NO RESULTS
              ================================================= */

              <div className="bg-white rounded-2xl py-16 sm:py-20 px-5 text-center">

                <Home
                  size={50}
                  className="mx-auto text-slate-300 mb-5"
                />

                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                  No properties found
                </h3>

                <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm sm:text-base">
                  We couldn't find properties matching
                  your current search criteria.
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-6 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              /* =================================================
                  PROPERTY GRID
              ================================================= */

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

                {listings.map(
                  (listing) => {

                    const hasOffer =
                      listing.offer === true &&
                      Number(
                        listing.discountPrice
                      ) > 0;

                    const displayPrice =
                      hasOffer
                        ? listing.discountPrice
                        : listing.regularPrice;

                    return (
                      <Link
                        to={`/listing/${listing._id}`}
                        key={listing._id}
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
                      >

                        {/* IMAGE */}

                        <div className="relative h-56 sm:h-60 lg:h-64 overflow-hidden">

                          <img
                            src={getImageUrl(
                              listing
                                .imageUrls?.[0]
                            )}
                            alt={
                              listing.name ||
                              "Property"
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.currentTarget.src =
                                FALLBACK_IMAGE;
                            }}
                          />

                          {/* TYPE */}

                          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-green-700 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold capitalize">
                            {listing.type}
                          </div>

                          {/* OFFER */}

                          {hasOffer && (
                            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white text-green-700 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
                              Special Offer
                            </div>
                          )}

                          {/* IMAGE COUNT */}

                          {listing.imageUrls?.length >
                            1 && (
                            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/60 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs">
                              +
                              {listing.imageUrls.length -
                                1}{" "}
                              photos
                            </div>
                          )}

                        </div>

                        {/* DETAILS */}

                        <div className="p-4 sm:p-5">

                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                            {listing.name}
                          </h3>

                          <div className="flex items-center gap-2 text-slate-500 mt-2 min-w-0">

                            <MapPin
                              size={16}
                              className="text-green-700 shrink-0"
                            />

                            <span className="truncate text-sm sm:text-base">
                              {listing.address}
                            </span>

                          </div>

                          {/* PRICE */}

                          <div className="mt-4">

                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

                              <span className="text-xl sm:text-2xl font-bold text-green-700">
                                {formatPrice(
                                  displayPrice
                                )}
                              </span>

                              {hasOffer && (
                                <span className="text-xs sm:text-sm text-slate-400 line-through">
                                  {formatPrice(
                                    listing.regularPrice
                                  )}
                                </span>
                              )}

                            </div>

                            {listing.type ===
                              "rent" && (
                              <span className="text-sm text-slate-500">
                                / month
                              </span>
                            )}

                          </div>

                          {/* PROPERTY FEATURES */}

                          <div className="flex items-center gap-x-4 gap-y-2 mt-5 text-sm text-slate-600 flex-wrap">

                            <div className="flex items-center gap-2">
                              <BedDouble
                                size={17}
                                className="text-green-700"
                              />

                              {listing.bedrooms ??
                                0}{" "}
                              Beds
                            </div>

                            <div className="flex items-center gap-2">
                              <Bath
                                size={17}
                                className="text-green-700"
                              />

                              {listing.bathrooms ??
                                0}{" "}
                              Baths
                            </div>

                            <div className="flex items-center gap-2">
                              <Car
                                size={17}
                                className="text-green-700"
                              />

                              {listing.parking
                                ? "Parking"
                                : "No Parking"}
                            </div>

                          </div>

                          {/* LOCATION */}

                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">

                            <span className="text-sm text-slate-500 truncate">
                              {listing.furnished
                                ? "Furnished"
                                : "Unfurnished"}
                            </span>

                            <span className="text-green-700 font-semibold text-sm group-hover:translate-x-1 transition whitespace-nowrap">
                              View Property →
                            </span>

                          </div>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            )}

            {/* =================================================
                LOAD MORE
            ================================================= */}

            {!loading &&
              listings.length > 0 &&
              hasMore && (
                <div className="flex justify-center mt-8 sm:mt-10">

                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full sm:w-auto min-w-40 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white px-7 py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >

                    {loadingMore ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Loading...
                      </>
                    ) : (
                      "Load More Properties"
                    )}

                  </button>

                </div>
              )}

          </>
        )}

      </section>

      {/* =================================================
          SELECTED PROPERTY MOBILE PREVIEW
      ================================================= */}

      {selectedListing && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-5 sm:right-5 z-[1000] md:hidden">

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

            <div className="flex">

              <img
                src={getImageUrl(
                  selectedListing
                    .imageUrls?.[0]
                )}
                alt={
                  selectedListing.name
                }
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover shrink-0"
              />

              <div className="p-3 sm:p-4 flex-1 min-w-0">

                <div className="flex items-start justify-between gap-2">

                  <div className="min-w-0">

                    <h3 className="font-bold text-slate-900 truncate text-sm sm:text-base">
                      {selectedListing.name}
                    </h3>

                    <p className="text-green-700 font-bold mt-1 text-sm sm:text-base">
                      {formatPrice(
                        selectedListing.offer &&
                          selectedListing.discountPrice
                          ? selectedListing.discountPrice
                          : selectedListing.regularPrice
                      )}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedListing(null)
                    }
                    className="text-slate-400 hover:text-slate-700 shrink-0"
                  >
                    <X size={18} />
                  </button>

                </div>

                <Link
                  to={`/listing/${selectedListing._id}`}
                  className="inline-block mt-2 text-xs sm:text-sm font-semibold text-green-700"
                >
                  View Property →
                </Link>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}