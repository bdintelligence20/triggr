import React, { useState } from 'react';
import { X, Search, Mail } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (users: { email: string; role: string }[]) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedUsers, setSelectedUsers] = useState<{ email: string; role: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');

  if (!isOpen) return null;

  const handleAddEmail = () => {
    if (emailInput && !selectedUsers.find(u => u.email === emailInput)) {
      setSelectedUsers([...selectedUsers, { email: emailInput, role: 'viewer' }]);
      setEmailInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(selectedUsers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add Users to Hub</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Existing Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                placeholder="Search by name or email..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {/* Invite by Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite by Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="Enter email address..."
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Users</h3>
              <div className="border rounded-lg divide-y">
                {selectedUsers.map((user, index) => (
                  <div key={index} className="p-3 flex items-center justify-between">
                    <span>{user.email}</span>
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const newUsers = [...selectedUsers];
                        newUsers[index].role = e.target.value;
                        setSelectedUsers(newUsers);
                      }}
                      className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="contributor">Contributor</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
          >
            Add Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;