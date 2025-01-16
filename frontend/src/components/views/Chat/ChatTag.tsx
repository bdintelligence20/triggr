import React from 'react';

interface ChatTagProps {
  type: 'report' | 'request';
}

const ChatTag: React.FC<ChatTagProps> = ({ type }) => {
  const tagStyles = {
    report: 'bg-blue-100 text-blue-600',
    request: 'bg-purple-100 text-purple-600'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tagStyles[type]}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

export default ChatTag;