import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoePrints,
  faShoppingBag,
  faStar,
  faSpa,
  faTshirt,
  faSuitcase,
  faTag,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";

const getCategoryDisplay = (categoryName) => {
  switch (categoryName.toLowerCase()) {
    case "shoes":
      return { icon: faShoePrints, color: "bg-pink-100 text-gray-800" };
    case "accessories":
      return { icon: faShoppingBag, color: "bg-blue-100 text-gray-800" };
    case "makeup":
      return { icon: faStar, color: "bg-red-100 text-gray-800" };
    case "skincare":
      return { icon: faSpa, color: "bg-green-100 text-gray-800" };
    case "jackets":
      return { icon: faSuitcase, color: "bg-gray-100 text-gray-800" };
    case "shirts":
      return { icon: faTshirt, color: "bg-orange-100 text-gray-800" };
    case "dresses":
      return { icon: faTag, color: "bg-teal-100 text-gray-800" };
    case "bags":
      return { icon: faBriefcase, color: "bg-purple-100 text-gray-800" };
    default:
      return { icon: faTag, color: "bg-gray-100 text-gray-800" };
  }
};

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/products/categories/"
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setCategories(
          data.results.map((cat) => ({
            ...cat,
            ...getCategoryDisplay(cat.name),
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-headings text-3xl text-gray-800 mb-6">
          Categories
        </h2>

        {loading && (
          <p className="text-center text-gray-600">Loading categories...</p>
        )}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-4 w-full gap-2">
            {categories.slice(0, 4).map((category) => (
              <Link
                to={`/category/${encodeURIComponent(category.name)}`}
                key={category.id}
              >
                <div
                  className={`p-2 rounded-lg shadow-md flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer ${category.color} w-full h-32`}
                >
                  <FontAwesomeIcon
                    icon={category.icon}
                    className="text-lg mb-2 text-gray-700"
                  />
                  <h3 className="font-body text-sm font-semibold">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-4">
          <Link
            to="/categories"
            className="text-blue-600 hover:underline text-sm font-semibold"
          >
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
