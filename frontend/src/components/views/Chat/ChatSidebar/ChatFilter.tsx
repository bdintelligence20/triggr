import React from 'react';
import { Filter } from 'lucide-react';

interface ChatFilterProps {
  selectedSource: 'all' | 'ai' | 'employee';
  selectedType: 'all' | 'requests' | 'reports';
  onSourceChange: (source: 'all' | 'ai' | 'employee') => void;
  onTypeChange: (type: 'all' | 'requests' | 'reports') => void;
}

const ChatFilter: React.FC<ChatFilterProps> = ({
  selectedSource,
  selectedType,
  onSourceChange,
  onTypeChange
}) => {
  return (
    <div className="px-4 py-2 border-b">
      <div className="flex items-center gap-2 mb-2">
        <Filter size={16} className="text-gray-400" />
        <span className="text-sm font-medium">Filters</span>
      </div>
      <div className="space-y-2">
        <select
          value={selectedSource}
          onChange={(e) => onSourceChange(e.target.value as 'all' | 'ai' | 'employee')}
          className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        >
          <option value="all">All Sources</option>
          <option value="ai">AI Chats</option>
          <option value="employee">Employee Chats</option>
        </select>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as 'all' | 'requests' | 'reports')}
          className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        >
          <option value="all">All Types</option>
          <option value="requests">Requests</option>
          <option value="reports">Reports</option>
        </select>
      </div>
    </div>
  );
}

export default ChatFilter;