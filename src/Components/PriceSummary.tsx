import React from 'react';

type PriceSummaryProps = {
  subtotal: number;
  discount: number;
  delivery: number;
};

const PriceSummary: React.FC<PriceSummaryProps> = ({ subtotal, discount, delivery }) => {
  const total = subtotal - discount + delivery;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Price Summary</h3>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Ahmedabad Discount (AHM50):</span>
          <span>-₹{discount}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Charges:</span>
          <span>₹{delivery}</span>
        </div>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between text-lg font-bold text-gray-900">
        <span>Total:</span>
        <span>₹{total}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Enter promo code"
          className="flex-1 px-3 py-2 max-[321px]:w-40 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Apply
        </button>
      </div>
    </div>
  );
};

export default PriceSummary;