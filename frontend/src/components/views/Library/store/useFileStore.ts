import { create } from 'zustand';

export interface LibraryItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  owner: string;
  lastModified: string;
  items?: number;
}

interface FileState {
  files: LibraryItem[];
  addFiles: (newFiles: LibraryItem[]) => void;
  removeFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
}

export const useFileStore = create<FileState>((set) => ({
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
}));