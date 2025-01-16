import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LibraryItem {
  id: string;          // OpenAI's file ID
  name: string;        // Original filename
  type: 'file' | 'folder';
  size?: string;       // Display size
  owner: string;
  lastModified: string;
  items?: number;
  vectorStoreId?: string;  // OpenAI vector store ID
  openAIFileId?: string;   // OpenAI file ID
}

interface FileState {
  files: LibraryItem[];
  addFiles: (newFiles: LibraryItem[]) => void;
  removeFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set) => ({
      files: [],
      addFiles: (newFiles) => set((state) => ({ 
        files: [...state.files, ...newFiles] 
      })),
      removeFile: (id) => set((state) => ({ 
        files: state.files.filter(file => file.id !== id) 
      })),
      renameFile: (id, newName) => set((state) => ({
        files: state.files.map(file => 
          file.id === id ? { ...file, name: newName } : file
        )
      }))
    }),
    {
      name: 'file-metadata-storage',
    }
  )
);