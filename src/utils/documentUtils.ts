import { Document } from '../models/Document';

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

// Simple storage utility functions
export const getDocuments = (): Document[] => {
  const storedDocs = localStorage.getItem('documents');
  return storedDocs ? JSON.parse(storedDocs) : mockDocuments;
};

export const saveDocument = (document: Document): void => {
  const docs = getDocuments();
  const existingIndex = docs.findIndex(doc => doc.id === document.id);
  
  if (existingIndex >= 0) {
    // Update existing document
    docs[existingIndex] = {
      ...document,
      updatedAt: new Date()
    };
  } else {
    // Add new document
    docs.push({
      ...document,
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  localStorage.setItem('documents', JSON.stringify(docs));
};

export const deleteDocument = (id: string): void => {
  const docs = getDocuments();
  const updatedDocs = docs.filter(doc => doc.id !== id);
  localStorage.setItem('documents', JSON.stringify(updatedDocs));
};

export const getDocumentById = (id: string): Document | undefined => {
  const docs = getDocuments();
  return docs.find(doc => doc.id === id);
};

// Simple search function
export const searchDocuments = (query: string): Document[] => {
  if (!query.trim()) return getDocuments();
  
  const docs = getDocuments();
  const lowerQuery = query.toLowerCase();
  
  return docs.filter(doc => 
    doc.title.toLowerCase().includes(lowerQuery) || 
    doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    doc.content.toLowerCase().includes(lowerQuery)
  );
};
