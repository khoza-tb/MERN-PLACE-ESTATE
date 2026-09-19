
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

export default function AdminSignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { loading, error } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.id]: e.target.value,
    }));
  };

  // ========================================
  // ADMIN SIGN IN
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(signInStart());

      const response = await fetch(
        "/api/auth/admin/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log("=================================");
      console.log("ADMIN SIGNIN RESPONSE:");
      console.log(data);
      console.log("=================================");

      if (!response.ok || data.success === false) {
        dispatch(
          signInFailure(
            data.message || "Admin sign in failed."
          )
        );

        return;
      }

      // ========================================
      // GET USER DATA
      // ========================================

      const userData = data.user || data;

      console.log("ADMIN USER:", userData);

      const userRole = userData.role;

      console.log("ADMIN ROLE:", userRole);

      // ========================================
      // VERIFY ADMIN ROLE
      // ========================================

      if (userRole !== "admin") {
        dispatch(
          signInFailure(
            `This account does not have administrator access. Role received: ${
              userRole || "undefined"
            }`
          )
        );

        return;
      }

      // ========================================
      // SAVE ADMIN USER TO REDUX
      // ========================================

      dispatch(
        signInSuccess({
          ...userData,
          role: userRole,
        })
      );

      // ========================================
      // REDIRECT TO ADMIN DASHBOARD
      // ========================================

      navigate("/admin/dashboard");
    } catch (error) {
      console.error(
        "ADMIN SIGNIN FRONTEND ERROR:",
        error
      );

      dispatch(
        signInFailure(
          error.message ||
            "Something went wrong during admin sign in."
        )
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">

          {/* ========================================
              ADMIN ICON
          ======================================== */}

          <div className="text-center mb-8">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-white">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v2h8z"
                />
              </svg>

            </div>

            <h1 className="text-3xl font-semibold text-slate-800">
              Admin Sign In
            </h1>

            <p className="text-slate-500 mt-2">
              Sign in to the PrimePlaceEstate
              administration panel.
            </p>

          </div>

          {/* ========================================
              FORM
          ======================================== */}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Admin Email
              </label>

              <input
                type="email"
                id="email"
                placeholder="admin@primeplaceestate.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                type="password"
                id="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
              />

              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

            </div>

            {/* ERROR MESSAGE */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* SIGN IN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 text-white rounded-lg p-3 uppercase font-semibold hover:bg-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Signing In..."
                : "Admin Sign In"}
            </button>

          </form>

          {/* ========================================
              USER SIGN IN
          ======================================== */}

          <div className="mt-7 text-center text-sm">

            <span className="text-slate-500">
              Are you a customer?{" "}
            </span>

            <Link
              to="/signin"
              className="text-blue-600 font-semibold hover:underline"
            >
              User Sign In
            </Link>

          </div>

          {/* ========================================
              BACK TO HOME
          ======================================== */}

          <div className="mt-3 text-center">

            <Link
              to="/"
              className="text-slate-500 text-sm hover:text-slate-800 hover:underline"
            >
              Back to PrimePlaceEstate
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}

