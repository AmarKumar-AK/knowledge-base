export interface Document {
  id: string;
  title: string;
  content: string; // Will store Draft.js content as a serialized string
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
