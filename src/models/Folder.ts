export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null; // For nested folders (null for root folders)
  createdAt: Date | string;
  updatedAt: Date | string;
}
