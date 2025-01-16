import React from 'react';
import { FileText, Download } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`${
        message.type === 'ai' ? 'bg-white' : 'bg-gray-100'
      } rounded-lg p-4 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <div className={`
          w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
          ${message.type === 'ai' ? 'bg-emerald-400 text-white' : 'bg-gray-400'}
        `}>
          {message.type === 'ai' ? 'AI' : message.sender.name[0]}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">
              {message.type === 'ai' ? 'AI Assistant' : message.sender.name}
            </span>
            {message.sender.department && (
              <span className="text-xs text-gray-500">
                {message.sender.department}
              </span>
            )}
          </div>

          <p className="text-gray-700">{message.content}</p>

          {message.type === 'ai' && message.content.includes('report is ready') && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-emerald-400" size={20} />
                  <span className="font-medium">Activity Report</span>
                </div>
                <button className="flex items-center gap-1 text-emerald-400 hover:text-emerald-500">
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;