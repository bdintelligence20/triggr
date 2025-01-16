import React from 'react';
import { Search } from 'lucide-react';

interface KeywordWithOptionsProps {
  onGenerateInsight: () => void;
}

const KeywordWithOptions = ({ onGenerateInsight }: KeywordWithOptionsProps) => {
  return (
    <div className="flex items-start gap-6">
      <div className="flex-1 space-y-2">
        <label className="block text-sm font-medium text-gray-700">Keyword</label>
        <div className="flex items-center gap-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by keyword..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-400 border-gray-300 rounded focus:ring-emerald-400"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">Requests</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-400 border-gray-300 rounded focus:ring-emerald-400"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">Reports</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onGenerateInsight}
        className="mt-8 px-6 py-2.5 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 transition-colors font-medium"
      >
        Generate Insight
      </button>
    </div>
  );
};

export default KeywordWithOptions;