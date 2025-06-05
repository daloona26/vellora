import React from "react";

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center py-4 border-b last:border-b-0">
      <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
        <img
          src={
            item.product.image ? item.product.image : "/placeholder-product.png"
          }
          alt={item.product.name}
          className="w-20 h-20 object-cover rounded-md"
        />
        <div className="text-left">
          <p className="font-body text-lg font-semibold text-gray-800">
            {item.product.name}
          </p>
          <p className="text-gray-600">
            Price: ${parseFloat(item.product.price).toFixed(2)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label htmlFor={`quantity-${item.id}`} className="sr-only">
          Quantity
        </label>
        <input
          type="number"
          id={`quantity-${item.id}`}
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
          className="w-16 p-2 border border-gray-300 rounded-md text-center font-body text-base focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <p className="font-body text-lg font-bold text-gray-900">
          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={() => onRemoveItem(item.id)}
          className="text-red-600 hover:text-red-800 transition-colors duration-200 ml-2"
          title="Remove item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
