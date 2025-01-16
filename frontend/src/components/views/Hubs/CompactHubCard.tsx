import React from 'react';
import { Users, AlertCircle } from 'lucide-react';

interface CompactHubCardProps {
  id: number;
  name: string;
  createdDate: string;
  owner: string;
  members: number;
  pendingIssues: number;
  requests: number;
  reports: number;
  image: string;
  onClick: (id: number) => void;
}

const CompactHubCard = ({
  id,
  name,
  createdDate,
  owner,
  members,
  pendingIssues,
  requests,
  reports,
  image,
  onClick,
}: CompactHubCardProps) => (
  <div
    onClick={() => onClick(id)}
    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
  >
    <div className="relative h-32">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-medium truncate">{name}</h3>
        <p className="text-white/80 text-sm truncate">{owner}</p>
      </div>
    </div>

    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Users size={16} />
          <span>{members} members</span>
        </div>
        {pendingIssues > 0 && (
          <div className="flex items-center gap-1 text-amber-500">
            <AlertCircle size={16} />
            <span>{pendingIssues} pending</span>
          </div>
        )}
      </div>

      <div className="flex justify-between text-sm border-t pt-2">
        <span className="text-emerald-400">{requests} Requests</span>
        <span className="text-emerald-400">{reports} Reports</span>
      </div>
    </div>
  </div>
);

export default CompactHubCard;