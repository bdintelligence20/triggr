import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import UserList from './UserList';
import AddUserModal from './AddUserModal';

// Demo data
const initialUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'manager',
    status: 'active' as const
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'contributor',
    status: 'active' as const
  }
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState(initialUsers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddUsers = (newUsers: { email: string; role: string }[]) => {
    const addedUsers = newUsers.map((user, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: user.email.split('@')[0],
      email: user.email,
      role: user.role,
      status: 'pending' as const
    }));
    setUsers([...users, ...addedUsers]);
  };

  const handleEditRole = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleRemoveUser = (userId: string) => {
    if (confirm('Are you sure you want to remove this user from the hub?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Hub Members</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
        >
          <UserPlus size={20} />
          Add Users
        </button>
      </div>

      <UserList
        users={users}
        onEditRole={handleEditRole}
        onRemoveUser={handleRemoveUser}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUsers}
      />
    </div>
  );
};

export default UserManagement;