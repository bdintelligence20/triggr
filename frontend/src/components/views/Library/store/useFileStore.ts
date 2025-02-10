import { create } from 'zustand';

export interface LibraryItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  owner: string;
  lastModified: string;
  vectorStoreId?: string;
  openAIFileId?: string;
}

interface FileState {
  files: LibraryItem[];
  fetchFiles: () => Promise<void>;
  addFiles: (newFiles: LibraryItem[]) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
}

export const useFileStore = create<FileState>((set) => ({
  files: [], // Ensure files is initialized as empty array
  fetchFiles: async () => {
    try {
      const response = await fetch('https://triggr.onrender.com/files');
      const data = await response.json();
      if (data.files) {  // Change to match backend response
        set({ files: data.files });
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      set({ files: [] });  // Reset to empty array on error
    }
  },

  addFiles: async (newFiles) => {
    try {
      // Save each file metadata to backend
      await Promise.all(newFiles.map(file =>
        fetch('https://triggr.onrender.com/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(file)
        })
      ));

      // Refresh file list
      const response = await fetch('https://triggr.onrender.com/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const files = await response.json();
      set({ files });
    } catch (error) {
      console.error('Error adding files:', error);
    }
  },

  

  removeFile: async (id) => {
    try {
      await fetch(`https://triggr.onrender.com/files/${id}`, {
        method: 'DELETE'
      });
      
      // Refresh file list
      const response = await fetch('https://triggr.onrender.com/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const files = await response.json();
      set({ files });
    } catch (error) {
      console.error('Error removing file:', error);
    }
  },
}));