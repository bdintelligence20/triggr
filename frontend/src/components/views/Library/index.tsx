import React, { useState } from 'react';
import LibraryHeader from './LibraryHeader';
import FileList from './FileList';
import UploadModal from './UploadModal';
import CloudStorageIntegration from './CloudStorage';
import Teams from './Teams';
import { libraryItems } from '../../data/demo-data';

const Library = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'cloud' | 'teams'>('files');

  return (
    <div className="p-6">
      <LibraryHeader 
        onAddContent={() => setIsUploadModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === 'files' && <FileList items={libraryItems} />}
      {activeTab === 'cloud' && <CloudStorageIntegration />}
      {activeTab === 'teams' && <Teams />}

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default Library;