import React, { useState } from 'react';
import EditPermissionsModal from './permissions/EditPermissionsModal';

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

const initialRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: ['access_hubs', 'upload_content', 'generate_reports', 'view_financial', 'manage_users', 'access_integrations', 'modify_billing', 'view_all_requests']
  },
  {
    id: '2',
    name: 'Manager',
    permissions: ['access_hubs', 'upload_content', 'generate_reports', 'view_all_requests']
  },
  {
    id: '3',
    name: 'User',
    permissions: ['access_hubs', 'upload_content']
  }
];

const PermissionsSettings = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleSavePermissions = (permissions: string[]) => {
    if (editingRole) {
      setRoles(prev => prev.map(role => 
        role.id === editingRole.id
          ? { ...role, permissions }
          : role
      ));
    }
    setEditingRole(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Permissions</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Role Management</h3>
          <div className="border rounded-lg divide-y">
            {roles.map((role) => (
              <div key={role.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-gray-500">
                    {role.permissions.length} permissions granted
                  </div>
                </div>
                <button
                  onClick={() => setEditingRole(role)}
                  className="px-4 py-2 text-emerald-400 hover:bg-emerald-50 rounded-lg"
                >
                  Edit Permissions
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingRole && (
        <EditPermissionsModal
          isOpen={true}
          onClose={() => setEditingRole(null)}
          roleName={editingRole.name}
          initialPermissions={editingRole.permissions}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  );
};

export default PermissionsSettings;