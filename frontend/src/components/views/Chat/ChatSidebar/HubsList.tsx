import React from 'react';
import { ChevronDown } from 'lucide-react';
import { demoHubs } from '../../../data/demo-data';

const HubsList = () => {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-500">
        <span>Hubs</span>
        <ChevronDown size={16} />
      </div>
      <div className="space-y-1">
        {demoHubs.map(hub => (
          <button
            key={hub.id}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {hub.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HubsList;