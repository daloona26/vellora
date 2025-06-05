import  { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CartItem from "../components/CartItem";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!isAuthenticated) {
      setError("You must be logged in to view your cart.");
      setLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/api/cart/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        setError("Session expired or unauthorized. Please log in again.");
        setLoading(false);
        return;
      } else if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(
            errorData.detail || `HTTP error! Status: ${response.status}`
          );
        } catch (jsonError) {
          setError(
            `HTTP error! Status: ${
              response.status
            } - Response: ${errorText.substring(0, 150)}... (Not JSON)`
          );
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      let processedCartData = { items: [] };

      if (data && typeof data === "object" && Array.isArray(data.results)) {
        if (data.results.length > 0) {
          processedCartData = data.results[0];
        }
      } else if (data && typeof data === "object") {
        processedCartData = data;
      }

      if (!processedCartData || !Array.isArray(processedCartData.items)) {
        processedCartData = { ...processedCartData, items: [] };
        console.warn(
          "CartPage: 'items' property was not an array, forcing to empty array."
        );
      }
      setCart(processedCartData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
      setError("Please log in to view your cart.");
    }
  }, [isAuthenticated, fetchCart]);

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    if (cart.total_price !== undefined && cart.total_price !== null) {
      return parseFloat(cart.total_price);
    }
    return cart.items.reduce(
      (total, item) => total + parseFloat(item.product.price) * item.quantity,
      0
    );
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setLoading(true);
    setError(null);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setError("Authentication required to update cart.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/cart/update-item-quantity/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            product_id: cart.items.find((item) => item.id === itemId).product
              .id,
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        fetchCart();
      } else {
        setError(data.detail || "Failed to update quantity.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error updating quantity.");
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setLoading(true);
    setError(null);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setError("Authentication required to remove cart item.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/cart/remove-item/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            product_id: cart.items.find((item) => item.id === itemId).product
              .id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        fetchCart();
      } else {
        setError(data.detail || "Failed to remove item.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error removing item.");
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setError(
        "Your cart is empty. Please add items before proceeding to checkout."
      );
      return;
    }
    navigate("/checkout");
  };

  return (
    <section className="py-10 bg-neutral-50 min-h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-headings text-4xl text-gray-800 mb-8 text-center">
          Your Shopping Cart
        </h2>

        {loading && (
          <p className="text-center text-gray-600">Loading cart...</p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            {cart && cart.items && cart.items.length > 0 ? (
              <div>
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center text-lg">
                Your cart is currently empty.
              </p>
            )}
          </div>
        )}

        {!loading && !error && cart && (
          <div className="flex flex-col sm:flex-row justify-end items-center sm:items-end gap-4">
            <p className="font-body text-2xl font-bold text-gray-800">
              Subtotal: ${calculateTotal().toFixed(2)}
            </p>
            <button
              onClick={handleProceedToCheckout}
              className="bg-gray-700 text-white py-3 px-8 rounded-lg text-xl font-medium hover:bg-gray-800 transition-colors duration-300 shadow-md w-full sm:w-auto"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartPage;
