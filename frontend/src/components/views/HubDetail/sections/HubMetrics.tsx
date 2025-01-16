import React from 'react';
import { MessageSquare, FileText, AlertCircle } from 'lucide-react';

interface HubMetricsProps {
  requests: number;
  reports: number;
  pendingIssues: number;
}

const HubMetrics: React.FC<HubMetricsProps> = ({ requests, reports, pendingIssues }) => {
  return (
    <div className="flex gap-4">
      <div className="px-4 py-2 bg-emerald-50 rounded-lg">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-emerald-400" />
          <span className="text-emerald-600 font-medium">{requests} Requests</span>
        </div>
      </div>
      <div className="px-4 py-2 bg-emerald-50 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-emerald-400" />
          <span className="text-emerald-600 font-medium">{reports} Reports</span>
        </div>
      </div>
      {pendingIssues > 0 && (
        <div className="px-4 py-2 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-400" />
            <span className="text-amber-600 font-medium">{pendingIssues} Pending</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubMetrics;