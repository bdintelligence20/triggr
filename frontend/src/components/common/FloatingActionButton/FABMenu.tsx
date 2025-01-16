import React from 'react';
import { FileText, MessageSquare } from 'lucide-react';

interface FABMenuProps {
  onReportClick: () => void;
  onRequestClick: () => void;
}

const FABMenu: React.FC<FABMenuProps> = ({ onReportClick, onRequestClick }) => (
  <div className="flex flex-col items-end space-y-2 mb-2">
    <button 
      onClick={onReportClick}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 shadow-lg transform transition-transform hover:scale-105"
    >
      <FileText size={20} />
      New Report
    </button>
    <button 
      onClick={onRequestClick}
      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 shadow-lg transform transition-transform hover:scale-105"
    >
      <MessageSquare size={20} />
      New Request
    </button>
  </div>
);

export default FABMenu;