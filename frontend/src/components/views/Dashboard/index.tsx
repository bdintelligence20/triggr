import React from 'react';
import WelcomeBanner from './WelcomeBanner';
import ChartFilters from './ChartFilters';
import ActivitySummary from './ActivitySummary';
import AnalyticsGrid from './AnalyticsGrid';

const Dashboard = () => {
  return (
    <div>
      <WelcomeBanner />
      <div className="px-6 space-y-4">
        {/* Key Metrics Section */}
        <ActivitySummary />

        {/* Analytics Section */}
        <div>
          <ChartFilters />
          <AnalyticsGrid />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;