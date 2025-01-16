import React from 'react';
import { Search, Plus, Cloud, Files, Users } from 'lucide-react';

interface LibraryHeaderProps {
  onAddContent: () => void;
  activeTab: 'files' | 'cloud' | 'teams';
  onTabChange: (tab: 'files' | 'cloud' | 'teams') => void;
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ onAddContent, activeTab, onTabChange }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-semibold">Library</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search files and folders..."
            className="bg-transparent border-none focus:outline-none"
          />
        </div>
        <button 
          onClick={onAddContent}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-300 transition-colors"
        >
          <Plus size={20} />
          Add Content
        </button>
      </div>
    </div>

    <div className="flex gap-4 border-b">
      <button
        onClick={() => onTabChange('files')}
        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
          activeTab === 'files'
            ? 'border-emerald-400 text-emerald-400'
            : 'border-transparent hover:border-gray-200'
        }`}
      >
        <Files size={20} />
        Files
      </button>
      <button
        onClick={() => onTabChange('cloud')}
        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
          activeTab === 'cloud'
            ? 'border-emerald-400 text-emerald-400'
            : 'border-transparent hover:border-gray-200'
        }`}
      >
        <Cloud size={20} />
        Cloud Storage
      </button>
      <button
        onClick={() => onTabChange('teams')}
        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
          activeTab === 'teams'
            ? 'border-emerald-400 text-emerald-400'
            : 'border-transparent hover:border-gray-200'
        }`}
      >
        <Users size={20} />
        Teams
      </button>
    </div>
  </div>
);

export default LibraryHeader;