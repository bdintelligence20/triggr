import React, { useState } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatButtons from './ChatButtons';
import ChatPrompts from './ChatPrompts';
import { ChatMessage, ChatType } from '../types';

interface ChatMainProps {
  initialType?: ChatType;
  initialPlaceholder?: string;
}

const ChatMain: React.FC<ChatMainProps> = ({ initialType = 'request', initialPlaceholder }) => {
  const [activeType, setActiveType] = useState<'request' | 'report' | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'How can I assist you today?',
      timestamp: new Date().toISOString(),
      sender: { name: 'AI Assistant' },
      isRead: true
    }
  ]);

  const handleTypeSelect = (type: 'request' | 'report') => {
    setActiveType(type);
  };

  const handlePromptSelect = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'employee',
      content,
      timestamp: new Date().toISOString(),
      sender: { name: 'You' },
      isRead: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getPlaceholder = () => {
    if (activeType === 'request') return "Ask your question here...";
    if (activeType === 'report') return "Describe the issue and include relevant details...";
    return "Type your message...";
  };

  return (
    <div className="flex-1 flex flex-col bg-white border-l">
      <div className="p-4 border-b">
        <ChatButtons activeType={activeType} onTypeSelect={handleTypeSelect} />
        <ChatPrompts type={activeType} onPromptSelect={handlePromptSelect} />
      </div>
      <ChatMessages messages={messages} />
      <ChatInput 
        onSendMessage={handleSendMessage}
        placeholder={getPlaceholder()}
        chatType={activeType || 'request'}
      />
    </div>
  );
};

export default ChatMain;