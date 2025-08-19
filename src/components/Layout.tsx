import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Button
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useLocation } from 'react-router-dom';
import { Folder } from '../models/Folder';
import { getFolders, saveFolder } from '../utils/folderUtils';
import FolderDialog from './FolderDialog';

interface LayoutProps {
  children: React.ReactNode;
}

// Width of the drawer
const drawerWidth = 280;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>(undefined);
  
  // Current active folder (from URL)
  const currentFolderId = location.pathname.startsWith('/folder/') 
    ? location.pathname.split('/folder/')[1]
    : null;
  
  // Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const fetchedFolders = await getFolders();
        setFolders(fetchedFolders);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
    
    fetchFolders();
  }, []);
  
  // Build folder tree
  const buildFolderTree = (parentId: string | null = null, level = 0): React.ReactNode => {
    const subfolders = folders.filter(folder => folder.parentId === parentId);
    
    if (subfolders.length === 0 && level === 0) {
      return (
        <ListItem>
          <ListItemText 
            primary="No folders yet" 
            secondary="Create a folder to organize your documents"
            primaryTypographyProps={{ color: 'text.secondary' }}
          />
        </ListItem>
      );
    }
    
    return subfolders.map(folder => {
      const isExpanded = expandedFolders[folder.id] || false;
      const hasChildren = folders.some(f => f.parentId === folder.id);
      const isActive = currentFolderId === folder.id;
      
      return (
        <React.Fragment key={folder.id}>
          <ListItem 
            disablePadding
            sx={{ 
              pl: level * 2, 
              backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              borderLeft: isActive ? 3 : 0,
              borderColor: 'primary.main',
            }}
          >
            <ListItemButton
              onClick={() => navigate(`/folder/${folder.id}`)}
              dense
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isActive ? <FolderOpenIcon color="primary" /> : <FolderIcon />}
              </ListItemIcon>
              <ListItemText 
                primary={folder.name} 
                secondary={folder.description}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}
                secondaryTypographyProps={{
                  noWrap: true,
                  variant: 'caption'
                }}
              />
              {hasChildren && (
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFolders(prev => ({
                      ...prev,
                      [folder.id]: !prev[folder.id]
                    }));
                  }}
                >
                  {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              )}
            </ListItemButton>
          </ListItem>
          
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {buildFolderTree(folder.id, level + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };
  
  const handleCreateFolder = () => {
    setEditingFolder(undefined);
    setFolderDialogOpen(true);
  };
  
  const handleSaveFolder = async (folder: Folder) => {
    try {
      // Use the saveFolder utility function
      await saveFolder(folder);
      
      // Refresh the folders list
      const updatedFolders = await getFolders();
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error saving folder:', error);
    }
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Side navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            pt: 8, // Add space for the header
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: 2,
          py: 1
        }}>
          <Typography variant="h6" color="primary">
            Folders
          </Typography>
          <Tooltip title="Create new folder">
            <IconButton color="primary" onClick={handleCreateFolder}>
              <CreateNewFolderIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Divider />
        
        <List>
          <ListItem 
            disablePadding
            sx={{ 
              backgroundColor: currentFolderId === 'root' || !currentFolderId 
                ? 'rgba(25, 118, 210, 0.08)' 
                : 'transparent',
              borderLeft: (currentFolderId === 'root' || !currentFolderId) ? 3 : 0,
              borderColor: 'primary.main',
            }}
          >
            <ListItemButton 
              onClick={() => navigate('/folder/root')}
              dense
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText 
                primary="All Documents" 
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: (currentFolderId === 'root' || !currentFolderId) ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        
        <Divider />
        
        <List>
          {buildFolderTree()}
        </List>
        
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => navigate('/edit')}
          >
            New Document
          </Button>
        </Box>
      </Drawer>
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 0, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        {children}
      </Box>
      
      {/* Folder Dialog */}
      <FolderDialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        onSave={handleSaveFolder}
        editFolder={editingFolder}
        parentFolders={folders}
        currentFolderId={currentFolderId === 'root' ? null : currentFolderId}
      />
    </Box>
  );
};

export default Layout;
