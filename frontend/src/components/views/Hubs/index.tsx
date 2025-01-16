import React, { useState } from 'react';
import HubsHeader from './HubsHeader';
import HubFilters from './HubFilters';
import CompactHubCard from './CompactHubCard';
import HubDetail from '../HubDetail';
import NewHubModal from './NewHubModal';
import { demoHubs } from '../../data/demo-data';

const Hubs = () => {
  const [isNewHubModalOpen, setIsNewHubModalOpen] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredHubs = demoHubs
    .filter(hub => {
      const matchesSearch = hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.owner.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' ||
        (filterStatus === 'pending' && hub.pendingIssues > 0) ||
        (filterStatus === 'none' && hub.pendingIssues === 0);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return b.members - a.members;
        case 'pending':
          return b.pendingIssues - a.pendingIssues;
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
    });

  if (selectedHubId) {
    return (
      <HubDetail 
        hubId={selectedHubId} 
        onBack={() => setSelectedHubId(null)} 
      />
    );
  }

  return (
    <div className="p-6">
      <HubsHeader onNewHub={() => setIsNewHubModalOpen(true)} />
      <HubFilters
        onSearch={setSearchQuery}
        onSort={setSortBy}
        onFilter={setFilterStatus}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredHubs.map((hub) => (
          <CompactHubCard 
            key={hub.id} 
            {...hub} 
            onClick={setSelectedHubId}
          />
        ))}
      </div>
      <NewHubModal 
        isOpen={isNewHubModalOpen}
        onClose={() => setIsNewHubModalOpen(false)}
      />
    </div>
  );
};

export default Hubs;