import React from 'react';
import { demoHubs } from '../../../data/demo-data';

const HubSelect = () => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Hub</label>
      <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400">
        <option value="">Select hub</option>
        {demoHubs.map(hub => (
          <option key={hub.id} value={hub.id}>{hub.name}</option>
        ))}
      </select>
    </div>
  );
};

export default HubSelect;