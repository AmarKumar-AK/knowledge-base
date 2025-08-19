import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Breadcrumbs,
  Link as MuiLink
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

  useEffect(() => {
    if (id) {
      const doc = getDocumentById(id);
      if (doc) {
        setTitle(doc.title);
        setContent(doc.content);
        setTags(doc.tags);
        setIsNewDocument(false);
      } else {
        // Document not found, redirect to home
        navigate('/');
      }
    } else {
      // New document
      setTitle('');
      setContent('');
      setTags([]);
      setIsNewDocument(true);
    }
  }, [id, navigate]);

  const handleSave = (title: string, content: string, tags: string[]) => {
    const document = {
      id: id || '',
      title,
      content,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    saveDocument(document);
    
    // Navigate to the view page for the saved document
    if (id) {
      navigate(`/view/${id}`);
    } else {
      // For new documents, we need to get the newly created document to find its ID
      const docs = JSON.parse(localStorage.getItem('documents') || '[]');
      const newDoc = docs.find((d: any) => d.title === title && d.content === content);
      if (newDoc) {
        navigate(`/view/${newDoc.id}`);
      } else {
        navigate('/');
      }
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
          
          <Box sx={{ mt: 3 }}>
            <RichTextEditor
              initialTitle={title}
              initialContent={content}
              initialTags={tags}
              onSave={handleSave}
            />
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default EditDocumentPage;
