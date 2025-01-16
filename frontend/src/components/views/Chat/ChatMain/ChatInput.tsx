import React, { useState } from 'react';
import { Paperclip, Mic, Send, FileText } from 'lucide-react';
import ReportModal from './ReportModal';
import { ChatType } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onGenerateReport?: (options: any) => void;
  hubName?: string;
  placeholder?: string;
  chatType: ChatType;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onGenerateReport, 
  hubName,
  placeholder,
  chatType
}) => {
  const [message, setMessage] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <>
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-center gap-2">
            <div className="flex gap-2">
              <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Paperclip size={20} />
              </button>
              <button type="button" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Mic size={20} />
              </button>
              {chatType === 'report' && (
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="p-2 text-emerald-400 hover:bg-emerald-50 rounded-lg"
                >
                  <FileText size={20} />
                </button>
              )}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder || `Type your ${chatType}...`}
              className="flex-1 pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 resize-none"
              rows={1}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      {onGenerateReport && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onGenerate={onGenerateReport}
          hubName={hubName}
        />
      )}
    </>
  );
};

export default ChatInput;