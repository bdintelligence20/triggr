import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
}

interface TeamMemberListProps {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onRemove: (memberId: string) => void;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({ members, onEdit, onRemove }) => {
  return (
    <div className="border rounded-lg divide-y">
      {members.map((member) => (
        <div key={member.id} className="p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{member.role}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs
                ${member.status === 'active' ? 'bg-green-100 text-green-600' :
                  member.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'}`}
              >
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(member)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-emerald-500"
              aria-label="Edit member"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onRemove(member.id)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500"
              aria-label="Remove member"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMemberList;