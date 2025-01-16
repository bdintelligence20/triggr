import * as React from "react";

import { Calendar, User, ArrowLeft, Edit, Users, ExternalLink } from 'lucide-react';
import HubMetrics from './sections/HubMetrics';

interface HubHeaderProps {
  hub: {
    name: string;
    createdDate: string;
    owner: string;
    requests: number;
    reports: number;
    pendingIssues: number;
    image: string;
    description?: string;
    memberCount?: number;
    relevantDates?: Array<{ label: string; date: string }>;
    links?: Array<{ label: string; url: string }>;
    customFields?: Array<{ label: string; value: string }>;
  };
  onBack: () => void;
  onEdit: () => void;
  onManageMembers: () => void;
}

const HubHeader: React.FC<HubHeaderProps> = ({ hub, onBack, onEdit, onManageMembers }) => {
  return (
    <div className="relative">
      <div className="h-48 relative">
        <img 
          src={hub.image} 
          alt={hub.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white -mt-24 relative rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            {/* Title and Actions */}
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <h1 className="text-2xl font-bold">{hub.name}</h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>Created {new Date(hub.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} />
                    <span>{hub.owner}</span>
                  </div>
                  {hub.description && (
                    <p className="w-full text-gray-600">{hub.description}</p>
                  )}
                  <div className="w-full flex flex-wrap gap-x-6 gap-y-2">
                    {hub.relevantDates?.map((date, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{date.label}: {new Date(date.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {hub.links?.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-emerald-400 hover:text-emerald-500"
                      >
                        <ExternalLink size={16} />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={onManageMembers}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-400 hover:bg-emerald-50 rounded-lg"
                >
                  <Users size={18} />
                  <span className="hidden sm:inline">Members</span>
                  {hub.memberCount !== undefined && (
                    <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-xs">
                      {hub.memberCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-400 hover:bg-emerald-50 rounded-lg"
                >
                  <Edit size={18} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="pt-4 border-t">
              <HubMetrics
                requests={hub.requests}
                reports={hub.reports}
                pendingIssues={hub.pendingIssues}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubHeader;