import React from 'react';
import { FileText, MessageSquare } from 'lucide-react';

interface ReportCardProps {
  fromDate: string;
  toDate: string;
  tags: string[];
  hubName: string;
  totalReports: number;
  totalRequests: number;
}

const ReportCard = ({ fromDate, toDate, tags, hubName, totalReports, totalRequests }: ReportCardProps) => (
  <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-medium text-gray-900">{hubName}</h3>
        <p className="text-sm text-gray-500">
          {new Date(fromDate).toLocaleDateString()} - {new Date(toDate).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-1 text-emerald-600">
          <FileText size={16} />
          <span className="text-sm font-medium">{totalReports}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600">
          <MessageSquare size={16} />
          <span className="text-sm font-medium">{totalRequests}</span>
        </div>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default ReportCard;