import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUser,
  faSignOutAlt,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout, loadingAuth } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  if (loadingAuth) {
    return null;
  }

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchTerm.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm("");
        setIsMobileMenuOpen(false);
      }
    }
  };

  return (
    <header className="bg-neutral-100 py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center relative">
        <Link to="/">
          <img src={logo} alt="Vellora Logo" className="h-12 sm:h-14 lg:h-16" />
        </Link>

        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearch}
          className="hidden md:block border rounded-md px-3 py-2 w-1/3 max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-body"
        />

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
            aria-label="Toggle mobile menu"
          >
            <FontAwesomeIcon
              icon={isMobileMenuOpen ? faTimes : faBars}
              className="text-2xl"
            />
          </button>

          <Link to="/cart" className="md:hidden">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-gray-700 hover:text-gray-900 text-2xl font-body"
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-gray-900 font-headings text-lg"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-gray-900 font-headings text-lg flex items-center gap-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faUser} className="text-xl" />
                {user?.full_name || user?.username || "Profile"}
              </Link>

              <button
                onClick={logout}
                className="text-gray-700 hover:text-gray-900 font-headings text-lg flex items-center gap-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-gray-700 hover:text-gray-900 font-headings text-lg flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faUser} className="text-xl" />
              Login
            </Link>
          )}

          <Link to="/cart">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-gray-700 hover:text-gray-900 text-2xl font-body"
            />
          </Link>
        </nav>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-neutral-100 border-t border-gray-200 shadow-lg py-4 z-50">
            <nav className="flex flex-col items-center space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 font-headings text-lg w-full text-center py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-gray-900 font-headings text-lg flex items-center gap-2 w-full justify-center py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUser} className="text-xl" />
                    {user?.full_name || user?.username || "Profile"}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-gray-900 font-headings text-lg flex items-center gap-2 w-full justify-center py-2"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-headings text-lg flex items-center gap-2 w-full justify-center py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="text-xl" />
                  Login
                </Link>
              )}
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
                className="border rounded-md px-3 py-2 w-11/12 focus:outline-none focus:ring-2 focus:ring-blue-500 font-body"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-11/12 font-body"
              >
                Search
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
