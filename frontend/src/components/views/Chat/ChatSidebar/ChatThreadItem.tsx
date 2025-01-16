import React from 'react';
import { Bot, User, MessageSquare, FileText, CheckCircle, Clock } from 'lucide-react';
import { ChatThread } from '../types';

interface ChatThreadItemProps {
  thread: ChatThread;
  isActive: boolean;
  onClick: () => void;
}

const ChatThreadItem: React.FC<ChatThreadItemProps> = ({ thread, isActive, onClick }) => {
  const getStatusIcon = () => {
    if (!thread.status) return null;
    return thread.status === 'resolved' ? (
      <CheckCircle size={16} className="text-green-500" />
    ) : (
      <Clock size={16} className="text-amber-500" />
    );
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-emerald-50' : ''
      }`}
    >
      <div className={`p-2 rounded-full flex-shrink-0 ${
        thread.type === 'ai' ? 'bg-emerald-100' : 'bg-gray-100'
      }`}>
        {thread.type === 'ai' ? (
          <Bot size={20} className="text-emerald-600" />
        ) : thread.sender.avatar ? (
          <img
            src={thread.sender.avatar}
            alt={thread.sender.name}
            className="w-5 h-5 rounded-full"
          />
        ) : (
          <User size={20} className="text-gray-600" />
        )}
      </div>
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium truncate">
            {thread.type === 'ai' ? 'AI Assistant' : thread.sender.name}
          </p>
          {thread.unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-xs">
              {thread.unreadCount}
            </span>
          )}
        </div>
        
        {thread.hubName && (
          <p className="text-xs text-gray-500 mb-1">{thread.hubName}</p>
        )}
        
        <p className="text-sm text-gray-600 truncate">{thread.lastMessage}</p>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">
            {new Date(thread.timestamp).toLocaleTimeString()}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </button>
  );
};

export default ChatThreadItem;