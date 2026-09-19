
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

export default function SignUp() {
  const [activeTab, setActiveTab] = useState("user");

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [adminForm, setAdminForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // USER INPUT
  // =====================================================

  const handleUserChange = (e) => {
    const { id, value } = e.target;

    setUserForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // =====================================================
  // ADMIN INPUT
  // =====================================================

  const handleAdminChange = (e) => {
    const { id, value } = e.target;

    setAdminForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // =====================================================
  // USER SIGN UP
  // =====================================================

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    if (
      !userForm.username ||
      !userForm.email ||
      !userForm.password
    ) {
      setError(
        "Please enter your username, email and password."
      );
      return;
    }

    if (userForm.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
          }),
        }
      );

      const text = await res.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error(
          "USER SIGNUP JSON ERROR:",
          parseError
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      console.log(
        "USER SIGNUP RESPONSE:",
        data
      );

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to create user account."
        );
      }

      console.log(
        "✅ USER ACCOUNT CREATED"
      );

      setError(null);

      navigate("/signin");
    } catch (error) {
      console.error(
        "USER SIGNUP ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ADMIN SIGN UP
  // =====================================================

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    if (
      !adminForm.username ||
      !adminForm.email ||
      !adminForm.password
    ) {
      setError(
        "Please enter the admin username, email and password."
      );
      return;
    }

    if (adminForm.password.length < 6) {
      setError(
        "Admin password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/admin-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: adminForm.username,
            email: adminForm.email,
            password: adminForm.password,
          }),
        }
      );

      const text = await res.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error(
          "ADMIN SIGNUP JSON ERROR:",
          parseError
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      console.log(
        "ADMIN SIGNUP RESPONSE:",
        data
      );

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Unable to create admin account."
        );
      }

      console.log(
        "✅ ADMIN ACCOUNT CREATED"
      );

      setError(null);

      // Go to signin after successful admin registration
      navigate("/signin");
    } catch (error) {
      console.error(
        "ADMIN SIGNUP ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while creating the admin account."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SWITCH TAB
  // =====================================================

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8">

          {/* =================================================
              TABS
          ================================================= */}

          <div className="flex gap-2 mb-7 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">

            <button
              type="button"
              onClick={() => switchTab("user")}
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
              onClick={() => switchTab("admin")}
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
              USER SIGN UP
          ================================================= */}

          {activeTab === "user" && (
            <div>

              <div className="text-center mb-6">

                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Create Account
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Create your PrimePlaceEstate account
                </p>

              </div>

              <form
                onSubmit={handleUserSubmit}
                className="flex flex-col"
              >

                {/* USERNAME */}

                <div className="mb-4">

                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={userForm.username}
                    onChange={handleUserChange}
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />

                </div>

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
                    value={userForm.email}
                    onChange={handleUserChange}
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />

                </div>

                {/* PASSWORD */}

                <div className="mb-5">

                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={userForm.password}
                    onChange={handleUserChange}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create User Account"}
                </button>

              </form>

              {/* USER SIGN IN */}

              <div className="text-center mt-5">

                <p className="text-gray-600 dark:text-gray-400 text-sm">

                  Already have a user account?{" "}

                  <Link
                    to="/signin"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sign In
                  </Link>

                </p>

              </div>

              {/* GOOGLE */}

              <div className="flex items-center gap-3 my-6">

                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />

                <span className="text-xs text-gray-400">
                  OR
                </span>

                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />

              </div>

              <OAuth />

            </div>
          )}

          {/* =================================================
              ADMIN SIGN UP
          ================================================= */}

          {activeTab === "admin" && (
            <div>

              <div className="text-center mb-6">

                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Create Admin Account
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Create an administrator account for PrimePlaceEstate
                </p>

              </div>

              <form
                onSubmit={handleAdminSubmit}
                className="flex flex-col"
              >

                {/* ADMIN USERNAME */}

                <div className="mb-4">

                  <label
                    htmlFor="adminUsername"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Admin Username
                  </label>

                  <input
                    id="adminUsername"
                    type="text"
                    placeholder="admin"
                    value={adminForm.username}
                    onChange={(e) =>
                      setAdminForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />

                </div>

                {/* ADMIN EMAIL */}

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
                    placeholder="admin@primeplaceestate.com"
                    value={adminForm.email}
                    onChange={(e) =>
                      setAdminForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />

                </div>

                {/* ADMIN PASSWORD */}

                <div className="mb-5">

                  <label
                    htmlFor="adminPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Admin Password
                  </label>

                  <input
                    id="adminPassword"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading
                    ? "Creating Admin..."
                    : "Create Admin Account"}
                </button>

              </form>

              {/* ADMIN SIGN IN */}

              <div className="text-center mt-5">

                <p className="text-gray-600 dark:text-gray-400 text-sm">

                  Already have an admin account?{" "}

                  <Link
                    to="/signin"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Sign In
                  </Link>

                </p>

              </div>

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

        </div>

        {/* BACK HOME */}

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

