
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

import OAuth from "../components/OAuth";

export default function SignIn() {
  const [activeTab, setActiveTab] = useState("user");

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
  });

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.user);

 // =====================================================
// HANDLE USER INPUT
// =====================================================

const handleUserChange = (e) => {
  setUserForm({
    ...userForm,
    [e.target.id]: e.target.value,
  });
};

// =====================================================
// HANDLE ADMIN INPUT
// =====================================================

const handleAdminChange = (e) => {
  const { id, value } = e.target;

  setAdminForm((prev) => ({
    ...prev,
    [id === "adminEmail" ? "email" : "password"]: value,
  }));
};
  // =====================================================
  // USER SIGN IN
  // =====================================================

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    if (!userForm.email || !userForm.password) {
      dispatch(
        signInFailure(
          "Please enter your email and password."
        )
      );
      return;
    }

    try {
      dispatch(signInStart());

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: userForm.email.trim(),
          password: userForm.password,
        }),
      });

      const text = await res.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error(
          "USER SIGNIN JSON ERROR:",
          parseError
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      console.log(
        "USER SIGNIN RESPONSE:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Wrong email or password."
        );
      }

      const userPayload =
        data.user ||
        data.rest ||
        data;

      if (!userPayload?._id) {
        console.error(
          "INVALID USER RESPONSE:",
          data
        );

        throw new Error(
          "Login succeeded but user information was missing."
        );
      }

      // -------------------------------------------------
      // SECURITY CHECK
      // -------------------------------------------------

      if (userPayload.role === "admin") {
        console.error(
          "ADMIN ACCOUNT RETURNED FROM USER LOGIN"
        );

        throw new Error(
          "Admin accounts must use the admin sign-in option."
        );
      }

      dispatch(
        signInSuccess(userPayload)
      );

      console.log(
        "USER LOGIN SUCCESS:",
        userPayload
      );

      navigate("/profile");
    } catch (error) {
      console.error(
        "USER SIGNIN ERROR:",
        error
      );

      dispatch(
        signInFailure(
          error.message ||
            "Something went wrong while signing in."
        )
      );
    }
  };

  // =====================================================
  // ADMIN SIGN IN
  // =====================================================

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (
      !adminForm.email ||
      !adminForm.password
    ) {
      dispatch(
        signInFailure(
          "Please enter your admin email and password."
        )
      );
      return;
    }

    try {
      dispatch(signInStart());

      console.log(
        "ADMIN LOGIN REQUEST:",
        adminForm.email
      );

      // =================================================
      // IMPORTANT:
      // ADMIN MUST USE /api/admin/signin
      // NOT /api/auth/signin
      // =================================================

      const res = await fetch(
        "/api/admin/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email:
              adminForm.email
                .trim()
                .toLowerCase(),
            password:
              adminForm.password,
          }),
        }
      );

      const text = await res.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error(
          "ADMIN SIGNIN JSON ERROR:",
          parseError
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      console.log(
        "ADMIN SIGNIN RESPONSE:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Wrong admin email or password."
        );
      }

      const userPayload =
        data.user ||
        data.rest ||
        data;

      console.log(
        "ADMIN USER PAYLOAD:",
        userPayload
      );

      if (!userPayload?._id) {
        console.error(
          "INVALID ADMIN RESPONSE:",
          data
        );

        throw new Error(
          "Login succeeded but admin information was missing."
        );
      }

      // =================================================
      // VERIFY ADMIN ROLE
      // =================================================

      if (
        userPayload.role !== "admin"
      ) {
        console.error(
          "NON-ADMIN ACCOUNT ATTEMPTED ADMIN LOGIN:",
          userPayload
        );

        throw new Error(
          "This account does not have administrator access."
        );
      }

      // =================================================
      // SAVE ADMIN TO REDUX
      // =================================================

      dispatch(
        signInSuccess(userPayload)
      );

      console.log(
        "ADMIN LOGIN SUCCESS:",
        userPayload
      );

      // =================================================
      // ADMIN DASHBOARD
      // =================================================

      navigate("/admin/dashboard");
    } catch (error) {
      console.error(
        "ADMIN SIGNIN ERROR:",
        error
      );

      dispatch(
        signInFailure(
          error.message ||
            "Something went wrong while signing in."
        )
      );
    }
  };

  // =====================================================
  // SWITCH TABS
  // =====================================================

  const switchTab = (tab) => {
    setActiveTab(tab);

    dispatch(
      signInFailure(null)
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* =================================================
            AUTH CARD
        ================================================= */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8">

          {/* =================================================
              TABS
          ================================================= */}

          <div className="flex gap-2 mb-7 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">

            <button
              type="button"
              onClick={() =>
                switchTab("user")
              }
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === "user"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              USER
            </button>

            <button
              type="button"
              onClick={() =>
                switchTab("admin")
              }
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === "admin"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              ADMIN
            </button>

          </div>

          {/* =================================================
              USER FORM
          ================================================= */}

          {activeTab === "user" && (
            <div>

              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  User Access
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Sign in to your PrimePlaceEstate account
                </p>
              </div>

              <form
                onSubmit={handleUserSubmit}
              >

                {/* EMAIL */}

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="user@gmail.com"
                    value={
                      userForm.email
                    }
                    onChange={
                      handleUserChange
                    }
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* PASSWORD */}

                <div className="mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={
                      userForm.password
                    }
                    onChange={
                      handleUserChange
                    }
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* FORGOT PASSWORD */}

                <div className="text-right mb-5">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* SIGN IN */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading
                    ? "Signing In..."
                    : "Sign In as User"}
                </button>

              </form>

              {/* SIGN UP */}

              <div className="text-center mt-5">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Don't have a user account?{" "}

                  <Link
                    to="/signup"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>

              {/* DIVIDER */}

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />

                <span className="text-xs text-gray-400">
                  OR
                </span>

                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              </div>

              {/* GOOGLE */}

              <OAuth />

            </div>
          )}

          {/* =================================================
              ADMIN FORM
          ================================================= */}

          {activeTab === "admin" && (
            <div>

              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Admin Access
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Sign in to manage PrimePlaceEstate
                </p>
              </div>

              <form
                onSubmit={handleAdminSubmit}
              >

                {/* EMAIL */}

                <div className="mb-4">
                  <label
                    htmlFor="adminEmail"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Admin Email
                  </label>

                  <input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@primeplace.com"
                    value={
                      adminForm.email
                    }
                    onChange={
                      handleAdminChange
                    }
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* PASSWORD */}

                <div className="mb-2">
                  <label
                    htmlFor="adminPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Admin Password
                  </label>

                  <input
                    id="adminPassword"
                    type="password"
                    placeholder="Admin password"
                    value={
                      adminForm.password
                    }
                    onChange={
                      handleAdminChange
                    }
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                {/* FORGOT PASSWORD */}

                <div className="text-right mb-5">
                  <Link
                    to="/admin/forgot-password"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* SIGN IN */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading
                    ? "Signing In..."
                    : "Sign In as Admin"}
                </button>

              </form>

              {/* ADMIN SIGN UP */}

              <div className="text-center mt-5">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Don't have an admin account?{" "}

                  <Link
                    to="/signup?role=admin"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>

            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="mt-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

        </div>

        {/* =================================================
            BACK TO HOME
        ================================================= */}

        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}

