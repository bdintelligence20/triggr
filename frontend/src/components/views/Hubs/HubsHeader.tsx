import * as React from "react";

import { Search, Plus } from 'lucide-react';

interface HubsHeaderProps {
  onNewHub: () => void;
}

const HubsHeader = ({ onNewHub }: HubsHeaderProps) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl font-semibold">Hubs</h2>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <Search size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search hubs..."
          className="bg-transparent border-none focus:outline-none"
        />
      </div>
      <button 
        onClick={onNewHub}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 transition-colors"
      >
        <Plus size={20} />
        New Hub
      </button>
    </div>
  </div>
);

export default HubsHeader;