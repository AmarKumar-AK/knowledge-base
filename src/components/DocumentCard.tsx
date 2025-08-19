import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Chip,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Document } from '../models/Document';
import { useNavigate } from 'react-router-dom';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  const navigate = useNavigate();
  
  // Format date to a readable string
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card sx={{ 
      minWidth: 275, 
      mb: 2, 
      height: 200, // Match folder card height
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8f9fa', // Match folder card background
      '&:hover': {
        boxShadow: 3,
        cursor: 'pointer'
      }
    }}>
      <CardContent 
        sx={{ flex: '1 0 auto', pb: 1 }}
        onClick={() => navigate(`/view/${document.id}`)}
      >
        {/* Document title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <DescriptionIcon color="primary" sx={{ mr: 1 }} />
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
            {document.title}
          </Typography>
        </Box>
        
        {/* Area for tags */}
        <Box sx={{ 
          height: '3em', // Match the height of the description in FolderCard
          overflow: 'hidden',
          mb: 2
        }}>
          {document.tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.75 }}
            />
          ))}
        </Box>
        
        {/* Updated date */}
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            display: 'block',
            height: '1.5em',
            overflow: 'hidden'
          }}
        >
          Updated: {formatDate(document.updatedAt)}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Edit document">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit/${document.id}`);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete document">
          <IconButton 
            size="small" 
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
                onDelete(document.id);
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

export default DocumentCard;
