const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const DOCUMENTS_DIR = path.join(__dirname, 'documents');

// Ensure documents directory exists
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Get all documents
app.get('/api/documents', (req, res) => {
  try {
    const files = fs.readdirSync(DOCUMENTS_DIR);
    const documents = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const fileContent = fs.readFileSync(path.join(DOCUMENTS_DIR, file), 'utf8');
        return JSON.parse(fileContent);
      });
    res.json(documents);
  } catch (error) {
    console.error('Error reading documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

// Get a single document by ID
app.get('/api/documents/:id', (req, res) => {
  try {
    const filePath = path.join(DOCUMENTS_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(fileContent));
  } catch (error) {
    console.error('Error reading document:', error);
    res.status(500).json({ message: 'Error fetching document' });
  }
});

// Create a new document
app.post('/api/documents', (req, res) => {
  try {
    const document = req.body;
    
    // Generate a unique ID if one isn't provided
    if (!document.id) {
      document.id = uuidv4();
    }
    
    // Set creation and update dates
    document.createdAt = document.createdAt || new Date().toISOString();
    document.updatedAt = new Date().toISOString();
    
    const filePath = path.join(DOCUMENTS_DIR, `${document.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(document, null, 2));
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Error creating document' });
  }
});

// Update an existing document
app.put('/api/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const document = req.body;
    const filePath = path.join(DOCUMENTS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Preserve the original creation date
    const existingDoc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    document.createdAt = existingDoc.createdAt;
    document.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(filePath, JSON.stringify(document, null, 2));
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Error updating document' });
  }
});

// Delete a document
app.delete('/api/documents/:id', (req, res) => {
  try {
    const filePath = path.join(DOCUMENTS_DIR, `${req.params.id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    fs.unlinkSync(filePath);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
});

// Search documents
app.get('/api/search', (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const files = fs.readdirSync(DOCUMENTS_DIR);
    const documents = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const fileContent = fs.readFileSync(path.join(DOCUMENTS_DIR, file), 'utf8');
        return JSON.parse(fileContent);
      })
      .filter(doc => {
        const lowerQuery = query.toLowerCase();
        return (
          doc.title.toLowerCase().includes(lowerQuery) ||
          doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          doc.content.toLowerCase().includes(lowerQuery)
        );
      });
    
    res.json(documents);
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ message: 'Error searching documents' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Documents directory: ${DOCUMENTS_DIR}`);
});
