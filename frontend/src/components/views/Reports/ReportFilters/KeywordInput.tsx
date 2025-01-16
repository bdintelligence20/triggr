import React from 'react';
import { Search } from 'lucide-react';

const KeywordInput = () => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Keyword</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search by keyword..."
          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>
    </div>
  );
};

export default KeywordInput;