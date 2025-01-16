import React from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  permissions: {
    files: boolean;
    folders: boolean;
    images: boolean;
    videos: boolean;
    urls: boolean;
  };
  accessDuration: {
    start: string;
    end: string;
  };
}

const demoMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    permissions: {
      files: true,
      folders: true,
      images: true,
      videos: false,
      urls: true,
    },
    accessDuration: {
      start: '2024-01-01',
      end: '2024-12-31',
    },
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael.r@company.com',
    permissions: {
      files: true,
      folders: false,
      images: true,
      videos: true,
      urls: true,
    },
    accessDuration: {
      start: '2024-02-01',
      end: '2024-06-30',
    },
  },
];

interface TeamMemberListProps {
  onEdit: (member: TeamMember) => void;
  onRemove: (memberId: string) => void;
}

const TeamMemberList = ({ onEdit, onRemove }: TeamMemberListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Member</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Permissions</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Access Duration</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {demoMembers.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(member.permissions).map(([key, value]) => (
                    value && (
                      <span
                        key={key}
                        className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    )
                  ))}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm">
                  <div>From: {new Date(member.accessDuration.start).toLocaleDateString()}</div>
                  <div>To: {new Date(member.accessDuration.end).toLocaleDateString()}</div>
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(member)}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-emerald-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onRemove(member.id)}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamMemberList;