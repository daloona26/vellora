import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // --- FIX: Change the API endpoint to your custom LoginView ---
      const response = await fetch("http://127.0.0.1:8000/api/users/login/", { 
      // ---------------------------------------------------------------
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // This payload is correct for your UserLoginSerializer
        body: JSON.stringify({ username_or_email: usernameOrEmail, password }), 
      });

      const data = await response.json();

      if (response.ok) {
        // Your custom LoginView returns 'access' and 'refresh'
        await login(data.access, data.refresh); 
        console.log("Login successful!", data);
        navigate("/");
      } else {
        console.error("Login failed:", data);
        if (response.status === 401 || response.status === 400) {
          // Error handling from your custom LoginView/Serializer
          if (data.detail) {
            setError(data.detail);
          } else if (data.non_field_errors) {
            setError(data.non_field_errors[0]);
          } else {
            setError("Invalid username/email or password. Please try again.");
          }
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
      }
    } catch (err) {
      console.error("Network error or unexpected issue:", err);
      setError("Could not connect to the server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 font-headings">
            Welcome Back!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-body">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username-or-email" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="usernamel"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm font-body"
                placeholder="Username(e.g.noao93)"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm font-body"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-red-600 font-body">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 font-body"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
        <div className="text-center text-sm font-body">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-amber-600 hover:text-amber-500"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
