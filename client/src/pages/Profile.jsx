import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
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
      console.error("User ID is missing:", currentUser);
      dispatch(updateUserFailure("User ID is missing"));
      return;
    }

    try {
      dispatch(updateUserStart());

      const res = await fetch(
        `/api/users/update/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

      console.log("User updated successfully:", result);

      dispatch(updateUserSuccess(result));

      // Clear password field after successful update
      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (error) {
      console.error("Update error:", error.message);

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


  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Profile
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {/* Profile image - display only */}
        <img
          src={currentUser?.avatar || "/default-avatar.png"}
          alt="Profile"
          className="rounded-full h-24 w-24 object-cover self-center mt-2"
        />

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          id="username"
          value={formData.username}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          id="email"
          value={formData.email}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={formData.password}
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        {/* Update button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer rounded"
        >
          Delete Account
        </span>

        <span onClick={handleSignOut} className="text-red-700 cursor-pointer rounded">
          Sign Out
        </span>
      </div>

      {error && (
        <p className="text-red-700 mt-5 text-center">
          {error}
        </p>
      )}
    </div>
  );
}