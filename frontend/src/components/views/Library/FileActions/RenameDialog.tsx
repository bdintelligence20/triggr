import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LibraryItem } from '../../../types';

interface RenameDialogProps {
  item: LibraryItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

const RenameDialog: React.FC<RenameDialogProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [newName, setNewName] = useState(item.name);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    // Add additional validation as needed (e.g., check for duplicates)
    
    onConfirm(newName);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Rename {item.type === 'folder' ? 'Folder' : 'File'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameDialog;