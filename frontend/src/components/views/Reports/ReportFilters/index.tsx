import React from 'react';
import DateRangeSelect from './DateRangeSelect';
import TagSelect from './TagSelect';
import HubSelect from './HubSelect';
import KeywordWithOptions from './KeywordWithOptions';

const ReportFilters = () => {
  const handleGenerateReport = () => {
    console.log('Generating report with selected filters');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 space-y-8">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <DateRangeSelect />
          </div>
          <div className="w-48">
            <TagSelect />
          </div>
          <div className="w-48">
            <HubSelect />
          </div>
        </div>
        <KeywordWithOptions onGenerateReport={handleGenerateReport} />
      </div>
    </div>
  );
};

export default ReportFilters;