import React from 'react';
import { Globe } from 'lucide-react';

interface WebsiteInputProps {
  value: string;
  onChange: (value: string) => void;
}

const WebsiteInput: React.FC<WebsiteInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Website URL</label>
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.example.com"
          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        />
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>
    </div>
  );
};

export default WebsiteInput;