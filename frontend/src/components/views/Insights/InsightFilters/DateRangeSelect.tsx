import React from 'react';

const DateRangeSelect = () => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Date Range</label>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 whitespace-nowrap">From:</label>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 whitespace-nowrap">To:</label>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelect;