import * as React from "react";

import { X } from 'lucide-react';
import NewHubForm from './NewHubForm';

interface NewHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewHubModal = ({ isOpen, onClose }: NewHubModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Hub</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <NewHubForm onClose={onClose} />
      </div>
    </div>
  );
};

export default NewHubModal;