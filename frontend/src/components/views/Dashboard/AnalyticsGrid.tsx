import React from 'react';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import DonutChart from './charts/DonutChart';
import PriorityList from './PriorityList';

const AnalyticsGrid = () => {
  return (
    <div className="space-y-4">
      {/* Top Row - Bar Chart and Priority List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart />
        <PriorityList />
      </div>
      
      {/* Bottom Row - Line Chart and Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineChart />
        <DonutChart />
      </div>
    </div>
  );
}

export default AnalyticsGrid;