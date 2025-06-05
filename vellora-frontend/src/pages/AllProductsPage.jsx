import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const AllProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const urlSearchTerm = queryParams.get("search");

  useEffect(() => {
    if (urlSearchTerm !== null && page !== 1) {
      setPage(1);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("http://127.0.0.1:8000/api/products/products/");
        url.searchParams.append("page", page);

        if (urlSearchTerm) {
          url.searchParams.append("search", urlSearchTerm);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setProducts(Array.isArray(data.results) ? data.results : []);
        setNextPage(data.next);
        setPrevPage(data.previous);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, urlSearchTerm, location.search]);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          All Products
        </h2>

        {loading && (
          <p className="text-center text-gray-600">Loading products...</p>
        )}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {products.length === 0 &&
              (urlSearchTerm || products.length === 0) && (
                <p className="text-center text-gray-600 text-lg">
                  {urlSearchTerm
                    ? `No products found matching "${urlSearchTerm}".`
                    : "No products available."}
                </p>
              )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer">
                    <img
                      src={
                        product.image
                          ? product.image
                          : "/placeholder-product.png"
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover rounded"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-gray-600">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-6 space-x-4">
              {prevPage && (
                <button
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-4 py-2 cursor-pointer bg-gray-200 rounded hover:bg-gray-300"
                >
                  Previous
                </button>
              )}
              {nextPage && (
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className=" cursor-pointer px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Next
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AllProductsPage;
