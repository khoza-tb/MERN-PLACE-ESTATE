import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // States for user listings and update success message
  const [userListings, setUserListings] = useState([]);
  const [showListingsError, setShowListingsError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        password: "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?._id) {
      dispatch(updateUserFailure("User ID is missing"));
      return;
    }

    try {
      dispatch(updateUserStart());
      setUpdateSuccess(false); // Reset success state on new submit

      const res = await fetch(
        `/api/users/update/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();

      if (!res.ok || result.success === false) {
        dispatch(
          updateUserFailure(
            result.message || "Failed to update user"
          )
        );
        return;
      }

      dispatch(updateUserSuccess(result.user || result));
      setUpdateSuccess(true); // Show success message

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(
        `/api/users/delete/${currentUser._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess());
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());

      const res = await fetch("/api/auth/signout");

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(
          signOutUserFailure(
            data.message || "Failed to sign out"
          )
        );
        return;
      }

      dispatch(signOutUserSuccess());
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  // =========================
  // SHOW USER LISTINGS
  // =========================
  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/users/listings/${currentUser._id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  // =========================
  // DELETE A LISTING
  // =========================
  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Profile
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <img
          src={currentUser?.avatar || "/default-avatar.png"}
          alt="Profile"
          className="rounded-full h-24 w-24 object-cover self-center mt-2"
        />

        <input
          type="text"
          placeholder="Username"
          id="username"
          value={formData.username}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <input
          type="email"
          placeholder="Email"
          id="email"
          value={formData.email}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder="Password"
          id="password"
          value={formData.password}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </form>

      <Link
        className="bg-green-700 text-white rounded-lg p-3 uppercase text-center hover:opacity-95 block mt-4"
        to={"/create-listing"}
      >
        Create Listing
      </Link>

      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer rounded"
        >
          Delete Account
        </span>

        <span
          onClick={handleSignOut}
          className="text-red-700 cursor-pointer rounded"
        >
          Sign Out
        </span>
      </div>

      {/* Error and Success Messages */}
      {error && <p className="text-red-700 mt-5 text-center">{error}</p>}
      
      {updateSuccess && (
        <p className="text-red-700 mt-5 text-center">
          User is updated successfully!
        </p>
      )}

      {/* Show Listings Button */}
      <button
        onClick={handleShowListings}
        className="text-green-700 w-full mt-5 font-semibold text-center"
      >
        Show Listings
      </button>

      {showListingsError && (
        <p className="text-red-700 mt-2 text-center">
          Error showing listings
        </p>
      )}

      {/* Render Listings */}
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4 mt-6">
          <h1 className="text-center text-2xl font-semibold">Your Listings</h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls?.[0] || "/default-house.jpg"}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase font-semibold text-sm hover:opacity-75"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase font-semibold text-sm hover:opacity-75">
                    Edit
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}