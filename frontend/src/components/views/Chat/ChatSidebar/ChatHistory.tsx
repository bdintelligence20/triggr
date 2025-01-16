import React from 'react';
import { MessageSquare } from 'lucide-react';

const demoChatHistory = [
  { id: 1, title: 'Safety procedures update', date: '2024-02-10' },
  { id: 2, title: 'Equipment maintenance schedule', date: '2024-02-09' },
  { id: 3, title: 'Training requirements', date: '2024-02-08' },
];

const ChatHistory = () => {
  return (
    <div className="px-3 py-2">
      <div className="px-3 py-2 text-sm font-medium text-gray-500">
        Previous Chats
      </div>
      <div className="space-y-1">
        {demoChatHistory.map(chat => (
          <button
            key={chat.id}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <MessageSquare size={16} className="text-gray-400" />
            <div className="flex-1 text-left">
              <div className="truncate">{chat.title}</div>
              <div className="text-xs text-gray-500">
                {new Date(chat.date).toLocaleDateString()}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;