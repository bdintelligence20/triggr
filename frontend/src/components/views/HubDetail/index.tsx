import React, { useState } from 'react';
import HubHeader from './HubHeader';
import HubContent from './HubContent';
import EditHubModal from './EditHubModal';
import ManageMembersModal from './ManageMembersModal';
import { demoHubs } from '../../data/demo-data';

interface HubDetailProps {
  hubId: number;
  onBack: () => void;
}

const HubDetail = ({ hubId, onBack }: HubDetailProps) => {
  const [hub, setHub] = useState(demoHubs.find(h => h.id === hubId));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  
  if (!hub) return null;

  const handleSaveHub = (updatedData: any) => {
    setHub(prev => ({
      ...prev!,
      ...updatedData
    }));
    setIsEditModalOpen(false);
  };

  // Add default values for new hub properties
  const enhancedHub = {
    ...hub,
    memberCount: hub.members || 0,
    pendingIssues: hub.pendingIssues || 0,
    description: hub.description || '',
    relevantDates: hub.relevantDates || [],
    links: hub.links || [],
    customFields: hub.customFields || []
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <HubHeader 
        hub={enhancedHub}
        onBack={onBack}
        onEdit={() => setIsEditModalOpen(true)}
        onManageMembers={() => setIsMembersModalOpen(true)}
      />
      <HubContent hubId={hubId} hub={enhancedHub} />
      
      <EditHubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveHub}
        hub={enhancedHub}
      />

      <ManageMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        hubName={hub.name}
      />
    </div>
  );
};

export default HubDetail;