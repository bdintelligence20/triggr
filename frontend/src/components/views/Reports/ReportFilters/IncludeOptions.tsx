import React from 'react';

const IncludeOptions = () => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Include</label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-emerald-400 border-gray-300 rounded focus:ring-emerald-400"
            defaultChecked
          />
          <span className="text-sm text-gray-700">Requests</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-emerald-400 border-gray-300 rounded focus:ring-emerald-400"
            defaultChecked
          />
          <span className="text-sm text-gray-700">Reports</span>
        </label>
      </div>
    </div>
  );
};

export default IncludeOptions;