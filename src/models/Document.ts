export interface Document {
  id: string;
  title: string;
  content: string; // Will store Draft.js content as a serialized string
  tags: string[];
  folderId: string | null; // Reference to folder (null for documents at root)
  createdAt: Date | string;
  updatedAt: Date | string;
}
