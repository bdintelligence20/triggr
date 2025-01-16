import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
}

interface UserListProps {
  users: User[];
  onEditRole: (userId: string, role: string) => void;
  onRemoveUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEditRole, onRemoveUser }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="font-medium">Hub Members</h3>
      </div>
      <div className="divide-y">
        {users.map((user) => (
          <div key={user.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={user.role}
                onChange={(e) => onEditRole(user.id, e.target.value)}
                className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              >
                <option value="viewer">Viewer</option>
                <option value="contributor">Contributor</option>
                <option value="manager">Manager</option>
              </select>
              <button
                onClick={() => onRemoveUser(user.id)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;