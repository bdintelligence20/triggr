import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import TeamMemberList from './TeamMemberList';
import AddMemberModal from './AddMemberModal';

const Teams = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddMember = (memberData: any) => {
    console.log('Adding new member:', memberData);
    // Implement member addition logic here
  };

  const handleEditMember = (member: any) => {
    console.log('Editing member:', member);
    // Implement member editing logic here
  };

  const handleRemoveMember = (memberId: string) => {
    console.log('Removing member:', memberId);
    // Implement member removal logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 transition-colors"
        >
          <UserPlus size={20} />
          Add Member
        </button>
      </div>

      <TeamMemberList
        onEdit={handleEditMember}
        onRemove={handleRemoveMember}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMember}
      />
    </div>
  );
};

export default Teams;