import React from 'react';
import { Cloud, Check } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
}

const providers: Provider[] = [
  { id: 'sharepoint', name: 'SharePoint', icon: '/icons/sharepoint.svg', connected: false },
  { id: 'onedrive', name: 'OneDrive', icon: '/icons/onedrive.svg', connected: true },
  { id: 'gdrive', name: 'Google Drive', icon: '/icons/gdrive.svg', connected: false },
  { id: 'dropbox', name: 'Dropbox', icon: '/icons/dropbox.svg', connected: false },
];

const CloudStorageProvider = () => {
  const handleConnect = (providerId: string) => {
    console.log(`Connecting to ${providerId}`);
    // Implement OAuth flow here
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Cloud Storage Providers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {providers.map((provider) => (
          <div 
            key={provider.id}
            className="border rounded-lg p-4 flex flex-col items-center hover:border-emerald-400 transition-colors"
          >
            <Cloud className="w-12 h-12 text-gray-400 mb-2" />
            <h3 className="font-medium">{provider.name}</h3>
            <button
              onClick={() => handleConnect(provider.id)}
              className={`mt-4 px-4 py-2 rounded-lg flex items-center gap-2 ${
                provider.connected
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-emerald-400 text-white hover:bg-emerald-300'
              }`}
            >
              {provider.connected ? (
                <>
                  <Check size={16} />
                  Connected
                </>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudStorageProvider;