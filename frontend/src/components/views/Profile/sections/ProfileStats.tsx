import React from 'react';
import { FileText, MessageSquare } from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    requests: number;
    reports: number;
  };
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium mb-4">Activity Summary</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
          <MessageSquare className="text-emerald-400" size={24} />
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats.requests}</div>
            <p className="text-sm text-gray-500">Requests Submitted</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
          <FileText className="text-emerald-400" size={24} />
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats.reports}</div>
            <p className="text-sm text-gray-500">Reports Created</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;