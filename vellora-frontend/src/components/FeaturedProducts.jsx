import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/products/products/?page=1&limit=4"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(
          data && data.results && Array.isArray(data.results)
            ? data.results
            : []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-headings text-3xl md:text-4xl text-gray-800 mb-8 md:mb-10 text-center font-extrabold">
          Featured Products
        </h2>

        {loading && (
          <p className="text-center text-gray-600 text-base md:text-lg font-body">
            Loading products...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 text-base md:text-lg font-body">
            Error: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <img
                    src={
                      product.image ? product.image : "/placeholder-product.png"
                    }
                    alt={product.name}
                    className="w-full h-48 sm:h-56 md:h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-headings truncate">
                      {product.name}
                    </h3>
                    <p className="text-lg sm:text-xl text-amber-600 font-bold font-headings">
                      ${parseFloat(product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-8 md:mt-10">
          <Link
            to="/products"
            className="inline-block bg-amber-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-md font-medium shadow hover:bg-amber-700 transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
