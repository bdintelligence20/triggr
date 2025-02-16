import { create } from 'zustand';

export interface LibraryItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  owner: string;
  lastModified: string;
  url?: string;
}

interface FileStore {
  files: LibraryItem[];
  addFiles: (newFiles: LibraryItem[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  addFiles: (newFiles) => set((state) => ({
    files: [...state.files, ...newFiles]
  })),
  removeFile: (id) => set((state) => ({
    files: state.files.filter(file => file.id !== id)
  })),
  clearFiles: () => set({ files: [] })
}));