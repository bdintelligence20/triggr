import React from 'react';
import { Calendar, Filter, Download } from 'lucide-react';

const ChartFilters = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
          <Calendar size={18} className="text-gray-400" />
          <select className="border-none bg-transparent focus:outline-none text-sm">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last quarter</option>
          </select>
        </div>

        <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm text-sm">
          <Filter size={18} className="text-gray-400" />
          Add Filter
        </button>
      </div>

      <button className="flex items-center gap-2 px-3 py-2 text-emerald-400 hover:text-emerald-500 text-sm">
        <Download size={18} />
        Export Data
      </button>
    </div>
  );
};

export default ChartFilters;