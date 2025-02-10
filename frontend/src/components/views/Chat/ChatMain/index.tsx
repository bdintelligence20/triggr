// src/components/views/ChatMain/index.tsx
import React, { useState } from 'react';
import Messages from './ChatMessages';import Input from './Input';
import Buttons from './ChatButtons';
import Prompts from './ChatPrompts';

import { ChatMessage } from '../../../types/chat';
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

  const handleSendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'employee',
      content,
      timestamp: new Date().toISOString(),
      sender: { name: 'You' },
      isRead: true
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message to query endpoint for RAG processing
      const response = await fetch('https://triggr.onrender.com/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Create AI message from the response
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date().toISOString(),
        sender: { name: 'AI Assistant' },
        isRead: true
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        sender: { name: 'AI Assistant' },
        isRead: true
      }]);
    }
  };

  const getPlaceholder = () => {
    if (activeType === 'request') return "Ask your question here...";
    if (activeType === 'report') return "Describe the issue and include relevant details...";
    return "Type your message...";
  };

  return (
    <div className="flex-1 flex flex-col bg-white border-l">
      <div className="p-4 border-b">
        <Buttons activeType={activeType} onTypeSelect={handleTypeSelect} />
        <Prompts type={activeType} onPromptSelect={handlePromptSelect} />
      </div>
      <Messages messages={messages} />
      <Input 
        onSendMessage={handleSendMessage}
        placeholder={getPlaceholder()}
        chatType={activeType || 'request'}
      />
    </div>
  );
};

export default ChatMain;