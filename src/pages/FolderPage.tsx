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
  Alert
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';

import Header from '../components/Header';
import DocumentCard from '../components/DocumentCard';
import FolderCard from '../components/FolderCard';
import FolderDialog from '../components/FolderDialog';
import Layout from '../components/Layout';
import { Document } from '../models/Document';
import { Folder } from '../models/Folder';
import { getDocuments, deleteDocument, searchDocuments } from '../utils/documentUtils';
import { getFolders, getFolderById, saveFolder, deleteFolder } from '../utils/folderUtils';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [filteredSubFolders, setFilteredSubFolders] = useState<Folder[]>([]);
  
  // Dialog states
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>(undefined);
  
  useEffect(() => {
    if (searchQuery) {
      // Skip this effect as searching is now handled by the handleSearch function
      return;
    } else {
      // If no search query, show all documents and folders in the current folder
      setFilteredDocuments(documents);
      setFilteredSubFolders(subFolders);
    }
  }, [searchQuery, documents, subFolders]);
  
  const isRootFolder = id === 'root';
  const folderId = isRootFolder ? null : id;
  
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
        const subFolders = folders
          .filter(folder => folder.parentId === folderId)
          // Sort sub-folders alphabetically by name
          .sort((a, b) => a.name.localeCompare(b.name));
        setSubFolders(subFolders);
        setFilteredSubFolders(subFolders);
        
        // Get documents in this folder
        // For now, we'll filter client-side
        const allDocs = await getDocuments();
        const docsInFolder = allDocs
          .filter(doc => doc.folderId === folderId)
          // Sort documents alphabetically by title
          .sort((a, b) => a.title.localeCompare(b.title));
        setDocuments(docsInFolder);
        setFilteredDocuments(docsInFolder);
        
      } catch (err) {
        console.error('Error fetching folder data:', err);
        setError('Failed to load folder data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFolderData();
  }, [id, folderId, isRootFolder]);
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search is cleared, show current folder contents
      setFilteredDocuments(documents);
      setFilteredSubFolders(subFolders);
      return;
    }
    
    try {
      // Search through all documents and folders using the search API
      const { documents: searchedDocs, folders: searchedFolders } = await searchDocuments(query);
      
      if (isRootFolder) {
        // In root, show all matching documents and folders
        setFilteredDocuments(searchedDocs);
        setFilteredSubFolders(searchedFolders);
      } else {
        // In a specific folder, show:
        // 1. Documents directly in this folder that match the search
        const matchingDocsInFolder = searchedDocs.filter((doc: Document) => doc.folderId === folderId);
        
        // 2. Subfolders directly in this folder that match the search
        const matchingSubFolders = searchedFolders.filter((folder: Folder) => folder.parentId === folderId);
        
        setFilteredDocuments(matchingDocsInFolder);
        setFilteredSubFolders(matchingSubFolders);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setError('Failed to perform search');
    }
  };
  
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
    // Build an array of folders from current folder up to root
    const buildFolderChain = (folderId: string | null): Folder[] => {
      if (!folderId || folderId === 'root') {
        return [];
      }
      
      const folder = allFolders.find(f => f.id === folderId);
      if (!folder) {
        return [];
      }
      
      // Recursive call to get parent chain
      const parentChain = buildFolderChain(folder.parentId || null);
      return [...parentChain, folder];
    };
    
    const folderChain = currentFolder ? buildFolderChain(currentFolder.id) : [];
    const parts: React.ReactNode[] = [];
    
    // Add root link
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
    
    // Add intermediate folders in the chain
    folderChain.forEach((folder, index) => {
      if (index < folderChain.length - 1) {
        // This is an intermediate folder - should be a link
        parts.push(
          <MuiLink 
            component={Link} 
            to={`/folder/${folder.id}`} 
            underline="hover" 
            color="inherit" 
            key={folder.id}
          >
            {folder.name}
          </MuiLink>
        );
      } else {
        // This is the current folder - should be text
        parts.push(
          <Typography color="text.primary" key={folder.id}>
            {folder.name}
          </Typography>
        );
      }
    });
    
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
      <Header onSearch={handleSearch} />
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                {filteredSubFolders.length > 0 || filteredDocuments.length > 0 ? 
                  `${filteredSubFolders.length + filteredDocuments.length} ${(filteredSubFolders.length + filteredDocuments.length) === 1 ? 'item' : 'items'} available` : 
                  'No items available'}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Show folders first */}
                {filteredSubFolders.map((folder) => (
                  <Box key={folder.id} sx={{ width: { xs: '100%', sm: '47%', md: '31%' }, mb: 2 }}>
                    <FolderCard 
                      folder={folder} 
                      onDelete={handleDeleteFolder}
                      onEdit={handleEditFolder}
                    />
                  </Box>
                ))}
                
                {/* Then show documents */}
                {filteredDocuments.map((doc) => (
                  <Box key={doc.id} sx={{ width: { xs: '100%', sm: '47%', md: '31%' }, mb: 2 }}>
                    <DocumentCard 
                      document={doc} 
                      onDelete={handleDeleteDocument} 
                    />
                  </Box>
                ))}
              </Box>
              
              {filteredSubFolders.length === 0 && filteredDocuments.length === 0 && (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {searchQuery ? 'No items match your search.' : 'No items available. Create a new folder or document to get started.'}
                </Typography>
              )}
            </Box>
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
