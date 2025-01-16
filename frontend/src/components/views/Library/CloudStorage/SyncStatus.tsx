import React from 'react';
import { RefreshCw, Clock } from 'lucide-react';

interface SyncInfo {
  provider: string;
  lastSync: string;
  nextSync: string;
  status: 'success' | 'syncing' | 'error';
}

const demoSyncInfo: SyncInfo[] = [
  {
    provider: 'OneDrive',
    lastSync: '2024-02-10T14:30:00',
    nextSync: '2024-02-10T15:30:00',
    status: 'success',
  },
  {
    provider: 'SharePoint',
    lastSync: '2024-02-10T14:00:00',
    nextSync: '2024-02-10T15:00:00',
    status: 'syncing',
  },
];

const SyncStatus = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Sync Status</h2>
        <button className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
          <RefreshCw size={16} />
          Sync Now
        </button>
      </div>
      <div className="space-y-4">
        {demoSyncInfo.map((info) => (
          <div key={info.provider} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{info.provider}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Last sync: {new Date(info.lastSync).toLocaleTimeString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Next sync: {new Date(info.nextSync).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className={`
              px-3 py-1 rounded-full text-sm
              ${info.status === 'success' ? 'bg-green-100 text-green-600' :
                info.status === 'syncing' ? 'bg-blue-100 text-blue-600' :
                'bg-red-100 text-red-600'}
            `}>
              {info.status.charAt(0).toUpperCase() + info.status.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyncStatus;