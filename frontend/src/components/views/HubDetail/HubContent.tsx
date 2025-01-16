import React from 'react';
import RequestsList from './RequestsList';
import ReportsList from './ReportsList';

interface HubContentProps {
  hubId: number;
  hub: {
    description?: string;
    relevantDates?: { label: string; date: string }[];
    links?: { label: string; url: string }[];
    customFields?: { label: string; value: string }[];
  };
}

const HubContent = ({ hubId, hub }: HubContentProps) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RequestsList hubId={hubId} />
        <ReportsList hubId={hubId} />
      </div>
    </div>
  );
};

export default HubContent;