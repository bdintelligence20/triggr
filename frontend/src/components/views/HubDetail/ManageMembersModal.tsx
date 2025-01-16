import React, { useState } from 'react';
import { X, Search, Mail, Plus, Trash2 } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
}

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  hubName: string;
}

// Demo data
const initialMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'manager',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'contributor',
    status: 'active'
  }
];

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({ isOpen, onClose, hubName }) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (emailInput && !members.find(m => m.email === emailInput)) {
      const newMember: Member = {
        id: Date.now().toString(),
        name: emailInput.split('@')[0],
        email: emailInput,
        role: 'viewer',
        status: 'pending'
      };
      setMembers([...members, newMember]);
      setEmailInput('');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      setMembers(members.filter(m => m.id !== memberId));
    }
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(members.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Manage Members - {hubName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search and Add Section */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Add by email..."
                className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              />
              <Mail className="absolute translate-x-3 translate-y-3 text-gray-400" size={20} />
              <button
                onClick={handleAddMember}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
            {filteredMembers.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1
                    ${member.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}
                  >
                    {member.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="contributor">Contributor</option>
                    <option value="manager">Manager</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;