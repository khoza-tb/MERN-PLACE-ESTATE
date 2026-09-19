
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function MyListings() {
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // GET MY LISTINGS
  // ==========================================
  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        setLoading(true);
        setError("");

        if (!currentUser?._id) {
          setError("Please sign in to view your listings.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "/api/listing/my-listings",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        console.log("MY LISTINGS RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load your listings."
          );
        }

        setListings(
          Array.isArray(data.listings)
            ? data.listings
            : []
        );
      } catch (err) {
        console.error("MY LISTINGS ERROR:", err);

        setError(
          err.message ||
            "Something went wrong while loading your listings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [currentUser]);

  // ==========================================
  // DELETE LISTING
  // ==========================================
  const handleDelete = async (listingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/listing/delete/${listingId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete listing."
        );
      }

      setListings((previousListings) =>
        previousListings.filter(
          (listing) => listing._id !== listingId
        )
      );
    } catch (err) {
      console.error("DELETE LISTING ERROR:", err);

      setError(
        err.message ||
          "Something went wrong while deleting the listing."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-slate-500 text-lg">
            Loading your listings...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <main className="max-w-6xl mx-auto p-3">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold">
            My Listings
          </h1>

          <p className="text-slate-500 mt-1">
            Manage the properties you have created.
          </p>
        </div>

        <Link
          to="/create-listing"
          className="bg-slate-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-slate-800 transition"
        >
          + Create Listing
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {!error && listings.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-slate-800">
            No Listings Yet
          </h2>

          <p className="text-slate-500 mt-2 mb-6">
            You haven't created any properties yet.
          </p>

          <Link
            to="/create-listing"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition"
          >
            Create Your First Listing
          </Link>
        </div>
      )}

      {/* LISTINGS */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const image =
              listing.imageUrls?.[0] ||
              "https://via.placeholder.com/600x400?text=No+Image";

            const regularPrice = Number(
              listing.regularPrice || 0
            );

            const discountPrice = Number(
              listing.discountPrice || 0
            );

            const hasDiscount =
              listing.offer &&
              discountPrice > 0 &&
              discountPrice < regularPrice;

            const displayPrice = hasDiscount
              ? discountPrice
              : regularPrice;

            const bedrooms =
              listing.bedrooms ??
              listing.bedRooms ??
              0;

            const bathrooms =
              listing.bathrooms ??
              listing.bathRooms ??
              0;

            return (
              <div
                key={listing._id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200"
              >
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={image}
                    alt={listing.name || "Property"}
                    className="w-full h-56 object-cover"
                  />

                  <span className="absolute top-3 left-3 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                    {listing.type || "property"}
                  </span>

                  {listing.offer && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      OFFER
                    </span>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-slate-900 truncate">
                    {listing.name || "Untitled Property"}
                  </h2>

                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {listing.address || "No address provided"}
                  </p>

                  {/* PRICE */}
                  <div className="mt-4">
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through mr-2">
                        R{regularPrice.toLocaleString()}
                      </span>
                    )}

                    <span className="text-xl font-bold text-slate-900">
                      R{displayPrice.toLocaleString()}
                    </span>

                    {listing.type === "rent" && (
                      <span className="text-sm text-slate-500 ml-1">
                        /month
                      </span>
                    )}
                  </div>

                  {/* PROPERTY FEATURES */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-4">
                    <span>
                      🛏️ {bedrooms} Beds
                    </span>

                    <span>
                      🛁 {bathrooms} Baths
                    </span>

                    <span>
                      🚗{" "}
                      {listing.parking
                        ? "Parking"
                        : "No Parking"}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-3 gap-2 mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/listing/${listing._id}`
                        )
                      }
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-lg font-medium transition"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/update-listing/${listing._id}`
                        )
                      }
                      className="bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-medium transition"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(listing._id)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

