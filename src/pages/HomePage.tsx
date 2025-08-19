import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import DocumentCard from '../components/DocumentCard';
import Header from '../components/Header';
import { Document } from '../models/Document';
import { getDocuments, deleteDocument, searchDocuments } from '../utils/documentUtils';

const HomePage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const docs = searchQuery 
          ? await searchDocuments(searchQuery) 
          : await getDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Knowledge Base
          </Typography>
          {!loading && (
            <Typography variant="subtitle1" color="text.secondary">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} available
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
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
        )}
      </Container>
    </>
  );
};

export default HomePage;
