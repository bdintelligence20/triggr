import React from 'react';
import { ExternalLink } from 'lucide-react';

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  onConnect: () => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  description,
  icon,
  isConnected,
  onConnect,
}) => {
  return (
    <div className="border rounded-lg p-6 hover:border-emerald-400 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        <button
          onClick={onConnect}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isConnected
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-emerald-400 text-white hover:bg-emerald-300'
          }`}
        >
          {isConnected ? 'Connected' : 'Connect'}
          {!isConnected && <ExternalLink size={16} />}
        </button>
      </div>
    </div>
  );
};

export default IntegrationCard;