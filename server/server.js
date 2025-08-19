const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const DOCUMENTS_DIR = path.join(__dirname, 'documents');
const FOLDERS_DIR = path.join(__dirname, 'folders');

// Ensure directories exist
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

if (!fs.existsSync(FOLDERS_DIR)) {
  fs.mkdirSync(FOLDERS_DIR, { recursive: true });
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
      })
      // Sort documents alphabetically by title
      .sort((a, b) => a.title.localeCompare(b.title));
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
      })
      // Sort search results alphabetically by title
      .sort((a, b) => a.title.localeCompare(b.title));
    
    res.json(documents);
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ message: 'Error searching documents' });
  }
});

// ========== FOLDER ENDPOINTS ==========

// Get all folders
app.get('/api/folders', (req, res) => {
  try {
    const files = fs.readdirSync(FOLDERS_DIR);
    const folders = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const fileContent = fs.readFileSync(path.join(FOLDERS_DIR, file), 'utf8');
        return JSON.parse(fileContent);
      })
      // Sort folders alphabetically by name
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json(folders);
  } catch (error) {
    console.error('Error reading folders:', error);
    res.status(500).json({ message: 'Error fetching folders' });
  }
});

// Get a single folder by ID
app.get('/api/folders/:id', (req, res) => {
  try {
    // Special case for 'root'
    if (req.params.id === 'root') {
      return res.json({
        id: 'root',
        name: 'All Documents',
        description: 'Root folder',
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    const filePath = path.join(FOLDERS_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(fileContent));
  } catch (error) {
    console.error('Error reading folder:', error);
    res.status(500).json({ message: 'Error fetching folder' });
  }
});

// Create a new folder
app.post('/api/folders', (req, res) => {
  try {
    const folder = req.body;
    
    // Generate a unique ID if one isn't provided
    if (!folder.id) {
      folder.id = uuidv4();
    }
    
    // Set creation and update dates
    folder.createdAt = folder.createdAt || new Date().toISOString();
    folder.updatedAt = new Date().toISOString();
    
    const filePath = path.join(FOLDERS_DIR, `${folder.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(folder, null, 2));
    
    res.status(201).json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ message: 'Error creating folder' });
  }
});

// Update an existing folder
app.put('/api/folders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const folder = req.body;
    const filePath = path.join(FOLDERS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Preserve the original creation date
    const existingFolder = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    folder.createdAt = existingFolder.createdAt;
    folder.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(filePath, JSON.stringify(folder, null, 2));
    res.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ message: 'Error updating folder' });
  }
});

// Delete a folder
app.delete('/api/folders/:id', (req, res) => {
  try {
    const filePath = path.join(FOLDERS_DIR, `${req.params.id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Check if folder has documents
    const files = fs.readdirSync(DOCUMENTS_DIR);
    const documents = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const fileContent = fs.readFileSync(path.join(DOCUMENTS_DIR, file), 'utf8');
        return JSON.parse(fileContent);
      });
    
    const hasDocuments = documents.some(doc => doc.folderId === req.params.id);
    if (hasDocuments) {
      return res.status(400).json({ message: 'Cannot delete folder with documents' });
    }
    
    // Check if folder has subfolders
    const folderFiles = fs.readdirSync(FOLDERS_DIR);
    const folders = folderFiles
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const fileContent = fs.readFileSync(path.join(FOLDERS_DIR, file), 'utf8');
        return JSON.parse(fileContent);
      });
    
    const hasSubfolders = folders.some(folder => folder.parentId === req.params.id);
    if (hasSubfolders) {
      return res.status(400).json({ message: 'Cannot delete folder with subfolders' });
    }
    
    fs.unlinkSync(filePath);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ message: 'Error deleting folder' });
  }
});

// Get documents in a folder
app.get('/api/folders/:id/documents', (req, res) => {
  try {
    const folderId = req.params.id === 'root' ? null : req.params.id;
    
    const files = fs.readdirSync(DOCUMENTS_DIR);
    const documents = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const fileContent = fs.readFileSync(path.join(DOCUMENTS_DIR, file), 'utf8');
        return JSON.parse(fileContent);
      })
      .filter(doc => {
        if (folderId === null) {
          return doc.folderId === null || doc.folderId === undefined;
        }
        return doc.folderId === folderId;
      });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents in folder:', error);
    res.status(500).json({ message: 'Error fetching documents in folder' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Documents directory: ${DOCUMENTS_DIR}`);
});
