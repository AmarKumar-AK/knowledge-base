import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Chip,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { convertFromRaw, EditorState, Editor, CompositeDecorator } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Header from '../components/Header';
import { getDocumentById } from '../utils/documentUtils';
import { Document } from '../models/Document';
import colorStyleMap from '../components/colorStyleMap';

// LinkComponent for the decorator (named differently to avoid conflict with react-router Link)
const LinkComponent = (props: any) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  // Ensure URL is absolute and has a proper protocol
  const formattedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;
  
  return (
    <a 
      href={formattedUrl}
      style={{ color: '#1976d2', textDecoration: 'underline' }}
      target="_blank" 
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
};

// Function to find link entities
const findLinkEntities = (contentBlock: any, callback: any, contentState: any) => {
  contentBlock.findEntityRanges(
    (character: any) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
};

const ViewDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create a decorator for links
  const decorator = useMemo(() => {
    return new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: LinkComponent,
      },
    ]);
  }, []);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const doc = await getDocumentById(id);
        if (doc) {
          setDocument(doc);
          try {
            const contentState = convertFromRaw(JSON.parse(doc.content));
            setEditorState(EditorState.createWithContent(contentState, decorator));
          } catch (e) {
            console.error('Error parsing document content:', e);
            setError('Error parsing document content. The document may be corrupted.');
          }
        } else {
          // Document not found
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load the document. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate, decorator]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Header onSearch={() => {}} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Home
          </MuiLink>
          {!loading && document && <Typography color="text.primary">{document.title}</Typography>}
        </Breadcrumbs>

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
        ) : document && editorState ? (
          <>
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
                {document.updatedAt && document.createdAt && 
                  new Date(document.updatedAt).getTime() > new Date(document.createdAt).getTime() && 
                  ` • Updated: ${formatDate(document.updatedAt)}`
                }
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'transparent',
                    '& .DraftEditor-root': {
                      minHeight: '200px'
                    }
                  }}
                >
                  <Editor
                    editorState={editorState}
                    readOnly={true}
                    onChange={() => {}}
                    customStyleMap={colorStyleMap}
                  />
                </Paper>
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
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Document not found or unable to load content.</Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/"
              sx={{ mt: 2 }}
            >
              Back to Home
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
};

export default ViewDocumentPage;
