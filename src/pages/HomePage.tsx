import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import DocumentCard from '../components/DocumentCard';
import Header from '../components/Header';
import { Document } from '../models/Document';
import { getDocuments, deleteDocument, searchDocuments } from '../utils/documentUtils';

const HomePage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load documents from storage
    const docs = searchQuery 
      ? searchDocuments(searchQuery) 
      : getDocuments();
    setDocuments(docs);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteDocument = (id: string) => {
    deleteDocument(id);
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Knowledge Base
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} available
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <Box key={doc.id} sx={{ width: { xs: '100%', sm: '47%', md: '31%' }, mb: 2 }}>
                <DocumentCard 
                  document={doc} 
                  onDelete={handleDeleteDocument} 
                />
              </Box>
            ))
          ) : (
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1" color="text.secondary" align="center">
                {searchQuery 
                  ? 'No documents match your search query.' 
                  : 'No documents available. Create your first document by clicking "New Document".'}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
