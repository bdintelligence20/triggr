import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
  selected: boolean;
  children?: FolderItem[];
}

const demoFolders: FolderItem[] = [
  {
    id: '1',
    name: 'Company Documents',
    selected: false,
    children: [
      { id: '1-1', name: 'HR Policies', selected: true },
      { id: '1-2', name: 'Training Materials', selected: false },
    ],
  },
  {
    id: '2',
    name: 'Project Files',
    selected: false,
    children: [
      { id: '2-1', name: 'Technical Specs', selected: true },
      { id: '2-2', name: 'Documentation', selected: false },
    ],
  },
];

const FolderItem = ({ folder, level = 0 }: { folder: FolderItem; level?: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer`}
        style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {folder.children ? (
          isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        ) : (
          <div className="w-4" />
        )}
        <Folder size={16} className="text-gray-400" />
        <span className="flex-1">{folder.name}</span>
        <input
          type="checkbox"
          checked={folder.selected}
          onChange={(e) => e.stopPropagation()}
          className="h-4 w-4 text-emerald-400 rounded border-gray-300 focus:ring-emerald-400"
        />
      </div>
      {isOpen && folder.children && (
        <div>
          {folder.children.map((child) => (
            <FolderItem key={child.id} folder={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderBrowser = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Select Folders to Reference</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose the folders that the AI can access to assist with requests
        </p>
      </div>
      <div className="divide-y">
        {demoFolders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} />
        ))}
      </div>
    </div>
  );
};

export default FolderBrowser;