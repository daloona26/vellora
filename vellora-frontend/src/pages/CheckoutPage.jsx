import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CheckoutPage = () => {
  const { user, isAuthenticated, loadingAuth, updateUserInfo } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [errorCart, setErrorCart] = useState(null);

  const [deliveryInfo, setDeliveryInfo] = useState({
    full_name: "",
    address: "",
    phone_number: "",
    email: "",
  });
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errorUpdate, setErrorUpdate] = useState(null);
  const [successUpdateMessage, setSuccessUpdateMessage] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [errorOrder, setErrorOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");

  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loadingAuth, navigate]);

  useEffect(() => {
    if (user) {
      setDeliveryInfo({
        full_name: user.full_name || "",
        address: user.address || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const fetchCart = useCallback(async () => {
    setLoadingCart(true);
    setErrorCart(null);
    if (!isAuthenticated) {
      setErrorCart("Please log in to view your cart details.");
      setLoadingCart(false);
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
        setErrorCart("Session expired or unauthorized. Please log in again.");
        setLoadingCart(false);
        return;
      } else if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setErrorCart(
            errorData.detail || `HTTP error! Status: ${response.status}`
          );
        } catch (jsonError) {
          setErrorCart(
            `HTTP error! Status: ${
              response.status
            } - Response: ${errorText.substring(0, 150)}...`
          );
        }
        setLoadingCart(false);
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
      }
      setCart(processedCartData);
    } catch (err) {
      setErrorCart(err.message);
    } finally {
      setLoadingCart(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleDeliveryInfoChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleUpdateDeliveryInfo = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setErrorUpdate(null);
    setSuccessUpdateMessage(null);

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setErrorUpdate("Authentication token not found. Please log in.");
      setLoadingUpdate(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(deliveryInfo),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessUpdateMessage("Delivery information updated successfully!");
        updateUserInfo(data);
      } else {
        console.error("Delivery info update failed:", data);
        const fieldErrors = Object.keys(data)
          .map(
            (key) =>
              `${key}: ${
                Array.isArray(data[key]) ? data[key].join(", ") : data[key]
              }`
          )
          .join("; ");
        setErrorUpdate(`Update failed: ${fieldErrors}`);
      }
    } catch (err) {
      console.error("Network error updating delivery info:", err);
      setErrorUpdate("Could not connect to the server to update info.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setErrorOrder(
        "Your cart is empty. Please add items before placing an order."
      );
      return;
    }

    setLoadingOrder(true);
    setErrorOrder(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/api/orders/place/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cart_id: cart.id,
          delivery_info: deliveryInfo,
          payment_method: selectedPaymentMethod,
        }),
      });

      if (response.ok) {
        alert(
          `Order placed successfully using ${selectedPaymentMethod}! Check your email for confirmation.`
        );
        setCart({ items: [] });
        fetchCart();
        navigate("/order-confirmation");
      } else {
        const errorData = await response.json();
        setErrorOrder(errorData.detail || "Failed to place order.");
      }
    } catch (err) {
      setErrorOrder("Could not connect to the server to place order.");
    } finally {
      setLoadingOrder(false);
    }
  };

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

  if (loadingAuth || loadingCart) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-stone-50">
               {" "}
        <p className="text-gray-600 font-body text-lg">
                    Loading checkout details...        {" "}
        </p>
             {" "}
      </div>
    );
  }

  if (errorCart) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-stone-50">
               {" "}
        <p className="text-red-500 font-body text-lg">Error: {errorCart}</p>   
         {" "}
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="py-12 bg-stone-50 min-h-[calc(100vh-120px)]">
           {" "}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               {" "}
        <h2 className="font-headings text-4xl font-bold text-gray-800 mb-8 text-center">
                    Checkout        {" "}
        </h2>
               {" "}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {" "}
          <div className="lg:col-span-2 bg-white shadow-xl rounded-2xl p-8">
                       {" "}
            <h3 className="font-headings text-3xl font-bold text-gray-800 mb-6">
                            Order Summary            {" "}
            </h3>
                       {" "}
            {cart && cart.items && cart.items.length > 0 ? (
              <div className="space-y-4">
                               {" "}
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                                       {" "}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                                       {" "}
                    <div className="flex-grow">
                                           {" "}
                      <p className="font-body text-lg font-semibold text-gray-800">
                                                {item.product.name}             
                               {" "}
                      </p>
                                           {" "}
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                                         {" "}
                    </div>
                                       {" "}
                    <p className="font-body text-lg font-bold text-gray-900">
                                            $                      {" "}
                      {(parseFloat(item.product.price) * item.quantity).toFixed(
                        2
                      )}
                                         {" "}
                    </p>
                                     {" "}
                  </div>
                ))}
                             {" "}
              </div>
            ) : (
              <p className="text-gray-600 text-center text-lg">
                                Your cart is empty.              {" "}
              </p>
            )}
                       {" "}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                           {" "}
              <p className="font-headings text-2xl font-bold text-gray-800">
                                Total:              {" "}
              </p>
                           {" "}
              <p className="font-headings text-2xl font-bold text-gray-900">
                                ${calculateTotal().toFixed(2)}             {" "}
              </p>
                         {" "}
            </div>
                     {" "}
          </div>
                   {" "}
          <div className="lg:col-span-1 space-y-8">
                       {" "}
            <div className="bg-white shadow-xl rounded-2xl p-8">
                           {" "}
              <h3 className="font-headings text-3xl font-bold text-gray-800 mb-6">
                                Delivery Information              {" "}
              </h3>
                           {" "}
              <form onSubmit={handleUpdateDeliveryInfo} className="space-y-4">
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 font-body"
                  >
                                        Full Name                  {" "}
                  </label>
                                   {" "}
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={deliveryInfo.full_name}
                    onChange={handleDeliveryInfoChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-body"
                    required
                  />
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 font-body"
                  >
                                        Address                  {" "}
                  </label>
                                   {" "}
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={deliveryInfo.address}
                    onChange={handleDeliveryInfoChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-body"
                    required
                  ></textarea>
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700 font-body"
                  >
                                        Phone Number                  {" "}
                  </label>
                                   {" "}
                  <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={deliveryInfo.phone_number}
                    onChange={handleDeliveryInfoChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-body"
                    required
                  />
                                 {" "}
                </div>
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 font-body"
                  >
                                        Contact Email                  {" "}
                  </label>
                                   {" "}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={deliveryInfo.email}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed sm:text-sm font-body"
                  />
                                 {" "}
                </div>
                               {" "}
                {errorUpdate && (
                  <p className="text-center text-sm text-red-600 font-body">
                                        {errorUpdate}                 {" "}
                  </p>
                )}
                               {" "}
                {successUpdateMessage && (
                  <p className="text-center text-sm text-green-600 font-body">
                                        {successUpdateMessage}                 {" "}
                  </p>
                )}
                               {" "}
                <button
                  type="submit"
                  disabled={loadingUpdate}
                  className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors duration-200 font-medium font-body"
                >
                                   {" "}
                  {loadingUpdate ? "Saving Info..." : "Save Delivery Info"}     
                           {" "}
                </button>
                             {" "}
              </form>
                         {" "}
            </div>
                       {" "}
            <div className="bg-white shadow-xl rounded-2xl p-8">
                           {" "}
              <h3 className="font-headings text-3xl font-bold text-gray-800 mb-6">
                                Payment Method              {" "}
              </h3>
                           {" "}
              <div className="space-y-4">
                               {" "}
                <div className="flex items-center">
                                   {" "}
                  <input
                    id="payment-cash"
                    name="payment-method"
                    type="radio"
                    value="cash"
                    checked={selectedPaymentMethod === "cash"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                  />
                                   {" "}
                  <label
                    htmlFor="payment-cash"
                    className="ml-3 block text-lg font-body text-gray-700"
                  >
                                        Cash on Delivery                  {" "}
                  </label>
                                 {" "}
                </div>
                               {" "}
                <div className="flex items-center">
                                   {" "}
                  <input
                    id="payment-card"
                    name="payment-method"
                    type="radio"
                    value="card"
                    checked={selectedPaymentMethod === "card"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                    disabled // Disable the radio button
                  />
                                   {" "}
                  <label
                    htmlFor="payment-card"
                    className="ml-3 block text-lg font-body text-gray-400" // Gray out label
                  >
                                        Credit/Debit Card (will provide soon)  
                                   {" "}
                  </label>
                                 {" "}
                </div>
                               {" "}
                <div className="flex items-center">
                                   {" "}
                  <input
                    id="payment-paypal"
                    name="payment-method"
                    type="radio"
                    value="paypal"
                    checked={selectedPaymentMethod === "paypal"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                    disabled // Disable the radio button
                  />
                                   {" "}
                  <label
                    htmlFor="payment-paypal"
                    className="ml-3 block text-lg font-body text-gray-400" // Gray out label
                  >
                                        PayPal (will provide soon)              
                       {" "}
                  </label>
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
                       {" "}
            {errorOrder && (
              <p className="text-center text-red-600 font-body text-sm">
                                {errorOrder}             {" "}
              </p>
            )}
                       {" "}
            <button
              onClick={handlePlaceOrder}
              disabled={
                !cart ||
                cart.items.length === 0 ||
                loadingUpdate ||
                loadingOrder ||
                selectedPaymentMethod !== "cash"
              }
              className="w-full bg-gray-700 text-white py-3 px-8 rounded-lg text-xl font-medium hover:bg-gray-800 transition-colors duration-300 shadow-md transform hover:-translate-y-0.5"
            >
                            {loadingOrder ? "Placing Order..." : "Place Order"} 
                       {" "}
            </button>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </section>
  );
};

export default CheckoutPage;
