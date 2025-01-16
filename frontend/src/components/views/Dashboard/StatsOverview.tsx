import React from 'react';
import StatCard from './StatCard';
import TagsCard from './TagsCard';

const popularTags = [
  'HR',
  'Operations',
  'Health & Safety',
  'Damage',
  'Training',
  'Maintenance',
];

const StatsOverview = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Total Activity</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-3xl font-bold text-gray-900">978</div>
          <p className="text-sm text-gray-500">Requests</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">637</div>
          <p className="text-sm text-gray-500">Reports</p>
        </div>
      </div>
    </div>
    <StatCard 
      title="Active Users" 
      value="376"
      subtitle="Currently using the platform" 
    />
    <TagsCard tags={popularTags} />
  </div>
);

export default StatsOverview;