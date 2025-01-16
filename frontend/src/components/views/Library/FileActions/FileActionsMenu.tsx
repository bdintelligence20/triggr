import React from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { LibraryItem } from '../../../types';

interface FileActionsMenuProps {
  item: LibraryItem;
  onRename: (item: LibraryItem) => void;
  onDelete: (item: LibraryItem) => void;
}

const FileActionsMenu: React.FC<FileActionsMenuProps> = ({ item, onRename, onDelete }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg"
        aria-label="More options"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
          <button
            onClick={() => {
              onRename(item);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Pencil size={16} />
            Rename
          </button>
          <button
            onClick={() => {
              onDelete(item);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FileActionsMenu;