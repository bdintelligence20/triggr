import React from 'react';

interface ChatPromptsProps {
  type: 'request' | 'report' | null;
  onPromptSelect: (prompt: string) => void;
}

const requestPrompts = [
  "Ask about company policies",
  "How to handle customer complaints?",
  "Request training materials",
  "Ask about safety procedures",
  "Inquire about equipment maintenance"
];

const reportPrompts = [
  "Report broken equipment",
  "Report a safety concern",
  "Report workplace harassment",
  "Report a security incident",
  "Report maintenance issues"
];

const ChatPrompts: React.FC<ChatPromptsProps> = ({ type, onPromptSelect }) => {
  if (!type) return null;

  const prompts = type === 'request' ? requestPrompts : reportPrompts;

  return (
    <div className="p-4 bg-gray-50 rounded-lg mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        {type === 'request' ? 'Common Questions' : 'Common Issues'}
      </h3>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatPrompts;