import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';

import Header from '../components/Header';
import DocumentCard from '../components/DocumentCard';
import FolderCard from '../components/FolderCard';
import FolderDialog from '../components/FolderDialog';
import Layout from '../components/Layout';
import { Document } from '../models/Document';
import { Folder } from '../models/Folder';
import { getDocuments, deleteDocument } from '../utils/documentUtils';
import { getFolders, getFolderById, saveFolder, deleteFolder } from '../utils/folderUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`folder-tabpanel-${index}`}
      aria-labelledby={`folder-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FolderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [parentFolder, setParentFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [subFolders, setSubFolders] = useState<Folder[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>(undefined);
  
  const isRootFolder = id === 'root';
  const folderId = isRootFolder ? null : id;
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Fetch folder data, including documents and subfolders
  useEffect(() => {
    const fetchFolderData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all folders first (needed for parent-child relationships)
        const folders = await getFolders();
        setAllFolders(folders);
        
        // Get the current folder (except for root)
        if (!isRootFolder && id) {
          const folder = await getFolderById(id);
          if (!folder) {
            setError('Folder not found');
            setLoading(false);
            return;
          }
          setCurrentFolder(folder);
          
          // Get parent folder if it exists
          if (folder.parentId) {
            const parent = folders.find(f => f.id === folder.parentId);
            setParentFolder(parent || null);
          } else {
            setParentFolder(null);
          }
        } else {
          setCurrentFolder(null);
          setParentFolder(null);
        }
        
        // Get sub-folders
        const subFolders = folders.filter(folder => folder.parentId === folderId);
        setSubFolders(subFolders);
        
        // Get documents in this folder
        // For now, we'll filter client-side
        const allDocs = await getDocuments();
        const docsInFolder = allDocs.filter(doc => doc.folderId === folderId);
        setDocuments(docsInFolder);
        
      } catch (err) {
        console.error('Error fetching folder data:', err);
        setError('Failed to load folder data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFolderData();
  }, [id, folderId, isRootFolder]);
  
  const handleCreateFolder = () => {
    setEditingFolder(undefined);
    setFolderDialogOpen(true);
  };
  
  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderDialogOpen(true);
  };
  
  const handleSaveFolder = async (folder: Folder) => {
    try {
      await saveFolder(folder);
      // Refresh the data
      navigate(0);
    } catch (err) {
      console.error('Error saving folder:', err);
      alert('Failed to save folder. Please try again.');
    }
  };
  
  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteFolder(folderId);
      // If we're deleting the current folder, navigate to the parent or root
      if (id === folderId) {
        navigate(parentFolder ? `/folder/${parentFolder.id}` : '/folder/root');
      } else {
        // Just refresh
        navigate(0);
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
      alert('Failed to delete folder. Make sure it is empty first.');
    }
  };
  
  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId);
      setDocuments(documents.filter(doc => doc.id !== docId));
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };
  
  const getFolderPath = () => {
    const parts = [];
    
    // Add root
    parts.push(
      <MuiLink 
        component={Link} 
        to="/folder/root" 
        underline="hover" 
        color="inherit" 
        key="root"
      >
        Root
      </MuiLink>
    );
    
    // If we're in a sub-folder, add the path
    if (currentFolder) {
      parts.push(
        <Typography color="text.primary" key={currentFolder.id}>
          {currentFolder.name}
        </Typography>
      );
    }
    
    return parts;
  };
  
  const getFolderTitle = () => {
    if (isRootFolder) {
      return 'Root';
    }
    return currentFolder?.name || 'Loading...';
  };
  
  return (
    <Layout>
      <Header onSearch={() => {}} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          {getFolderPath()}
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {getFolderTitle()}
          </Typography>
          
          <Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateFolder}
              sx={{ mr: 1 }}
            >
              New Folder
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<DescriptionIcon />}
              component={Link}
              to={`/edit?folder=${folderId || 'root'}`}
            >
              New Document
            </Button>
          </Box>
        </Box>
        
        {currentFolder?.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {currentFolder.description}
          </Typography>
        )}
        
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="folder tabs">
                <Tab 
                  icon={<FolderIcon />} 
                  iconPosition="start" 
                  label={`Folders (${subFolders.length})`} 
                  id="folder-tab-0"
                  aria-controls="folder-tabpanel-0"
                />
                <Tab 
                  icon={<DescriptionIcon />} 
                  iconPosition="start" 
                  label={`Documents (${documents.length})`} 
                  id="folder-tab-1"
                  aria-controls="folder-tabpanel-1"
                />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {subFolders.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {subFolders.map((folder) => (
                    <Box key={folder.id} sx={{ width: { xs: '100%', sm: '47%', md: '31%' }, mb: 2 }}>
                      <FolderCard 
                        folder={folder} 
                        onDelete={handleDeleteFolder}
                        onEdit={handleEditFolder}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No sub-folders found. Create a new folder to organize your documents.
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {documents.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {documents.map((doc) => (
                    <Box key={doc.id} sx={{ width: { xs: '100%', sm: '47%', md: '31%' }, mb: 2 }}>
                      <DocumentCard 
                        document={doc} 
                        onDelete={handleDeleteDocument} 
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No documents in this folder. Create a new document to get started.
                </Typography>
              )}
            </TabPanel>
          </>
        )}
      </Container>
      
      <FolderDialog 
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        onSave={handleSaveFolder}
        editFolder={editingFolder}
        parentFolders={allFolders}
        currentFolderId={folderId}
      />
    </Layout>
  );
};

export default FolderPage;
