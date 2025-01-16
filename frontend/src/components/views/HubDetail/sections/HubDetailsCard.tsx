import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';

interface HubDetailsCardProps {
  description?: string;
  relevantDates?: Array<{ label: string; date: string }>;
  links?: Array<{ label: string; url: string }>;
  customFields?: Array<{ label: string; value: string }>;
}

const HubDetailsCard: React.FC<HubDetailsCardProps> = ({
  description,
  relevantDates,
  links,
  customFields,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description Section */}
        {description && (
          <div className="md:col-span-2">
            <p className="text-gray-600">{description}</p>
          </div>
        )}

        {/* Important Dates Section */}
        {relevantDates && relevantDates.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Important Dates</h3>
            <div className="space-y-2">
              {relevantDates.map((date, index) => (
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

        {/* Related Links Section */}
        {links && links.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Related Links</h3>
            <div className="space-y-2">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-500"
                >
                  <ExternalLink size={16} />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information Section */}
        {customFields && customFields.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h3>
            <div className="space-y-2">
              {customFields.map((field, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-600">{field.label}:</span>
                  <span className="font-medium">{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubDetailsCard;