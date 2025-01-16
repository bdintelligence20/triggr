import React from 'react';

interface Permission {
  id: string;
  label: string;
  description: string;
}

interface RolePermissionsProps {
  roleName: string;
  permissions: Permission[];
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string) => void;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({
  roleName,
  permissions,
  selectedPermissions,
  onPermissionChange,
}) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Permissions for {roleName}</h3>
      <div className="space-y-4">
        {permissions.map((permission) => (
          <label key={permission.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedPermissions.includes(permission.id)}
              onChange={() => onPermissionChange(permission.id)}
              className="mt-1 h-4 w-4 text-emerald-400 border-gray-300 rounded focus:ring-emerald-400"
            />
            <div>
              <div className="font-medium">{permission.label}</div>
              <div className="text-sm text-gray-500">{permission.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RolePermissions;