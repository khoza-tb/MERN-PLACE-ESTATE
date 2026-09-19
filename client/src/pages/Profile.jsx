
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

export default function Profile() {
  const { currentUser, loading, error } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [userListings, setUserListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingError, setListingError] = useState("");

  const [deleteAccountLoading, setDeleteAccountLoading] =
    useState(false);

  const [deleteListingId, setDeleteListingId] = useState(null);

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  /*
  =========================================================
  LOAD USER DATA
  =========================================================
  */

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setFormData({
      username: currentUser.username || "",
      email: currentUser.email || "",
      password: "",
    });

    setAvatarPreview(currentUser.avatar || defaultAvatar);
  }, [currentUser]);

  /*
  =========================================================
  LOAD USER LISTINGS
  =========================================================
  */

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    fetchUserListings();
  }, [currentUser?._id]);

  /*
  =========================================================
  FETCH MY LISTINGS
  =========================================================
  */

  const fetchUserListings = async () => {
    try {
      setLoadingListings(true);
      setListingError("");

      const res = await fetch("/api/listing/my-listings", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      console.log("MY LISTINGS RESPONSE:", data);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to load your listings."
        );
      }

      const listings = Array.isArray(data.listings)
        ? data.listings
        : [];

      setUserListings(listings);
    } catch (error) {
      console.error("FETCH MY LISTINGS ERROR:", error);

      setListingError(
        error.message || "Could not load your listings."
      );
    } finally {
      setLoadingListings(false);
    }
  };

  /*
  =========================================================
  HANDLE FORM INPUT
  =========================================================
  */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));

    setUpdateSuccess(false);
  };

  /*
  =========================================================
  HANDLE AVATAR
  =========================================================
  */

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarFile(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setUpdateSuccess(false);
  };

  /*
  =========================================================
  UPDATE PROFILE
  =========================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?._id) {
      return;
    }

    try {
      dispatch(updateUserStart());
      setUpdateSuccess(false);

      const updateData = {
        username: formData.username,
        email: formData.email,
      };

      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const res = await fetch(
        `/api/user/update/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );

      const data = await res.json();

      console.log("UPDATE PROFILE RESPONSE:", data);

      if (!res.ok || data.success === false) {
        dispatch(
          updateUserFailure(
            data.message || "Failed to update profile."
          )
        );

        return;
      }

      const updatedUser =
        data.user ||
        data.rest ||
        data;

      dispatch(updateUserSuccess(updatedUser));

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));

      setUpdateSuccess(true);
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);

      dispatch(
        updateUserFailure(
          error.message ||
            "Something went wrong while updating your profile."
        )
      );
    }
  };

  /*
  =========================================================
  DELETE ACCOUNT
  =========================================================
  */

  const handleDeleteAccount = async () => {
    if (!currentUser?._id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteAccountLoading(true);

      dispatch(deleteUserStart());

      const res = await fetch(
        `/api/user/delete/${currentUser._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      console.log("DELETE ACCOUNT RESPONSE:", data);

      if (!res.ok || data.success === false) {
        dispatch(
          deleteUserFailure(
            data.message || "Failed to delete account."
          )
        );

        return;
      }

      dispatch(deleteUserSuccess());

      navigate("/signup");
    } catch (error) {
      console.error("DELETE ACCOUNT ERROR:", error);

      dispatch(
        deleteUserFailure(
          error.message ||
            "Something went wrong while deleting your account."
        )
      );
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  /*
  =========================================================
  SIGN OUT
  =========================================================
  */

  
const handleSignOut = async () => {
  try {
    const res = await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to sign out");
    }

    console.log("SIGNED OUT SUCCESSFULLY");

    // Clear local user state if you are storing it in localStorage
    localStorage.removeItem("user");

    // Redirect to sign-in page
    navigate("/signin");
  } catch (error) {
    console.error("SIGN OUT ERROR:", error);
  }
};



  /*
  =========================================================
  DELETE LISTING
  =========================================================
  */

  const handleDeleteListing = async (listingId) => {
    if (!listingId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this property listing?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteListingId(listingId);

      const res = await fetch(
        `/api/listing/delete/${listingId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      console.log("DELETE LISTING RESPONSE:", data);

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to delete listing."
        );
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.error("DELETE LISTING ERROR:", error);

      alert(
        error.message ||
          "Something went wrong while deleting the listing."
      );
    } finally {
      setDeleteListingId(null);
    }
  };

  /*
  =========================================================
  FORMAT PRICE
  =========================================================
  */

  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return "Price unavailable";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price unavailable";
    }

    return `R ${numericPrice.toLocaleString("en-ZA")}`;
  };

  /*
  =========================================================
  GET LISTING IMAGE
  =========================================================
  */

  const getListingImage = (listing) => {
    if (
      Array.isArray(listing?.imageUrls) &&
      listing.imageUrls.length > 0
    ) {
      return listing.imageUrls[0];
    }

    if (
      Array.isArray(listing?.images) &&
      listing.images.length > 0
    ) {
      return listing.images[0];
    }

    if (listing?.image) {
      return listing.image;
    }

    return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80";
  };

  /*
  =========================================================
  NOT LOGGED IN
  =========================================================
  */

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  /*
  =========================================================
  PROFILE PAGE
  =========================================================
  */

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =================================================
          HERO / PROFILE HEADER
      ================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={avatarPreview || defaultAvatar}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-slate-100 shadow-sm"
                />

                <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Welcome back
                </p>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {currentUser.username || "User"}
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/create-listing"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-semibold transition shadow-sm"
              >
                <span className="text-lg">+</span>
                Create Listing
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =================================================
              PROFILE SETTINGS
          ================================================= */}

          <section className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                  Account Settings
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Keep your profile information up to date.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-5"
              >
                {/* AVATAR */}

                <div className="flex flex-col items-center pb-2">
                  <div className="relative">
                    <img
                      src={avatarPreview || defaultAvatar}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-sm"
                    />
                  </div>

                  <label className="mt-4 inline-flex items-center justify-center cursor-pointer px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                    Change Profile Picture

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>

                  {avatarFile && (
                    <p className="text-xs text-slate-500 mt-2 max-w-full truncate">
                      {avatarFile.name}
                    </p>
                  )}
                </div>

                {/* USERNAME */}

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Username
                  </label>

                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Your username"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                    required
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Email Address
                  </label>

                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email address"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                    required
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    New Password
                  </label>

                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                    autoComplete="new-password"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                  />

                  <p className="text-xs text-slate-400 mt-2">
                    Only enter a password if you want to change it.
                  </p>
                </div>

                {/* SUCCESS */}

                {updateSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Your profile has been updated successfully.
                  </div>
                )}

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* UPDATE */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>
              </form>

              {/* DANGER ZONE */}

              <div className="border-t border-slate-200 bg-slate-50 p-6">
                <h3 className="text-sm font-bold text-slate-900">
                  Danger Zone
                </h3>

                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Deleting your account permanently removes your account.
                </p>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountLoading}
                  className="w-full border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {deleteAccountLoading
                    ? "Deleting Account..."
                    : "Delete Account"}
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              LISTINGS
          ================================================= */}

          <section className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* LISTINGS HEADER */}

              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">
                        Your Listings
                      </h2>

                      <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        {userListings.length}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      Manage the properties you've added to PrimePlaceEstate.
                    </p>
                  </div>

                  <Link
                    to="/create-listing"
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                  >
                    <span className="text-base">+</span>
                    Add Property
                  </Link>
                </div>
              </div>

              {/* LISTING ERROR */}

              {listingError && (
                <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {listingError}
                </div>
              )}

              {/* LOADING */}

              {loadingListings && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />

                  <p className="font-medium text-slate-700">
                    Loading your properties
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    Please wait a moment...
                  </p>
                </div>
              )}

              {/* EMPTY STATE */}

              {!loadingListings &&
                userListings.length === 0 &&
                !listingError && (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl mb-5">
                      🏠
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      No properties listed yet
                    </h3>

                    <p className="max-w-md mx-auto text-sm text-slate-500 mt-2 leading-6">
                      You haven't added any properties to PrimePlaceEstate.
                      Create your first listing and start showcasing your
                      property.
                    </p>

                    <Link
                      to="/create-listing"
                      className="inline-flex items-center gap-2 mt-6 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition shadow-sm"
                    >
                      <span className="text-lg">+</span>
                      Create Your First Listing
                    </Link>
                  </div>
                )}

              {/* LISTINGS */}

              {!loadingListings &&
                userListings.length > 0 && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {userListings.map((listing) => {
                        const image =
                          getListingImage(listing);

                        const regularPrice =
                          Number(
                            listing.regularPrice || 0
                          );

                        const discountPrice =
                          Number(
                            listing.discountPrice || 0
                          );

                        const hasOffer =
                          Boolean(listing.offer) &&
                          discountPrice > 0 &&
                          discountPrice <
                            regularPrice;

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
                            className="group border border-slate-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                          >
                            {/* IMAGE */}

                            <div className="relative h-56 overflow-hidden">
                              <Link
                                to={`/listing/${listing._id}`}
                              >
                                <img
                                  src={image}
                                  alt={
                                    listing.name ||
                                    "Property"
                                  }
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </Link>

                              {/* TYPE */}

                              <div className="absolute top-3 left-3">
                                <span className="inline-flex px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-xs font-bold text-slate-800 capitalize shadow-sm">
                                  {listing.type ||
                                    "Property"}
                                </span>
                              </div>

                              {/* OFFER */}

                              {hasOffer && (
                                <div className="absolute top-3 right-3">
                                  <span className="inline-flex px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-sm">
                                    OFFER
                                  </span>
                                </div>
                              )}

                              {/* VIEW */}

                              <Link
                                to={`/listing/${listing._id}`}
                                className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition"
                              >
                                View Property
                              </Link>
                            </div>

                            {/* CONTENT */}

                            <div className="p-5">
                              <Link
                                to={`/listing/${listing._id}`}
                              >
                                <h3 className="text-lg font-bold text-slate-900 truncate hover:text-slate-600 transition">
                                  {listing.name ||
                                    "Unnamed Property"}
                                </h3>
                              </Link>

                              {listing.address && (
                                <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-10">
                                  {listing.address}
                                </p>
                              )}

                              {/* PRICE */}

                              <div className="mt-4">
                                {hasOffer ? (
                                  <div>
                                    <span className="text-xs text-slate-400 line-through mr-2">
                                      {formatPrice(
                                        regularPrice
                                      )}
                                    </span>

                                    <span className="text-xl font-bold text-slate-900">
                                      {formatPrice(
                                        discountPrice
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xl font-bold text-slate-900">
                                    {formatPrice(
                                      regularPrice
                                    )}
                                  </span>
                                )}

                                {listing.type ===
                                  "rent" && (
                                  <span className="text-xs text-slate-500 ml-1">
                                    / month
                                  </span>
                                )}
                              </div>

                              {/* PROPERTY FEATURES */}

                              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                                <span>
                                  🛏️ {bedrooms}{" "}
                                  Beds
                                </span>

                                <span>
                                  🛁 {bathrooms}{" "}
                                  Baths
                                </span>

                                {listing.parking && (
                                  <span>
                                    🚗 Parking
                                  </span>
                                )}
                              </div>

                              {/* ACTIONS */}

                              <div className="grid grid-cols-2 gap-3 mt-5">
                                <Link
                                  to={`/update-listing/${listing._id}`}
                                  className="inline-flex items-center justify-center border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl py-2.5 text-sm font-semibold transition"
                                >
                                  Edit Property
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteListing(
                                      listing._id
                                    )
                                  }
                                  disabled={
                                    deleteListingId ===
                                    listing._id
                                  }
                                  className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60"
                                >
                                  {deleteListingId ===
                                  listing._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

