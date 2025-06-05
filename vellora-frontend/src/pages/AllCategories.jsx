import React, { useState, useEffect } from "react";
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
import { Link } from "react-router-dom";

const getCategoryDisplay = (categoryName) => {
  console.log("Category Name Received:", categoryName); // Debugging

  switch (categoryName.toLowerCase().trim()) {
    case "shoes":
      return { icon: faShoePrints, color: "bg-pink-200 text-gray-800" };
    case "accessories":
      return { icon: faShoppingBag, color: "bg-blue-200 text-gray-800" };
    case "makeup":
      return { icon: faStar, color: "bg-red-200 text-gray-800" };
    case "skincare":
      return { icon: faSpa, color: "bg-green-200 text-gray-800" };
    case "jackets":
      return { icon: faSuitcase, color: "bg-gray-200 text-gray-800" };
    case "shirts":
      return { icon: faTshirt, color: "bg-orange-200 text-gray-800" };
    case "dresses":
      return { icon: faTag, color: "bg-teal-200 text-gray-800" };
    case "bags":
      return { icon: faBriefcase, color: "bg-purple-200 text-gray-800" };
    default:
      console.warn(`No matching icon for category: ${categoryName}`);
      return { icon: faTag, color: "bg-gray-200 text-gray-800" };
  }
};

const AllCategoriesPage = () => {
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
        console.log("Fetched Categories:", data); 

        setCategories(
          Array.isArray(data.results)
            ? data.results.map((cat) => ({
                ...cat,
                ...getCategoryDisplay(cat.name), 
              }))
            : []
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
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <h2 className="font-headings text-4xl font-bold text-gray-900 mb-8 text-center">
          Browse All Categories
        </h2>

        {loading && (
          <p className="text-center text-gray-600">Loading categories...</p>
        )}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 w-full gap-4">
            {categories.map((category) => (
              <Link to={`/category/${category.name}`} key={category.id}>
                <div
                  className={`p-3 rounded-xl shadow-lg flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer ${category.color} w-full h-40`}
                >
                  <FontAwesomeIcon
                    icon={category.icon}
                    className="text-3xl mb-3 text-gray-700 hover:text-gray-900"
                  />
                  <h3 className="font-body text-md font-semibold">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AllCategoriesPage;
