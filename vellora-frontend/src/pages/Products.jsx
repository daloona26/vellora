import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";


const CategoryProductsPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/products/products/?category__name=${categoryName}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        setProducts(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <h2 className="font-headings text-4xl font-bold text-gray-900 mb-8 text-center">
          {categoryName} Products
        </h2>

        {loading && (
          <p className="text-center text-gray-600">Loading products...</p>
        )}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer">
                  <img
                    src={
                      product.image ? product.image : "/placeholder-product.png"
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
        )}
      </div>
    </section>
  );
};

export default CategoryProductsPage;
