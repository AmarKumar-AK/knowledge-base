import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import RichTextEditor from '../components/RichTextEditor';
import Layout from '../components/Layout';
import { getDocumentById, saveDocument } from '../utils/documentUtils';
import { getFolders } from '../utils/folderUtils';
import { Folder } from '../models/Folder';

const EditDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const folderParam = queryParams.get('folder');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderParam === 'root' ? null : folderParam);
  const [isNewDocument, setIsNewDocument] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch folders
        const fetchedFolders = await getFolders();
        setFolders(fetchedFolders);
        
        if (id) {
          const doc = await getDocumentById(id);
          if (doc) {
            setTitle(doc.title);
            setContent(doc.content);
            setTags(doc.tags);
            setSelectedFolderId(doc.folderId);
            setIsNewDocument(false);
          } else {
            // Document not found, redirect to home
            navigate('/folder/root');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load the document for editing. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, folderParam]);

  const handleSave = async (title: string, content: string, tags: string[]) => {
    try {
      const documentToSave = {
        id: id || '',
        title,
        content,
        tags,
        folderId: selectedFolderId,
        createdAt: new Date(), // The server will handle this correctly for updates
        updatedAt: new Date()
      };
      
      const savedDoc = await saveDocument(documentToSave);
      
      // Navigate to the view page for the saved document
      navigate(`/view/${savedDoc.id}`);
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save the document. Please try again.');
    }
  };

  const handleFolderChange = (event: React.ChangeEvent<{ value: unknown }> | any) => {
    const value = event.target.value as string;
    setSelectedFolderId(value === '' ? null : value);
  };
  
  return (
    <Layout>
      <Header onSearch={() => {}} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/folder/root" underline="hover" color="inherit">
            All Documents
          </MuiLink>
          {selectedFolderId && folders.find(f => f.id === selectedFolderId) && (
            <MuiLink 
              component={Link} 
              to={`/folder/${selectedFolderId}`} 
              underline="hover" 
              color="inherit"
            >
              {folders.find(f => f.id === selectedFolderId)?.name}
            </MuiLink>
          )}
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
                to="/folder/root"
                sx={{ mt: 2 }}
              >
                Back to Home
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="folder-select-label">Folder</InputLabel>
                <Select
                  labelId="folder-select-label"
                  id="folder-select"
                  value={selectedFolderId || ''}
                  onChange={handleFolderChange}
                  label="Folder"
                >
                  <MenuItem value="">
                    <em>Root (No Folder)</em>
                  </MenuItem>
                  {folders.map((folder) => (
                    <MenuItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select a folder for this document</FormHelperText>
              </FormControl>
              
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
    </Layout>
  );
};

export default EditDocumentPage;
