export interface LibraryItem {
  id: number;
  type: 'file' | 'folder';
  name: string;
  items: number | null;
  owner: string;
  lastModified: string;
  size: string;
}