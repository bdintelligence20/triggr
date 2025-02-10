// src/components/views/Chat/index.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatSidebar from './ChatSidebar';
import ChatMain from './ChatMain';
import ChatTag from './ChatTag';

const Chat = () => {
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();
  const location = useLocation();
  const { chatType, placeholder } = location.state || {};

  useEffect(() => {
    if (chatType) {
      // Create a new chat thread when redirected from FAB
      const newThreadId = Date.now().toString();
      setActiveThreadId(newThreadId);
    }
  }, [chatType]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ChatSidebar 
        onThreadSelect={setActiveThreadId}
        activeThreadId={activeThreadId}
      />
      <ChatMain 
        initialType={chatType}
        initialPlaceholder={placeholder}
      />
    </div>
  );
};

export default Chat;