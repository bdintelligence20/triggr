import React from 'react';
import { Calendar, Link as LinkIcon, AlertCircle, Users } from 'lucide-react';

interface HubDetailsSectionProps {
  hub: {
    description?: string;
    relevantDates?: { label: string; date: string }[];
    links?: { label: string; url: string }[];
    customFields?: { label: string; value: string }[];
    memberCount: number;
    pendingIssues: number;
  };
}

const HubDetailsSection: React.FC<HubDetailsSectionProps> = ({ hub }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Description */}
      {hub.description && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600">{hub.description}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Users className="text-emerald-400" size={20} />
          <div>
            <div className="text-sm text-gray-500">Total Members</div>
            <div className="font-medium">{hub.memberCount}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <AlertCircle className="text-amber-400" size={20} />
          <div>
            <div className="text-sm text-gray-500">Pending Issues</div>
            <div className="font-medium">{hub.pendingIssues}</div>
          </div>
        </div>
      </div>

      {/* Important Dates */}
      {hub.relevantDates && hub.relevantDates.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Important Dates</h3>
          <div className="space-y-2">
            {hub.relevantDates.map((date, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-600">{date.label}:</span>
                <span className="font-medium">
                  {new Date(date.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Links */}
      {hub.links && hub.links.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Related Links</h3>
          <div className="space-y-2">
            {hub.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-500"
              >
                <LinkIcon size={16} />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Custom Fields */}
      {hub.customFields && hub.customFields.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
          <div className="space-y-2">
            {hub.customFields.map((field, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-gray-600">{field.label}:</span>
                <span className="font-medium">{field.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HubDetailsSection;