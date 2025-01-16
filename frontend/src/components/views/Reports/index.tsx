import React from 'react';
import ReportFilters from './ReportFilters';
import ReportList from './ReportList';

const Reports = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-8">Reports</h2>
      <ReportFilters />
      <div className="mt-8">
        <ReportList />
      </div>
    </div>
  );
};

export default Reports;