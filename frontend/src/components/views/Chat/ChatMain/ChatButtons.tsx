import React from 'react';
import { HelpCircle, AlertTriangle } from 'lucide-react';

interface ChatButtonsProps {
  activeType: 'request' | 'report' | null;
  onTypeSelect: (type: 'request' | 'report') => void;
}

const ChatButtons: React.FC<ChatButtonsProps> = ({ activeType, onTypeSelect }) => {
  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={() => onTypeSelect('request')}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all
          ${activeType === 'request'
            ? 'bg-emerald-400 text-white shadow-lg'
            : 'bg-white border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-50'
          }`}
      >
        <HelpCircle size={20} />
        <span className="font-medium">Request Information</span>
      </button>
      
      <button
        onClick={() => onTypeSelect('report')}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all
          ${activeType === 'report'
            ? 'bg-emerald-400 text-white shadow-lg'
            : 'bg-white border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-50'
          }`}
      >
        <AlertTriangle size={20} />
        <span className="font-medium">Report an Issue</span>
      </button>
    </div>
  );
};

export default ChatButtons;