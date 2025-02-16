import React, { useState, useEffect } from 'react';
import { File, Folder, Download, Trash2 } from 'lucide-react';

interface LibraryItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  owner: string;
  lastModified: string;
  url?: string;
}

const FileList = () => {
  const [files, setFiles] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      console.log('Fetching files...');
      const response = await fetch('https://triggr.onrender.com/files');
      console.log('Response:', response);
      const data = await response.json();
      console.log('Data:', data);
      
      if (data && data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = (file: LibraryItem) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    setDeleteInProgress(filename);
    try {
      const response = await fetch(`https://triggr.onrender.com/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Refresh the file list
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeleteInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-3 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
          <div className="col-span-6 lg:col-span-6">Name</div>
          <div className="hidden md:block col-span-2">Owner</div>
          <div className="hidden md:block col-span-2">Last modified</div>
          <div className="hidden md:block col-span-1">Size</div>
          <div className="hidden md:block col-span-1">Actions</div>
        </div>
      </div>
      
      {files.map((item) => (
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
            </div>
          </div>
          <div className="hidden md:block col-span-2 text-gray-600">{item.owner}</div>
          <div className="hidden md:block col-span-2 text-gray-600">
            {new Date(item.lastModified).toLocaleDateString()}
          </div>
          <div className="hidden md:block col-span-1 text-gray-600">{item.size}</div>
          <div className="hidden md:flex col-span-1 gap-2 justify-end">
            {item.url && (
              <button
                onClick={() => handleDownload(item)}
                className="text-emerald-400 hover:text-emerald-500 p-1"
                title="Download"
              >
                <Download size={16} />
              </button>
            )}
            <button
              onClick={() => handleDelete(item.name)}
              className="text-red-400 hover:text-red-500 p-1"
              disabled={deleteInProgress === item.name}
              title="Delete"
            >
              {deleteInProgress === item.name ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;