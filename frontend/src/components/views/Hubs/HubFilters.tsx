import * as React from "react";

import { Search, SlidersHorizontal } from 'lucide-react';

interface HubFiltersProps {
  onSearch: (query: string) => void;
  onSort: (value: string) => void;
  onFilter: (status: string) => void;
}

const HubFilters = ({ onSearch, onSort, onFilter }: HubFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search hubs..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="flex gap-4">
        <select
          onChange={(e) => onSort(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        >
          <option value="date">Creation Date</option>
          <option value="members">Members</option>
          <option value="pending">Pending Issues</option>
        </select>

        <select
          onChange={(e) => onFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        >
          <option value="all">All Status</option>
          <option value="pending">Has Pending Issues</option>
          <option value="none">No Pending Issues</option>
        </select>

        <button className="p-2 border rounded-lg hover:bg-gray-50">
          <SlidersHorizontal size={20} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default HubFilters;