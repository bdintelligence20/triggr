import React, { useState } from 'react';
import ChatFilter from './ChatFilter';
import ChatThreadItem from './ChatThreadItem';
import { ChatThread } from '../types';

const demoThreads: ChatThread[] = [
  {
    id: '1',
    title: 'AI Conversation',
    lastMessage: 'Here are the safety procedures you requested...',
    timestamp: '2024-02-10T14:30:00',
    type: 'ai',
    unreadCount: 0,
    sender: {
      name: 'AI Assistant'
    }
  },
  {
    id: '2',
    title: 'Equipment Maintenance Request',
    lastMessage: 'The conveyor belt in section B needs urgent maintenance',
    timestamp: '2024-02-10T13:45:00',
    type: 'employee',
    status: 'pending',
    hubName: 'Operations Hub',
    unreadCount: 2,
    sender: {
      name: 'John Smith',
      department: 'Maintenance'
    }
  }
];

interface ChatSidebarProps {
  onThreadSelect: (threadId: string) => void;
  activeThreadId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onThreadSelect, activeThreadId }) => {
  const [selectedSource, setSelectedSource] = useState<'all' | 'ai' | 'employee'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'requests' | 'reports'>('all');

  const filteredThreads = demoThreads.filter(thread => {
    if (selectedSource !== 'all' && thread.type !== selectedSource) return false;
    return true;
  });

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col h-full bg-white">
      <ChatFilter
        selectedSource={selectedSource}
        selectedType={selectedType}
        onSourceChange={setSelectedSource}
        onTypeChange={setSelectedType}
      />
      
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.map(thread => (
          <ChatThreadItem
            key={thread.id}
            thread={thread}
            isActive={thread.id === activeThreadId}
            onClick={() => onThreadSelect(thread.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;