import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">

        {/* TOP BAR */}
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link
            to="/"
            onClick={closeMenu}
            className="text-xl sm:text-2xl font-bold text-green-700 whitespace-nowrap"
          >
            PrimePlaceEstate
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6">

            <Link
              to="/"
              className="text-slate-700 hover:text-green-700 transition-colors duration-200"
            >
              Home
            </Link>

            <Link
              to="/search"
              className="text-slate-700 hover:text-green-700 transition-colors duration-200"
            >
              Explore
            </Link>

            <Link
              to="/about"
              className="text-slate-700 hover:text-green-700 transition-colors duration-200"
            >
              About
            </Link>

            {/* PROFILE */}
            {currentUser ? (
              <Link to="/profile">
                <img
                  src={
                    currentUser.photo ||
                    currentUser.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-green-600 hover:opacity-80 transition"
                />
              </Link>
            ) : (
              <Link
                to="/signin"
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              /* CLOSE ICON */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              /* HAMBURGER ICON */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-slate-100">

            <div className="flex flex-col gap-2">

              <Link
                to="/"
                onClick={closeMenu}
                className="px-3 py-3 rounded-lg text-slate-700 hover:bg-green-50 hover:text-green-700 transition"
              >
                Home
              </Link>

              <Link
                to="/search"
                onClick={closeMenu}
                className="px-3 py-3 rounded-lg text-slate-700 hover:bg-green-50 hover:text-green-700 transition"
              >
                Explore
              </Link>

              <Link
                to="/about"
                onClick={closeMenu}
                className="px-3 py-3 rounded-lg text-slate-700 hover:bg-green-50 hover:text-green-700 transition"
              >
                About
              </Link>

              {/* MOBILE PROFILE */}
              {currentUser ? (
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-green-50 transition"
                >
                  <img
                    src={
                      currentUser.photo ||
                      currentUser.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-green-600"
                  />

                  <span className="text-slate-700 font-medium">
                    Profile
                  </span>
                </Link>
              ) : (
                <Link
                  to="/signin"
                  onClick={closeMenu}
                  className="mt-2 text-center bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg transition-colors duration-200"
                >
                  Sign In
                </Link>
              )}

            </div>
          </nav>
        )}
      </div>
    </header>
  );
}