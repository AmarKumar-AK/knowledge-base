import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Folder } from '../models/Folder';

interface FolderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (folder: Folder) => void;
  editFolder?: Folder;
  parentFolders: Folder[];
  currentFolderId?: string | null;
}

const FolderDialog: React.FC<FolderDialogProps> = ({
  open,
  onClose,
  onSave,
  editFolder,
  parentFolders,
  currentFolderId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  
  const isEdit = !!editFolder;

  // When dialog opens or editFolder changes, set initial values
  useEffect(() => {
    if (editFolder) {
      setName(editFolder.name);
      setDescription(editFolder.description || '');
      setParentId(editFolder.parentId || null);
    } else {
      setName('');
      setDescription('');
      setParentId(currentFolderId || null);
    }
  }, [editFolder, open, currentFolderId]);

  const handleSave = () => {
    // Validate
    if (!name.trim()) return;
    
    const folderData: Folder = {
      id: editFolder?.id || '',
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: parentId || null,
      createdAt: editFolder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(folderData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Folder' : 'Create New Folder'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {isEdit 
            ? 'Update the folder details below.' 
            : 'Enter the details for your new folder.'}
        </DialogContentText>
        
        <TextField
          autoFocus
          margin="dense"
          id="folder-name"
          label="Folder Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          id="folder-description"
          label="Description (Optional)"
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth>
          <InputLabel id="parent-folder-label">Parent Folder</InputLabel>
          <Select
            labelId="parent-folder-label"
            id="parent-folder"
            value={parentId || ''}
            label="Parent Folder"
            onChange={(e) => setParentId(e.target.value === '' ? null : e.target.value)}
          >
            <MenuItem value="">
              <em>Root (No Parent)</em>
            </MenuItem>
            
            {parentFolders
              .filter(f => f.id !== editFolder?.id) // Can't set parent to self
              .map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  {folder.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary"
          disabled={!name.trim()}
        >
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FolderDialog;
