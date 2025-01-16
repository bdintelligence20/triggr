import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import RolePermissions from './RolePermissions';

interface EditPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleName: string;
  onSave: (permissions: string[]) => void;
  initialPermissions?: string[];
}

const permissions = [
  {
    id: 'access_hubs',
    label: 'Access to Hubs',
    description: 'View and interact with all hubs in the system'
  },
  {
    id: 'upload_content',
    label: 'Upload Content to Library',
    description: 'Add and manage content in the document library'
  },
  {
    id: 'generate_reports',
    label: 'Generate Reports',
    description: 'Create and download various system reports'
  },
  {
    id: 'view_financial',
    label: 'View Financial Data',
    description: 'Access financial information and billing details'
  },
  {
    id: 'manage_users',
    label: 'Manage Users',
    description: 'Add, remove, and modify user accounts'
  },
  {
    id: 'access_integrations',
    label: 'Access Integrations',
    description: 'Configure and manage third-party integrations'
  },
  {
    id: 'modify_billing',
    label: 'Modify Billing Information',
    description: 'Update payment methods and billing details'
  },
  {
    id: 'view_all_requests',
    label: 'View All Requests/Reports',
    description: 'Access all system requests and generated reports'
  }
];

const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({
  isOpen,
  onClose,
  roleName,
  onSave,
  initialPermissions = []
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = () => {
    onSave(selectedPermissions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="modal-title" className="text-xl font-semibold">Edit {roleName} Permissions</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <RolePermissions
          roleName={roleName}
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
        />

        <div className="flex justify-end gap-4 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPermissionsModal;