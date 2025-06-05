import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addToCartMessage, setAddToCartMessage] = useState(null);
  const { isAuthenticated, refetchCart } = useAuth(); // Get refetchCart from context

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/products/products/${productId}/`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      // Only fetch if productId is defined
      fetchProduct();
    } else {
      setLoading(false);
      setError("Product ID not found in URL.");
    }
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value || 1));
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setAddToCartMessage({
        type: "error",
        text: "Please log in to add items to your cart.",
      });
      return;
    }

    if (product.stock < quantity) {
      setAddToCartMessage({
        type: "error",
        text: `Not enough stock. Only ${product.stock} available.`,
      });
      return;
    }

    setAddToCartMessage(null);
    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/cart/add-item/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ product_id: product.id, quantity: quantity }),
      });

      const data = await response.json();

      if (response.ok) {
        setAddToCartMessage({
          type: "success",
          text: `${quantity} x ${product.name} added to cart!`,
        });
        refetchCart();
      } else {
        console.error("Failed to add to cart:", data);
        setAddToCartMessage({
          type: "error",
          text: data.detail || "Failed to add item to cart.",
        });
      }
    } catch (err) {
      console.error("Network error adding to cart:", err);
      setAddToCartMessage({
        type: "error",
        text: "Could not connect to server to add item.",
      });
    }
  };

  return (
    <section className="py-12 bg-stone-50 min-h-[calc(100vh-120px)]">
      <div className="max-w-6xl mx-auto px-6">
        {loading && (
          <p className="text-center text-gray-600 font-body text-lg">
            Loading product details...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 font-body text-lg">
            Error: {error}
          </p>
        )}

        {!loading && !error && product && (
          <div className="bg-white shadow-xl rounded-2xl p-8 flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="w-full md:w-1/2 flex justify-center items-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md h-96 object-cover rounded-xl shadow-lg border border-gray-100"
              />
            </div>

            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="font-headings text-4xl font-bold text-gray-800 mb-4">
                {product.name}
              </h2>
              <p className="font-body text-lg text-gray-700 leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="flex flex-col items-center md:items-start mb-6">
                <p className="font-headings text-3xl font-bold text-gray-900">
                  ${(parseFloat(product.price) * quantity).toFixed(2)}
                </p>
                <p className="font-body text-base text-gray-600">
                  Stock:{" "}
                  <span className="font-semibold text-gray-800">
                    {product.stock}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-center md:justify-start mb-6">
                <label
                  htmlFor="quantity"
                  className="font-body text-lg text-gray-700 mr-3"
                >
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 p-2 border border-gray-300 rounded-md text-center font-body text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {addToCartMessage && (
                <p
                  className={`font-body text-sm mb-4 ${
                    addToCartMessage.type === "error"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {addToCartMessage.text}
                </p>
              )}

              <button
                onClick={handleAddToCart}
                className="w-full md:w-auto mt-6 bg-amber-700 text-white py-3 px-8 rounded-lg text-lg font-medium hover:bg-amber-800 transition-colors duration-300 shadow-lg transform hover:-translate-y-0.5"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductPage;
