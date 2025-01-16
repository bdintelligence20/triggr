import React from 'react';
import CloudStorageProvider from './CloudStorageProvider';
import FolderBrowser from './FolderBrowser';
import SyncStatus from './SyncStatus';

const CloudStorageIntegration = () => {
  return (
    <div className="space-y-6">
      <CloudStorageProvider />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FolderBrowser />
        <SyncStatus />
      </div>
    </div>
  );
};

export default CloudStorageIntegration;