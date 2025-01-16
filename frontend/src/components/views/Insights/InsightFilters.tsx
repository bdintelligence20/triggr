import React from 'react';
import { Search, Filter } from 'lucide-react';

const InsightFilters = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap gap-4">
        {/* Date Range */}
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <input
            type="date"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 w-36"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 w-36"
          />
        </div>

        {/* Hub Select */}
        <select className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 w-48">
          <option value="">All Hubs</option>
          <option value="operations">Operations Hub</option>
          <option value="manufacturing">Manufacturing Hub</option>
        </select>

        {/* Tag Select */}
        <select className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 w-48">
          <option value="">All Tags</option>
          <option value="hr">HR</option>
          <option value="operations">Operations</option>
          <option value="safety">Safety</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search insights..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>

        {/* Generate Button */}
        <button className="px-6 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 transition-colors flex items-center gap-2">
          <Filter size={18} />
          Generate Insight
        </button>
      </div>
    </div>
  );
}

export default InsightFilters;