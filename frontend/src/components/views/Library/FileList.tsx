import React, { useState } from 'react';
import { File, Folder, Download } from 'lucide-react';
import { LibraryItem } from '../../types';
import FileActionsMenu from './FileActions/FileActionsMenu';
import DeleteConfirmationDialog from './FileActions/DeleteConfirmationDialog';
import RenameDialog from './FileActions/RenameDialog';

interface FileListProps {
  items: LibraryItem[];
}

const FileList = ({ items }: FileListProps) => {
  const [itemToDelete, setItemToDelete] = useState<LibraryItem | null>(null);
  const [itemToRename, setItemToRename] = useState<LibraryItem | null>(null);

  const handleDelete = (item: LibraryItem) => {
    setItemToDelete(item);
  };

  const handleRename = (item: LibraryItem) => {
    setItemToRename(item);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    // Implement delete logic here
    console.log('Deleting:', itemToDelete.name);
    setItemToDelete(null);
  };

  const confirmRename = (newName: string) => {
    if (!itemToRename) return;
    // Implement rename logic here
    console.log('Renaming:', itemToRename.name, 'to:', newName);
    setItemToRename(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 flex-1">
          <div className="col-span-6 lg:col-span-6">Name</div>
          <div className="hidden md:block col-span-2">Owner</div>
          <div className="hidden md:block col-span-2">Last modified</div>
          <div className="hidden md:block col-span-2">Size</div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              console.log('Downloading files...');
            }}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-500 transition-colors px-4"
          >
            <Download size={16} />
            <span className="text-sm">Download</span>
          </a>
        </div>
      </div>
      
      {items.map((item) => (
        <div 
          key={item.id}
          className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-50 items-center text-sm border-b border-gray-100 last:border-none"
        >
          <div className="col-span-12 md:col-span-6 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
              {item.type === 'folder' ? (
                <Folder className="text-emerald-400" size={20} />
              ) : (
                <File className="text-emerald-400" size={20} />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              {item.items && (
                <p className="text-xs text-gray-500">{item.items} items</p>
              )}
            </div>
          </div>
          <div className="hidden md:block col-span-2 text-gray-600">{item.owner}</div>
          <div className="hidden md:block col-span-2 text-gray-600">
            {new Date(item.lastModified).toLocaleDateString()}
          </div>
          <div className="hidden md:block col-span-1 text-gray-600">{item.size}</div>
          <div className="hidden md:block col-span-1 text-right">
            <FileActionsMenu
              item={item}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          </div>
        </div>
      ))}

      {itemToDelete && (
        <DeleteConfirmationDialog
          item={itemToDelete}
          isOpen={true}
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      {itemToRename && (
        <RenameDialog
          item={itemToRename}
          isOpen={true}
          onClose={() => setItemToRename(null)}
          onConfirm={confirmRename}
        />
      )}
    </div>
  );
};

export default FileList;