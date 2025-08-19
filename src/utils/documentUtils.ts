import { Document } from '../models/Document';

// API URL
const API_URL = 'http://localhost:5000/api';

// Get all documents from API
export const getDocuments = async (): Promise<Document[]> => {
  try {
    const response = await fetch(`${API_URL}/documents`);
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    const documents = await response.json();
    return documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Save document to API
export const saveDocument = async (document: Document): Promise<Document> => {
  try {
    const method = document.id ? 'PUT' : 'POST';
    const url = document.id 
      ? `${API_URL}/documents/${document.id}` 
      : `${API_URL}/documents`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(document)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save document');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

// Delete document from API
export const deleteDocument = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Get a document by ID from API
export const getDocumentById = async (id: string): Promise<Document | undefined> => {
  try {
    const response = await fetch(`${API_URL}/documents/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error('Failed to fetch document');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching document:', error);
    return undefined;
  }
};

// Search documents through API
export const searchDocuments = async (query: string): Promise<Document[]> => {
  if (!query.trim()) return getDocuments();
  
  try {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search documents');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching documents:', error);
    // Return empty array if search fails
    return [];
  }
};
