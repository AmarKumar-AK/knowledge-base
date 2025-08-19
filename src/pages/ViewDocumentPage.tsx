import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Chip,
  Button,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { convertFromRaw, EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Header from '../components/Header';
import { getDocumentById } from '../utils/documentUtils';
import { Document } from '../models/Document';

const ViewDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  useEffect(() => {
    if (id) {
      const doc = getDocumentById(id);
      if (doc) {
        setDocument(doc);
        try {
          const contentState = convertFromRaw(JSON.parse(doc.content));
          setEditorState(EditorState.createWithContent(contentState));
        } catch (e) {
          console.error('Error parsing document content:', e);
        }
      } else {
        // Document not found
        navigate('/');
      }
    }
  }, [id, navigate]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!document || !editorState) {
    return (
      <>
        <Header onSearch={() => {}} />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography>Loading document...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header onSearch={() => {}} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Home
          </MuiLink>
          <Typography color="text.primary">{document.title}</Typography>
        </Breadcrumbs>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {document.title}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {document.tags.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                sx={{ mr: 0.5, mb: 0.5 }} 
              />
            ))}
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Created: {formatDate(document.createdAt)}
            {document.updatedAt > document.createdAt && 
              ` • Updated: ${formatDate(document.updatedAt)}`
            }
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Editor
              editorState={editorState}
              readOnly={true}
              toolbarHidden={true}
              wrapperClassName="read-only-editor-wrapper"
              editorClassName="read-only-editor"
            />
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" component={Link} to="/">
            Back to Documents
          </Button>
          <Button 
            variant="contained" 
            component={Link} 
            to={`/edit/${document.id}`}
          >
            Edit Document
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default ViewDocumentPage;
