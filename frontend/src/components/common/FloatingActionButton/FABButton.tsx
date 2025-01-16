import React from 'react';
import { Plus } from 'lucide-react';

interface FABButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const FABButton: React.FC<FABButtonProps> = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-14 h-14 bg-emerald-400 text-white rounded-full hover:bg-emerald-300 shadow-lg transform transition-all hover:scale-105"
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
  >
    <Plus 
      size={24} 
      className={`transform transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} 
    />
  </button>
);

export default FABButton;