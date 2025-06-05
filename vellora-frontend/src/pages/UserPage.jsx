import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserPage = () => {
  const { user, isAuthenticated, loadingAuth, updateUserInfo } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    address: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      navigate("/login");
    }
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        full_name: user.full_name || "",
        address: user.address || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user, isAuthenticated, loadingAuth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Profile updated successfully!");
        updateUserInfo(data);
        console.log("Profile update successful:", data);
      } else {
        console.error("Profile update failed:", data);
        if (data.detail) {
          setError(data.detail);
        } else {
          const fieldErrors = Object.keys(data)
            .map((key) => `${key}: ${data[key].join(", ")}`)
            .join("; ");
          setError(`Update failed: ${fieldErrors}`);
        }
      }
    } catch (err) {
      console.error("Network error or unexpected issue:", err);
      setError("Could not connect to the server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-stone-50">
        <p className="text-gray-600 font-body text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-stone-50 min-h-[calc(100vh-120px)] flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-10 rounded-xl shadow-2xl border border-gray-200 space-y-6">
        <h2 className="font-headings text-4xl font-extrabold text-gray-900 text-center">
          My Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 font-body"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed sm:text-sm font-body"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 font-body"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed sm:text-sm font-body"
            />
          </div>

          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700 font-body"
            >
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-body"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 font-body"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-body"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-gray-700 font-body"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-body"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600 font-body">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-center text-sm text-green-600 font-body">
              {successMessage}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 font-body transition-colors duration-200"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default UserPage;
