import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Folder } from '../models/Folder';
import { useNavigate } from 'react-router-dom';

interface FolderCardProps {
  folder: Folder;
  onDelete: (id: string) => void;
  onEdit: (folder: Folder) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onDelete, onEdit }) => {
  const navigate = useNavigate();
  
  // Format date to a readable string
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleClick = () => {
    navigate(`/folder/${folder.id}`);
  };

  return (
    <Card sx={{ 
      minWidth: 275, 
      mb: 2, 
      height: 200,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8f9fa',
      '&:hover': {
        boxShadow: 3,
        cursor: 'pointer'
      }
    }}>
      <CardContent 
        sx={{ flex: '1 0 auto', pb: 1 }}
        onClick={handleClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <FolderIcon color="primary" sx={{ mr: 1 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              height: '1.5em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {folder.name}
          </Typography>
        </Box>
        
        {folder.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              height: '3em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}
          >
            {folder.description}
          </Typography>
        )}
        
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            display: 'block',
            height: '1.5em',
            overflow: 'hidden'
          }}
        >
          Created: {formatDate(folder.createdAt)}
        </Typography>
        
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            display: 'block',
            height: '1.5em',
            overflow: 'hidden'
          }}
        >
          Updated: {formatDate(folder.updatedAt)}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Edit folder">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(folder);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete folder">
          <IconButton 
            size="small" 
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
                onDelete(folder.id);
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default FolderCard;
