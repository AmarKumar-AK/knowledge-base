import { Document } from '../models/Document';

// API URL
const API_URL = 'http://localhost:5000/api';

// Mock data for initial development
export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Getting Started with Our Knowledge Base',
    content: '{"blocks":[{"key":"9pv7n","text":"Welcome to our Knowledge Management Tool! This is a simple guide to help you get started.","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":16,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"e23a8","text":"Features:","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"ah3sp","text":"- Rich text editing","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"fd71s","text":"- Document organization with tags","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7uiop","text":"- Powerful search functionality","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}',
    tags: ['guide', 'introduction'],
    createdAt: new Date('2025-08-10T10:00:00Z'),
    updatedAt: new Date('2025-08-10T10:00:00Z')
  },
  {
    id: '2',
    title: 'Markdown Cheat Sheet',
    content: '{"blocks":[{"key":"a1b2c","text":"Markdown Cheat Sheet","type":"header-one","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"d3e4f","text":"Basic Syntax:","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"g5h6i","text":"# Heading 1","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"j7k8l","text":"## Heading 2","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"m9n0o","text":"**Bold Text**","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"p1q2r","text":"*Italic Text*","type":"code-block","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}',
    tags: ['markdown', 'formatting', 'reference'],
    createdAt: new Date('2025-08-11T14:30:00Z'),
    updatedAt: new Date('2025-08-12T09:15:00Z')
  },
  {
    id: '3',
    title: 'Project Documentation Guidelines',
    content: '{"blocks":[{"key":"s3t4u","text":"Project Documentation Guidelines","type":"header-one","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"v5w6x","text":"Consistent documentation is crucial for project success. Follow these guidelines for all project documentation.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"y7z8a","text":"Required Sections:","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"b9c0d","text":"1. Overview","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"e1f2g","text":"2. Architecture","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"h3i4j","text":"3. Implementation Details","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"k5l6m","text":"4. API Documentation","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"n7o8p","text":"5. Testing Strategy","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}',
    tags: ['guidelines', 'documentation', 'project'],
    createdAt: new Date('2025-08-15T11:20:00Z'),
    updatedAt: new Date('2025-08-17T16:45:00Z')
  }
];

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
    // Return mock data if API fails
    return mockDocuments;
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
    // Return mock data if API fails
    return mockDocuments.find(doc => doc.id === id);
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
    
    // Fallback to client-side search if API fails
    const docs = mockDocuments;
    const lowerQuery = query.toLowerCase();
    
    return docs.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) || 
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      doc.content.toLowerCase().includes(lowerQuery)
    );
  }
};
