import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import TeamMemberList from './accounts/TeamMemberList';
import AddMemberModal from './accounts/AddMemberModal';

// Demo data
const initialMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Admin',
    status: 'active' as const
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'Manager',
    status: 'active' as const
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    email: 'michael.r@company.com',
    role: 'User',
    status: 'pending' as const
  }
];

const AccountsSettings = () => {
  const [members, setMembers] = useState(initialMembers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<typeof initialMembers[0] | null>(null);

  const handleAddMember = (memberData: any) => {
    const newMember = {
      id: Date.now().toString(),
      ...memberData,
      status: 'pending' as const
    };
    setMembers(prev => [...prev, newMember]);
  };

  const handleEditMember = (member: typeof initialMembers[0]) => {
    setEditingMember(member);
    setIsAddModalOpen(true);
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Team Members</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
        >
          <UserPlus size={20} />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TeamMemberList
          members={members}
          onEdit={handleEditMember}
          onRemove={handleRemoveMember}
        />
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMember(null);
        }}
        onAdd={handleAddMember}
      />
    </div>
  );
};

export default AccountsSettings;