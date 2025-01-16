import React from 'react';
import InsightFilters from './InsightFilters';
import InsightList from './InsightList';

const Insights = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Insights</h2>
        <InsightFilters />
      </div>
      <InsightList />
    </div>
  );
};

export default Insights;