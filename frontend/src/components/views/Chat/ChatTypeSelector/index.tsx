import React from 'react';
import { ChatType } from '../types';
import ChatTag from '../ChatTag';

interface ChatTypeSelectorProps {
  selectedType: ChatType;
  onTypeChange: (type: ChatType) => void;
}

const ChatTypeSelector: React.FC<ChatTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="flex gap-2 p-4 border-b bg-white">
      <button
        onClick={() => onTypeChange('report')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          selectedType === 'report' ? 'bg-blue-50' : 'hover:bg-gray-50'
        }`}
      >
        <ChatTag type="report" />
      </button>
      <button
        onClick={() => onTypeChange('request')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          selectedType === 'request' ? 'bg-purple-50' : 'hover:bg-gray-50'
        }`}
      >
        <ChatTag type="request" />
      </button>
    </div>
  );
};

export default ChatTypeSelector;