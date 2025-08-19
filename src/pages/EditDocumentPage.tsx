import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Button
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import RichTextEditor from '../components/RichTextEditor';
import { getDocumentById, saveDocument } from '../utils/documentUtils';

const EditDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isNewDocument, setIsNewDocument] = useState(true);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [, setSaving] = useState(false); // Using underscore to indicate unused variable

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const doc = await getDocumentById(id);
        if (doc) {
          setTitle(doc.title);
          setContent(doc.content);
          setTags(doc.tags);
          setIsNewDocument(false);
        } else {
          // Document not found, redirect to home
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load the document for editing. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate]);

  const handleSave = async (title: string, content: string, tags: string[]) => {
    setSaving(true);
    try {
      const documentToSave = {
        id: id || '',
        title,
        content,
        tags,
        createdAt: new Date(), // The server will handle this correctly for updates
        updatedAt: new Date()
      };
      
      const savedDoc = await saveDocument(documentToSave);
      
      // Navigate to the view page for the saved document
      navigate(`/view/${savedDoc.id}`);
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save the document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header onSearch={() => {}} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Home
          </MuiLink>
          <Typography color="text.primary">
            {isNewDocument ? 'New Document' : `Edit: ${title}`}
          </Typography>
        </Breadcrumbs>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isNewDocument ? 'Create New Document' : 'Edit Document'}
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error">{error}</Typography>
              <Button 
                variant="contained" 
                component={Link} 
                to="/"
                sx={{ mt: 2 }}
              >
                Back to Home
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 3 }}>
              <RichTextEditor
                initialTitle={title}
                initialContent={content}
                initialTags={tags}
                onSave={handleSave}
              />
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default EditDocumentPage;
